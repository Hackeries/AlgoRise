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

    // Derive problems for the battle
    // If battle has explicit problem_set_id -> fetch first few problems from that set
    // Otherwise, fallback to a lightweight selection from user_problems by problem_id
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

    if (problems.length === 0 && (battle as any).problem_ids) {
      const { data: fallbackProblems } = await supabase
        .from('user_problems')
        .select('*')
        .in('problem_id', (battle as any).problem_ids)
        .limit(5);
      problems = fallbackProblems || [];
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
      .select('*')
      .eq('battle_id', battleId)
      .order('submitted_at', { ascending: false });

    // Build scoreboard summary from teams + submissions (ICPC-like)
    const teamScores = (teams || []).map((t: any) => {
      const teamSubs = (submissions || []).filter(s => s.team_id === t.id);
      const solved = new Set(
        teamSubs.filter(s => s.verdict === 'AC').map(s => s.problem_id)
      ).size;
      const penalty = teamSubs.reduce((acc, s) => acc + (s.penalty || 0), 0);
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
      submissions,
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