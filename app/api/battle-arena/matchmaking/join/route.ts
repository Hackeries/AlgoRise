/**
 * Matchmaking API - Join Queue
 * POST /api/battle-arena/matchmaking/join
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import MatchmakingService from '@/lib/battle-arena/matchmaking-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { mode, metadata } = body;

    // Validate mode
    if (!mode || !['quick_1v1', 'ranked_1v1', '3v3_team'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be quick_1v1, ranked_1v1, or 3v3_team' },
        { status: 400 }
      );
    }

    // Get user profile for rating
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .single();

    // Get user rating
    let rating = 1200; // Default rating
    if (mode !== 'quick_1v1') {
      const { data: playerRating } = await supabase
        .from('player_ratings')
        .select('rating_1v1, rating_3v3')
        .eq('user_id', user.id)
        .single();

      if (playerRating) {
        rating = mode === '3v3_team' ? playerRating.rating_3v3 : playerRating.rating_1v1;
      }
    }

    // Add to matchmaking queue
    await MatchmakingService.joinQueue({
      userId: user.id,
      username: profile?.name || user.email?.split('@')[0] || 'Player',
      rating,
      mode,
      metadata
    });

    return NextResponse.json({
      success: true,
      message: 'Joined matchmaking queue',
      queueStatus: await MatchmakingService.getQueueStatus(mode)
    });
  } catch (error) {
    console.error('Error joining matchmaking queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
