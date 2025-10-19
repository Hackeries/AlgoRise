import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  getUserCodeforcesRating,
  findMatchingOpponent,
  calculateProblemRatingRange,
} from '@/lib/battle-arena/matchmaking';
import { broadcastQueueUpdate } from '@/hooks/use-battle-realtime';

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
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode, teamId } = await request.json();

    if (!['1v1', '3v3'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const userCFRating = await getUserCodeforcesRating(user.id);

    // Remove from queue if already queued
    await supabase
      .from('battle_queue')
      .delete()
      .or(`user_id.eq.${user.id},team_id.eq.${teamId || null}`)
      .eq('mode', mode);

    // Add to queue
    const { data: queueData, error: queueError } = await supabase
      .from('battle_queue')
      .insert({
        user_id: mode === '1v1' ? user.id : null,
        team_id: mode === '3v3' ? teamId : null,
        mode,
        current_elo: userCFRating,
        status: 'waiting',
      })
      .select()
      .single();

    if (queueError) throw queueError;

    const matchResult = await findMatchingOpponent(
      user.id,
      mode as '1v1' | '3v3'
    );

    if (matchResult.matched && matchResult.opponent) {
      // Create battle with matched opponent
      const ratingRange = calculateProblemRatingRange(
        userCFRating,
        matchResult.opponent.rating
      );

      const { data: battleData } = await supabase
        .from('battles')
        .insert({
          mode,
          status: 'pending',
        })
        .select()
        .single();

      // Update queue status
      await supabase
        .from('battle_queue')
        .update({ status: 'matched', matched_at: new Date() })
        .eq('id', queueData.id);

      await broadcastQueueUpdate(mode as '1v1' | '3v3', {
        type: 'match_found',
        opponent: matchResult.opponent,
        battleId: battleData?.id,
      });

      return NextResponse.json({
        queued: true,
        queueId: queueData.id,
        match: {
          battleId: battleData?.id,
          opponentId: matchResult.opponent.userId,
          problemRatingRange: ratingRange,
        },
      });
    }

    const { count: queueSize } = await supabase
      .from('battle_queue')
      .select('*', { count: 'exact', head: true })
      .eq('mode', mode)
      .eq('status', 'waiting');

    await broadcastQueueUpdate(mode as '1v1' | '3v3', {
      type: 'queue_size',
      queueSize: queueSize || 0,
    });

    return NextResponse.json({
      queued: true,
      queueId: queueData.id,
      match: null,
    });
  } catch (error) {
    console.error('[v0] Queue error:', error);
    return NextResponse.json({ error: 'Queue failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode } = await request.json();

    await supabase
      .from('battle_queue')
      .delete()
      .eq('user_id', user.id)
      .eq('mode', mode);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leave queue error:', error);
    return NextResponse.json(
      { error: 'Failed to leave queue' },
      { status: 500 }
    );
  }
}
