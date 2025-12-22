/**
 * Upsolve Queue API - Get user's upsolve queue (Pro-only)
 * 
 * GET /api/upsolve/queue
 * 
 * Returns the user's current upsolve queue with spaced repetition problems.
 * Requires active Pro subscription.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireProSubscription } from '@/lib/subscriptions/server-middleware';

export async function GET(req: Request) {
  // Enforce Pro subscription
  const authCheck = await requireProSubscription(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const userId = authCheck.userId!;

  try {
    const supabase = await createClient();

    // Fetch upsolve queue items
    const { data: queueItems, error } = await supabase
      .from('upsolve_queue')
      .select(`
        *,
        problems:problem_id (
          id,
          title,
          difficulty,
          tags,
          url
        )
      `)
      .eq('user_id', userId)
      .order('next_due_at', { ascending: true });

    if (error) {
      console.error('[Upsolve] Failed to fetch queue:', error);
      return NextResponse.json(
        { error: 'Failed to fetch upsolve queue' },
        { status: 500 }
      );
    }

    // Separate items into due and upcoming
    const now = new Date();
    const dueItems = queueItems?.filter(
      (item) => new Date(item.next_due_at) <= now
    ) || [];
    const upcomingItems = queueItems?.filter(
      (item) => new Date(item.next_due_at) > now
    ) || [];

    return NextResponse.json({
      success: true,
      queue: {
        due: dueItems,
        upcoming: upcomingItems,
        total: queueItems?.length || 0,
      },
      stats: {
        box1: queueItems?.filter((i) => i.box === 1).length || 0,
        box2: queueItems?.filter((i) => i.box === 2).length || 0,
        box3: queueItems?.filter((i) => i.box === 3).length || 0,
        box4: queueItems?.filter((i) => i.box === 4).length || 0,
        box5: queueItems?.filter((i) => i.box === 5).length || 0,
      },
    });
  } catch (error: any) {
    console.error('[Upsolve] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/upsolve/queue
 * 
 * Add a problem to the upsolve queue.
 */
export async function POST(req: Request) {
  // Enforce Pro subscription
  const authCheck = await requireProSubscription(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const userId = authCheck.userId!;

  try {
    const { problemId, source } = await req.json();

    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    const validSources = ['contest', 'daily', 'manual'];
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be one of: contest, daily, manual' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if problem already exists in queue
    const { data: existing } = await supabase
      .from('upsolve_queue')
      .select('id')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Problem already in upsolve queue' },
        { status: 400 }
      );
    }

    // Add to queue
    const { data, error } = await supabase
      .from('upsolve_queue')
      .insert({
        user_id: userId,
        problem_id: problemId,
        box: 1,
        next_due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day
        source,
        last_result: 'fail',
      })
      .select()
      .single();

    if (error) {
      console.error('[Upsolve] Failed to add to queue:', error);
      return NextResponse.json(
        { error: 'Failed to add problem to queue' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: data,
    });
  } catch (error: any) {
    console.error('[Upsolve] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
