import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    // Derive problems for the battle: if no problem_set_id, generate from CF by rating window
    let problems: any[] = [];
    if ((battle as any).problem_set_id) {
      const { data: contest } = await supabase
        .from('contests')
        .select('problems')
        .eq('id', (battle as any).problem_set_id)
        .single();
      if (contest?.problems && Array.isArray(contest.problems)) {
        problems = contest.problems.slice(0, 5);
      }
    }

    if (problems.length === 0) {
      try {
        const ratingMin = 1000;
        const ratingMax = 1600;
        const origin = request.nextUrl.origin;
        const resp = await fetch(`${origin}/api/practice/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: 5, ratingMin, ratingMax }),
        });
        if (resp.ok) {
          const json = await resp.json();
          problems = (json.problems || []).map((p: any) => ({
            id: `${p.contestId}${p.index}`,
            name: p.name,
            rating: p.rating,
            description: p.statement || 'Solve the problem from Codeforces.',
            examples: [],
            constraints: '',
            timeLimit: 2,
            memoryLimit: 256,
            difficulty: p.rating <= 1200 ? 'easy' : p.rating <= 1700 ? 'medium' : 'hard',
            source: 'Codeforces',
            contestUrl: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
          }));
        }
      } catch (_) {}
    }

    const { data: teams } = await supabase
      .from('battle_teams')
      .select(
        `
        *,
        battle_team_players(user_id, role)
      `
      )
      .eq('battle_id', battleId);

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