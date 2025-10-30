import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/battles/leaderboard - Get battle arena leaderboard
export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const timeRange = url.searchParams.get('timeRange') || 'all';

    // Build base query for battle ratings
    let query = supabase
      .from('battle_ratings')
      .select(`
        user_id,
        rating,
        battles_count,
        wins,
        losses,
        last_updated,
        users(email)
      `)
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply time range filter if needed
    if (timeRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query = query.gte('last_updated', oneWeekAgo.toISOString());
    } else if (timeRange === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      query = query.gte('last_updated', oneMonthAgo.toISOString());
    }

    const { data: ratings, error } = await query;

    if (error) {
      console.error("Error fetching battle leaderboard:", error);
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }

    // Format the leaderboard data
    const leaderboard = ratings?.map((rating: any, index: number) => ({
      rank: offset + index + 1,
      user_id: rating.user_id,
      username: rating.users?.email?.split('@')[0] || 'Anonymous',
      rating: rating.rating,
      battles_count: rating.battles_count,
      wins: rating.wins,
      losses: rating.losses,
      win_rate: rating.battles_count > 0 ? Math.round((rating.wins / rating.battles_count) * 100) : 0,
      last_updated: rating.last_updated
    })) || [];

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error in GET /api/battles/leaderboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}