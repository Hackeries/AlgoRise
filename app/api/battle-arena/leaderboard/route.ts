/**
 * Leaderboard API
 * GET /api/battle-arena/leaderboard?mode=1v1&timeframe=all_time&limit=100
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') || '1v1';
    const timeframe = searchParams.get('timeframe') || 'all_time';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Validate mode
    if (!['1v1', '3v3', 'overall'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be 1v1, 3v3, or overall' },
        { status: 400 }
      );
    }

    // Validate timeframe
    if (!['daily', 'weekly', 'monthly', 'all_time'].includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe' },
        { status: 400 }
      );
    }

    // Validate limit
    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Get leaderboard from player_ratings table
    const ratingField = mode === '1v1' ? 'rating_1v1' : mode === '3v3' ? 'rating_3v3' : 'rating_1v1';
    const matchesField = mode === '1v1' ? 'matches_played_1v1' : mode === '3v3' ? 'matches_played_3v3' : 'matches_played_1v1';
    const winsField = mode === '1v1' ? 'wins_1v1' : mode === '3v3' ? 'wins_3v3' : 'wins_1v1';
    const lossesField = mode === '1v1' ? 'losses_1v1' : mode === '3v3' ? 'losses_3v3' : 'losses_1v1';

    const { data: rankings, error } = await supabase
      .from('player_ratings')
      .select(`
        user_id,
        ${ratingField},
        ${matchesField},
        ${winsField},
        ${lossesField},
        profiles!inner(name, profile_image_url)
      `)
      .order(ratingField, { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    // Format response
    const leaderboard = rankings?.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user_id,
      username: entry.profiles?.name || 'Unknown',
      avatar: entry.profiles?.profile_image_url,
      rating: entry[ratingField],
      matchesPlayed: entry[matchesField] || 0,
      wins: entry[winsField] || 0,
      losses: entry[lossesField] || 0,
      winRate: entry[matchesField] > 0
        ? ((entry[winsField] || 0) / entry[matchesField] * 100).toFixed(1)
        : '0.0'
    })) || [];

    return NextResponse.json({
      mode,
      timeframe,
      leaderboard,
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
