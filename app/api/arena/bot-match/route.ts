import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import {
  getUserCodeforcesRating,
  calculateProblemRatingRange,
} from '@/lib/battle-arena/matchmaking';
import { generateBattleProblems } from '@/lib/arena/problem-generator';
import { simulateBotSubmissions } from '@/lib/battle-arena/bot-simulator';

export async function POST(request: NextRequest) {
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
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode } = await request.json();

    // Get user's CF rating
    const userRating = await getUserCodeforcesRating(user.id);

    // Bot difficulty = user rating ± configurable offset (let's use ±50)
    const botRating = userRating + (Math.random() > 0.5 ? 50 : -50);

    // Create battle (45 minute duration)
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        mode,
        status: 'active',
        start_at: new Date().toISOString(),
        end_at: null,
      })
      .select()
      .single();

    if (battleError || !battle) {
      return NextResponse.json(
        { error: 'Failed to create battle' },
        { status: 500 }
      );
    }

    // Create user team
    const { data: userTeam } = await supabase
      .from('battle_teams')
      .insert({
        battle_id: battle.id,
        team_name: `Your Team`,
        score: 0,
        penalty_time: 0,
      })
      .select()
      .single();

    // Create bot team (embed bot rating into name for quick identification)
    const { data: botTeam } = await supabase
      .from('battle_teams')
      .insert({
        battle_id: battle.id,
        team_name: `Bot (${botRating})`,
        score: 0,
        penalty_time: 0,
      })
      .select()
      .single();

    // Add user to team
    if (userTeam) {
      await supabase.from('battle_team_players').insert({
        team_id: userTeam.id,
        user_id: user.id,
        role: 'captain',
      });
    }

    // Generate and persist internal problems for this battle (fixed for duration)
    const internalProblems = generateBattleProblems({ rating: userRating, count: 3, seed: battle.id });

    // Option A: store directly on battles via a JSONB column (not present in schema)
    // Option B: create a private contests row and link problem_set_id
    // We'll use a simple private contest with three problems for re-use.
    const { data: contest, error: contestErr } = await supabase
      .from('contests')
      .insert({
        name: `Arena Set ${battle.id.slice(0, 8)}`,
        description: 'Arena problem set',
        visibility: 'private',
        status: 'running',
        host_user_id: user.id,
        duration_minutes: 45,
        problem_count: 3,
        rating_min: Math.max(800, userRating),
        rating_max: userRating + 200,
        contest_mode: 'icpc',
      })
      .select()
      .single();

    if (!contest && contestErr) {
      // If contest table not usable due to RLS or schema, we will continue without linking
    } else if (contest) {
      // Insert the problems as contest_problems for consistency
      const rows = internalProblems.map((p, idx) => ({
        contest_id: contest.id,
        problem_id: p.id,
        title: p.name,
        points: idx === 0 ? 1 : idx === 1 ? 2 : 3,
        rating: p.rating ?? null,
      }));
      await supabase.from('contest_problems').insert(rows);
      // Link battle to this problem set
      await supabase.from('battles').update({ problem_set_id: contest.id }).eq('id', battle.id);
    }

    const ratingRange = calculateProblemRatingRange(userRating, botRating);

    // Fire-and-forget bot simulation (best-effort in long-lived runtimes)
    if (botTeam?.id) {
      // Do not await; let it schedule timeouts
      simulateBotSubmissions(battle.id, botTeam.id, botRating, userRating, 3).catch(() => {});
    }

    return NextResponse.json({
      battleId: battle.id,
      userTeamId: userTeam?.id,
      botTeamId: botTeam?.id,
      botRating,
      problemRatingRange: ratingRange,
      isBot: true,
    });
  } catch (error) {
    console.error('[v0] Bot match error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}