import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMatchmakingRange } from '@/lib/arena/elo'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit'
import type { MatchType, MatchMode } from '@/types/arena'

// matchmaking has strict rate limits to prevent abuse
const MATCHMAKING_RATE_LIMIT = { windowMs: 60 * 1000, maxRequests: 5 }

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // apply rate limiting
    const rateLimited = await checkRateLimit(req, 'arena_matchmaking', MATCHMAKING_RATE_LIMIT, user.id)
    if (rateLimited) return rateLimited

    // Parse request body
    const body = await req.json();
    const { matchType, mode } = body as { matchType: MatchType; mode: MatchMode };

    if (!matchType || !mode) {
      return NextResponse.json(
        { error: 'Missing matchType or mode' },
        { status: 400 }
      );
    }

    // Check if ranked mode requires Pro subscription
    if (mode === 'ranked') {
      const { data: canPlay, error: canPlayError } = await supabase.rpc(
        'can_play_ranked_match',
        { p_user_id: user.id }
      );

      if (canPlayError || !canPlay) {
        return NextResponse.json(
          { error: 'Ranked matches require Pro subscription', requiresPro: true },
          { status: 403 }
        );
      }
    }

    // Check daily limit for free users
    const { data: canPlayToday, error: limitError } = await supabase.rpc(
      'check_daily_match_limit',
      { p_user_id: user.id }
    );

    if (limitError || !canPlayToday) {
      return NextResponse.json(
        { error: 'Daily match limit reached', requiresPro: true },
        { status: 403 }
      );
    }

    // Get or create player rating
    let { data: rating, error: ratingError } = await supabase
      .from('arena_ratings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (ratingError || !rating) {
      // Create initial rating
      const { data: newRating, error: createError } = await supabase
        .from('arena_ratings')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (createError || !newRating) {
        return NextResponse.json(
          { error: 'Failed to create rating' },
          { status: 500 }
        );
      }
      rating = newRating;
    }

    const playerElo = matchType === '1v1' ? rating.elo_1v1 : rating.elo_3v3;
    const matchesPlayed = matchType === '1v1' ? rating.matches_played_1v1 : rating.matches_played_3v3;

    // Calculate ELO range for matchmaking
    const eloRange = getMatchmakingRange(playerElo, matchesPlayed);
    const minElo = playerElo - eloRange;
    const maxElo = playerElo + eloRange;

    // For 1v1 matches
    if (matchType === '1v1') {
      // Try to find an existing waiting match
      const { data: waitingMatches, error: matchError } = await supabase
        .from('arena_matches')
        .select('*, arena_ratings!inner(elo_1v1)')
        .eq('match_type', '1v1')
        .eq('mode', mode)
        .eq('state', 'waiting')
        .is('player2_id', null)
        .neq('player1_id', user.id)
        .gte('arena_ratings.elo_1v1', minElo)
        .lte('arena_ratings.elo_1v1', maxElo)
        .limit(1);

      if (!matchError && waitingMatches && waitingMatches.length > 0) {
        const match = waitingMatches[0];
        
        // Join the match
        const { data: updatedMatch, error: updateError } = await supabase
          .from('arena_matches')
          .update({
            player2_id: user.id,
            state: 'live',
            started_at: new Date().toISOString(),
          })
          .eq('id', match.id)
          .eq('state', 'waiting') // Ensure still waiting
          .is('player2_id', null) // Ensure not taken
          .select()
          .single();

        if (!updateError && updatedMatch) {
          // Create player record
          await supabase.from('arena_players').insert({
            match_id: updatedMatch.id,
            user_id: user.id,
          });

          // Create state change event
          await supabase.from('arena_events').insert({
            match_id: updatedMatch.id,
            user_id: user.id,
            event_type: 'state_change',
            event_data: { state: 'live' },
          });

          // Update daily limit
          await updateDailyLimit(supabase, user.id);

          return NextResponse.json({
            success: true,
            matchId: updatedMatch.id,
            message: 'Match found!',
          });
        }
      }

      // No match found, create new waiting match
      // Select random problems for this match
      const problemIds = await selectMatchProblems(supabase, playerElo);

      const { data: newMatch, error: createMatchError } = await supabase
        .from('arena_matches')
        .insert({
          match_type: '1v1',
          mode,
          player1_id: user.id,
          state: 'waiting',
          problem_ids: problemIds,
          fog_of_progress: true,
        })
        .select()
        .single();

      if (createMatchError || !newMatch) {
        return NextResponse.json(
          { error: 'Failed to create match' },
          { status: 500 }
        );
      }

      // Create player record
      await supabase.from('arena_players').insert({
        match_id: newMatch.id,
        user_id: user.id,
      });

      return NextResponse.json({
        success: true,
        matchId: newMatch.id,
        message: 'Waiting for opponent...',
        estimatedWaitTime: 30,
      });
    }

    // For 3v3 matches (future implementation)
    return NextResponse.json(
      { error: '3v3 matches not yet implemented' },
      { status: 501 }
    );

  } catch {
    return NextResponse.json({ error: 'Matchmaking failed' }, { status: 500 })
  }
}

// Fallback problem IDs if no problems are found in database
const FALLBACK_PROBLEM_IDS = ['demo_problem_1', 'demo_problem_2', 'demo_problem_3'];

/**
 * Select problems for the match based on player ELO
 */
async function selectMatchProblems(
  supabase: Awaited<ReturnType<typeof createClient>>, 
  playerElo: number
): Promise<string[]> {
  // Target difficulty based on ELO
  const targetRating = Math.max(800, Math.min(3500, playerElo + 200));
  const ratingRange = 300;

  // Fetch suitable problems
  const { data: problems } = await supabase
    .from('problems')
    .select('id')
    .gte('difficulty_rating', targetRating - ratingRange)
    .lte('difficulty_rating', targetRating + ratingRange)
    .eq('is_active', true)
    .limit(10);

  if (!problems || problems.length === 0) {
    // Fallback: return demo problem IDs
    return FALLBACK_PROBLEM_IDS;
  }

  // Randomly select 3 problems
  const shuffled = problems.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(p => p.id);
}

/**
 * Update daily match limit for user
 */
async function updateDailyLimit(
  supabase: Awaited<ReturnType<typeof createClient>>, 
  userId: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('arena_daily_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('match_date', today)
    .single();

  if (existing) {
    await supabase
      .from('arena_daily_limits')
      .update({ matches_played: existing.matches_played + 1 })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('arena_daily_limits')
      .insert({
        user_id: userId,
        match_date: today,
        matches_played: 1,
      });
  }
}
