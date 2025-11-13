/**
 * Matchmaking API - Queue Status
 * GET /api/battle-arena/matchmaking/status?mode=quick_1v1
 */

import { NextRequest, NextResponse } from 'next/server';
import MatchmakingService from '@/lib/battle-arena/matchmaking-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode');

    if (!mode || !['quick_1v1', 'ranked_1v1', '3v3_team'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode parameter' },
        { status: 400 }
      );
    }

    const status = await MatchmakingService.getQueueStatus(mode);

    return NextResponse.json({
      mode,
      ...status
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
