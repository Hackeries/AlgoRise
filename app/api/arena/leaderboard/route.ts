import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MatchType } from '@/types/arena';

/**
 * Leaderboard API endpoint
 * Returns top players by ELO rating
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const matchType = (searchParams.get('matchType') || '1v1') as MatchType;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Select appropriate ELO column
    const eloColumn = matchType === '1v1' ? 'elo_1v1' : 'elo_3v3';
    const tierColumn = matchType === '1v1' ? 'tier_1v1' : 'tier_3v3';
    const matchesColumn = matchType === '1v1' ? 'matches_played_1v1' : 'matches_played_3v3';
    const winsColumn = matchType === '1v1' ? 'matches_won_1v1' : 'matches_won_3v3';

    // Get leaderboard with user profiles
    const { data: leaderboard, error } = await supabase
      .from('arena_ratings')
      .select(`
        user_id,
        ${eloColumn},
        ${tierColumn},
        ${matchesColumn},
        ${winsColumn},
        current_win_streak,
        titles,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order(eloColumn, { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Leaderboard error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Format leaderboard data
    const formattedLeaderboard = leaderboard.map((entry: any, index: number) => {
      const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
      const matchesPlayed = entry[matchesColumn];
      const wins = entry[winsColumn];
      const winRate = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;

      return {
        rank: offset + index + 1,
        userId: entry.user_id,
        username: profile?.username || 'Anonymous',
        avatar: profile?.avatar_url,
        elo: entry[eloColumn],
        tier: entry[tierColumn],
        matchesPlayed,
        winRate: winRate.toFixed(1),
        currentStreak: entry.current_win_streak,
        titles: entry.titles || [],
      };
    });

    return NextResponse.json({
      leaderboard: formattedLeaderboard,
      matchType,
      total: formattedLeaderboard.length,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
