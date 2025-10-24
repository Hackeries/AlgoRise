import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { calculateEloChange, getUserBattleRating } from '@/lib/battle-arena/matchmaking';

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

    const battleId = params.id;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Load teams and compute final scoreboard
    const service = await createServiceRoleClient();
    if (!service) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

    const { data: teams } = await service
      .from('battle_teams')
      .select('id, team_name')
      .eq('battle_id', battleId);

    const { data: subs } = await service
      .from('battle_submissions')
      .select('team_id, problem_id, verdict, penalty, submitted_at')
      .eq('battle_id', battleId);

    const teamScores = (teams || []).map((t: any) => {
      const tsubs = (subs || []).filter((s: any) => s.team_id === t.id);
      const solved = new Set(
        tsubs.filter((s: any) => s.verdict === 'AC').map((s: any) => s.problem_id)
      ).size;
      const penalty = tsubs.reduce((acc: number, s: any) => acc + (s.penalty || 0), 0);
      return { teamId: t.id, teamName: t.team_name, score: solved, penaltyTime: penalty };
    });
    teamScores.sort((a, b) => (a.score === b.score ? a.penaltyTime - b.penaltyTime : b.score - a.score));

    // Determine winner team id (first one)
    const winnerTeamId = teamScores[0]?.teamId || null;

    // Persist battle end
    await service
      .from('battles')
      .update({ status: 'completed', end_at: new Date().toISOString(), winner_id: null })
      .eq('id', battleId);

    // Update ratings per user for 1v1; per team for 3v3
    const { data: battle } = await service
      .from('battles')
      .select('mode')
      .eq('id', battleId)
      .single();

    if (battle?.mode === '1v1' && (teams || []).length === 2) {
      // Map team -> user ids
      const { data: teamPlayers } = await service
        .from('battle_team_players')
        .select('team_id, user_id')
        .in('team_id', (teams || []).map((t: any) => t.id));

      const teamToUser = new Map<string, string>();
      (teamPlayers || []).forEach((p: any) => teamToUser.set(p.team_id, p.user_id));

      const t1 = teams![0].id as string;
      const t2 = teams![1].id as string;
      const u1 = teamToUser.get(t1)!;
      const u2 = teamToUser.get(t2)!;

      const r1 = await getUserBattleRating(u1, '1v1');
      const r2 = await getUserBattleRating(u2, '1v1');
      const winnerIsT1 = winnerTeamId === t1;
      const { winnerChange, loserChange } = calculateEloChange(winnerIsT1 ? r1 : r2, winnerIsT1 ? r2 : r1);

      // Upsert ratings
      await service
        .from('battle_ratings')
        .upsert(
          [
            { entity_id: u1, entity_type: 'user', mode: '1v1', elo: r1 + (winnerIsT1 ? winnerChange : loserChange) },
            { entity_id: u2, entity_type: 'user', mode: '1v1', elo: r2 + (winnerIsT1 ? loserChange : winnerChange) },
          ],
          { onConflict: 'entity_id,entity_type,mode' }
        );

      // Insert battle_history rows (simplified winner/loser)
      await service.from('battle_history').insert(
        [
          { battle_id: battleId, user_id: u1, team_id: t1, result: winnerIsT1 ? 'win' : 'loss', elo_change: winnerIsT1 ? winnerChange : loserChange },
          { battle_id: battleId, user_id: u2, team_id: t2, result: winnerIsT1 ? 'loss' : 'win', elo_change: winnerIsT1 ? loserChange : winnerChange },
        ]
      );
    }

    // Broadcast final scoreboard
    await supabase.channel(`battle:${battleId}`).send({
      type: 'broadcast',
      event: 'battle_update',
      payload: { type: 'scoreboard_update', scoreboard: teamScores },
    } as any);

    return NextResponse.json({ success: true, scoreboard: teamScores });
  } catch (error) {
    console.error('Battle end error:', error);
    return NextResponse.json({ error: 'Failed to finalize battle' }, { status: 500 });
  }
}
