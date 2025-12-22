/**
 * Upsolve Resolution API - Mark problem as solved/failed (Pro-only)
 * 
 * POST /api/upsolve/resolve
 * Body: { problemId: string, success: boolean }
 * 
 * Updates the spaced repetition box and next due date for a problem.
 * Requires active Pro subscription.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireProSubscription } from '@/lib/subscriptions/server-middleware';
import { nextBox, nextDue, type Box } from '@/lib/upsolve';

export async function POST(req: Request) {
  // Enforce Pro subscription
  const authCheck = await requireProSubscription(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const userId = authCheck.userId!;

  try {
    const { problemId, success } = await req.json();

    if (!problemId || typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'problemId and success (boolean) are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current queue item
    const { data: item, error: fetchError } = await supabase
      .from('upsolve_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Problem not found in upsolve queue' },
        { status: 404 }
      );
    }

    // Calculate new box and due date
    const newBoxNum = nextBox(item.box as Box, success);
    const newDueAt = nextDue(newBoxNum as Box);

    // Update queue item
    const { data: updated, error: updateError } = await supabase
      .from('upsolve_queue')
      .update({
        box: newBoxNum,
        next_due_at: newDueAt,
        last_result: success ? 'success' : 'fail',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .select()
      .single();

    if (updateError) {
      console.error('[Upsolve] Failed to update queue:', updateError);
      return NextResponse.json(
        { error: 'Failed to update upsolve queue' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: updated,
      progression: {
        oldBox: item.box,
        newBox: newBoxNum,
        result: success ? 'success' : 'fail',
        nextDue: newDueAt,
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
