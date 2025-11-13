/**
 * Matchmaking API - Leave Queue
 * POST /api/battle-arena/matchmaking/leave
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
    const { mode } = body;

    // Validate mode
    if (!mode || !['quick_1v1', 'ranked_1v1', '3v3_team'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode' },
        { status: 400 }
      );
    }

    // Remove from matchmaking queue
    await MatchmakingService.leaveQueue(user.id, mode);

    return NextResponse.json({
      success: true,
      message: 'Left matchmaking queue'
    });
  } catch (error) {
    console.error('Error leaving matchmaking queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
