/**
 * Match API - Get Match State
 * GET /api/battle-arena/match?matchId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import GameServer from '@/lib/battle-arena/game-server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json(
        { error: 'Missing matchId parameter' },
        { status: 400 }
      );
    }

    // Verify user is in this match
    const { data: matchPlayer } = await supabase
      .from('match_players')
      .select('*')
      .eq('match_id', matchId)
      .eq('user_id', user.id)
      .single();

    if (!matchPlayer) {
      return NextResponse.json(
        { error: 'Not authorized to view this match' },
        { status: 403 }
      );
    }

    // Get room state from game server
    const room = GameServer.getRoom(matchId);

    if (!room) {
      // Try to fetch from database
      const { data: match } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (!match) {
        return NextResponse.json(
          { error: 'Match not found' },
          { status: 404 }
        );
      }

      // If match is finished, return stored data
      if (match.status === 'finished') {
        const { data: players } = await supabase
          .from('match_players')
          .select('*, profiles!inner(name)')
          .eq('match_id', matchId);

        return NextResponse.json({
          match: {
            matchId: match.id,
            mode: match.mode,
            status: match.status,
            startedAt: match.started_at,
            finishedAt: match.finished_at,
            duration: match.duration_seconds
          },
          players: players?.map(p => ({
            userId: p.user_id,
            username: p.profiles?.name || 'Unknown',
            team: p.team,
            score: p.score,
            fullSolves: p.full_solves,
            result: p.result,
            ratingChange: p.rating_change
          })) || []
        });
      }

      return NextResponse.json(
        { error: 'Match room not active' },
        { status: 404 }
      );
    }

    // Return live room state
    return NextResponse.json({
      match: {
        matchId: room.matchId,
        mode: room.mode,
        status: room.status,
        startedAt: room.startTime,
        endsAt: room.endTime,
        duration: room.duration
      },
      players: Array.from(room.players.values()),
      teams: room.teams ? Array.from(room.teams.values()) : undefined,
      problems: Array.from(room.problems.values()),
      timeRemaining: room.endTime && room.startTime
        ? Math.max(0, Math.floor((room.endTime - Date.now()) / 1000))
        : room.duration
    });
  } catch (error) {
    console.error('Error getting match state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
