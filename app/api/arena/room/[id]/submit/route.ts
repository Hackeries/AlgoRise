import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { judgeSubmission, storeSubmission, calculateICPCScore } from '@/lib/judge';

export async function POST(
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const battleId = params.id;
    const { code, language, problemId, teamId } = await request.json();
    // determine teamId if not provided by looking up user's team in this battle
    let effectiveTeamId = teamId as string | undefined;
    if (!effectiveTeamId) {
      const { data: teamMembership } = await supabase
        .from('battle_teams')
        .select('id, battle_id, battle_team_players(user_id)')
        .eq('battle_id', battleId);
      const myTeam = (teamMembership || []).find(
        (t: any) => (t.battle_team_players || []).some((p: any) => p.user_id === user.id)
      );
      if (myTeam) effectiveTeamId = (myTeam as any).id as string;
    }

    // Judge the submission
    const judgeResult = await judgeSubmission({
      code,
      language,
      problemId,
      battleId,
      teamId: effectiveTeamId,
      userId: user.id,
    } as any);

    // Store submission
    const submission = await storeSubmission(
      battleId,
      user.id,
      problemId,
      code,
      language,
      judgeResult.verdict,
      judgeResult.penalty || 0,
      effectiveTeamId
    );

    // Recompute scoreboard for all teams in battle and broadcast update
    const { data: teams } = await supabase
      .from('battle_teams')
      .select('id, team_name')
      .eq('battle_id', battleId);

    const scoreboard = [] as Array<{ teamId: string; teamName: string; score: number; penaltyTime: number }>;
    for (const t of teams || []) {
      const icpc = await calculateICPCScore(battleId, t.id);
      scoreboard.push({
        teamId: t.id,
        teamName: t.team_name as any,
        score: icpc.problemsSolved,
        penaltyTime: icpc.penaltyTime,
      });
    }
    scoreboard.sort((a, b) => (a.score === b.score ? a.penaltyTime - b.penaltyTime : b.score - a.score));

    await supabase.channel(`battle:${battleId}`).send({
      type: 'broadcast',
      event: 'battle_update',
      payload: {
        type: 'scoreboard_update',
        scoreboard,
      },
    } as any);

    await supabase.channel(`battle:${battleId}`).send({
      type: 'broadcast',
      event: 'submission',
      payload: {
        submission,
        verdict: judgeResult.verdict,
        penalty: judgeResult.penalty,
      },
    } as any);

    return NextResponse.json({
      submission,
      verdict: judgeResult.verdict,
      penalty: judgeResult.penalty,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
