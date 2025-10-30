import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateBattleProblems } from '@/lib/arena/problem-generator';
import { getUserCodeforcesRating } from '@/lib/battle-arena/matchmaking';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const battleId = params.id;

    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    // Fetch teams (with players) early to detect bot matches and compute rating
    const { data: teams } = await supabase
      .from('battle_teams')
      .select(
        `
        *,
        battle_team_players(user_id, role)
      `
      )
      .eq('battle_id', battleId);

    // Determine if this is a bot battle (team_name starts with "Bot (")
    const botTeam = (teams || []).find(t => (t as any).team_name?.startsWith('Bot (')) as any | undefined;
    const humanTeam = (teams || []).find(t => !(t as any).team_name?.startsWith('Bot (')) as any | undefined;

    // Derive problems for the battle
    let problems: any[] = [];

    if (botTeam) {
      // Internal problem generation for bot battles, fixed by battle id
      let baseRating = 1500;
      try {
        const humanUserId = (humanTeam?.battle_team_players || [])[0]?.user_id as string | undefined;
        if (humanUserId) {
          baseRating = await getUserCodeforcesRating(humanUserId);
        }
      } catch {}
      problems = generateBattleProblems({ rating: baseRating, count: 3, seed: battleId }).map(p => ({
        ...p,
      }));
    } else if ((battle as any).problem_set_id) {
      // If linked to a contest, load problem rows and map to internal shape
      const { data: cps } = await supabase
        .from('contest_problems')
        .select('problem_id, title, rating')
        .eq('contest_id', (battle as any).problem_set_id)
        .order('points', { ascending: true });
      problems = (cps || []).slice(0, 3).map((p: any, idx: number) => ({
        id: p.problem_id,
        name: p.title || p.problem_id,
        rating: p.rating || undefined,
        description:
          '<p>Contest problem. Full statement available in the arena.</p>',
        examples: [],
        constraints: '',
        timeLimit: 2,
        memoryLimit: 256,
        difficulty: idx === 0 ? 'easy' : idx === 1 ? 'medium' : 'hard',
        source: 'Internal',
      }));
    }

    // As a final fallback (non-bot battles only), keep empty problems array

    // teams already fetched above

    const { data: submissions } = await supabase
      .from('battle_submissions')
      .select('id, team_id, user_id, problem_id, verdict, penalty, submitted_at, language')
      .eq('battle_id', battleId)
      .order('submitted_at', { ascending: false });

    // Build scoreboard summary from teams + submissions (ICPC-like)
    const teamScores = (teams || []).map((t: any) => {
      const teamSubs = (submissions || []).filter((s: any) => s.team_id === t.id);
      const solved = new Set(
        teamSubs.filter((s: any) => s.verdict === 'AC').map((s: any) => s.problem_id)
      ).size;
      const penalty = teamSubs.reduce((acc: number, s: any) => acc + (s.penalty || 0), 0);
      return {
        teamId: t.id,
        teamName: t.team_name,
        score: solved,
        penaltyTime: penalty,
      };
    });

    // If bot battle, overlay bot's simulated progress onto its team
    if (botTeam) {
      // Compute elapsed time since battle start
      const startAtIso = (battle as any).start_at || (battle as any).created_at;
      const startMs = startAtIso ? new Date(startAtIso).getTime() : Date.now();
      const elapsedMs = Math.max(0, Date.now() - startMs);
      const contestDurationMs = 45 * 60 * 1000; // 45 minutes

      // Parse bot rating from name e.g., "Bot (1520)"
      const m = String(botTeam.team_name || '').match(/Bot\s*\((\d+)\)/i);
      const botRating = m ? parseInt(m[1], 10) : 1500;

      // Derive base rating as in problems generation
      let baseRating = 1500;
      try {
        const humanUserId = (humanTeam?.battle_team_players || [])[0]?.user_id as string | undefined;
        if (humanUserId) baseRating = await getUserCodeforcesRating(humanUserId);
      } catch {}

      // Deterministic seeded RNG
      const seed = `${battleId}-bot`;
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      let t = h >>> 0;
      const rand = () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };

      const ratingDiff = botRating - baseRating;
      const baseSuccess = Math.max(0.3, Math.min(0.9, 0.6 + (ratingDiff / 500) * 0.2));

      // Plan 3 problems with E/M/H multipliers
      const difficultyMultipliers = [0.8, 1.0, 1.25];
      const difficultyOffsets = [0.15, 0.0, -0.15];

      let botSolved = 0;
      let botPenalty = 0;
      for (let i = 0; i < Math.min(3, problems.length || 3); i++) {
        const successProb = Math.max(
          0.1,
          Math.min(0.95, baseSuccess + difficultyOffsets[i]!)
        );
        const willSolve = rand() < successProb;
        // Triangular-ish distribution around 15 min, scaled by multiplier and rating diff
        const baseMean = 15 * 60 * 1000 * difficultyMultipliers[i]!;
        const ratingBoost = -((ratingDiff / 500) * 5 * 60 * 1000); // faster if stronger
        const u1 = rand();
        const u2 = rand();
        const timeNoise = ((u1 + u2) / 2 - 0.5) * 6 * 60 * 1000; // +/- ~3 min
        const solveTime = Math.max(3 * 60 * 1000, baseMean + ratingBoost + timeNoise);

        if (willSolve && elapsedMs >= solveTime && solveTime <= contestDurationMs) {
          botSolved += 1;
          // Wrong attempts before AC: 0-2 average based on (1 - successProb)
          const expectedWrongs = Math.max(0, Math.min(2, (1 - successProb) * 3));
          const wrongs = Math.floor(expectedWrongs + rand());
          botPenalty += Math.floor(solveTime / 60000) + wrongs * 20;
        }
      }

      // Replace bot team entry in scoreboard
      const idx = teamScores.findIndex(ts => ts.teamId === botTeam.id);
      if (idx >= 0) {
        teamScores[idx] = {
          teamId: botTeam.id,
          teamName: botTeam.team_name,
          score: botSolved,
          penaltyTime: botPenalty,
        } as any;
      }
    }

    return NextResponse.json({
      battle,
      problems: problems || [],
      teams,
      submissions: (submissions || []).map((s: any) => ({
        id: s.id,
        problemId: s.problem_id,
        verdict: s.verdict,
        executionTime: s.execution_time || 0,
        memory: s.memory || 0,
        submittedAt: s.submitted_at,
        language: s.language || 'cpp',
      })),
      scoreboard: teamScores.sort((a, b) =>
        a.score === b.score ? a.penaltyTime - b.penaltyTime : b.score - a.score
      ),
    });
  } catch (error) {
    console.error('Room fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}
