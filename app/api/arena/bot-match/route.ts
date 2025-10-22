import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import {
  getUserCodeforcesRating,
  calculateProblemRatingRange,
} from '@/lib/battle-arena/matchmaking';

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

    // Create battle
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

    // Create bot team
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

    // Get problem rating range
    const ratingRange = calculateProblemRatingRange(userRating, botRating);

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