/**
 * Fail-Decay Analysis API (Pro-only)
 * 
 * GET /api/analytics/fail-decay
 * 
 * Returns fail-decay analysis based on upsolve box progression.
 * Shows retention and decay patterns for problems.
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

    // Fetch fail-decay analysis
    const { data: failDecay, error } = await supabase
      .from('fail_decay_analysis')
      .select(`
        *,
        problems:problem_id (
          id,
          title,
          difficulty,
          tags
        )
      `)
      .eq('user_id', userId)
      .order('retention_score', { ascending: true }); // Lower retention = more decay

    if (error) {
      console.error('[Analytics] Failed to fetch fail-decay:', error);
      return NextResponse.json(
        { error: 'Failed to fetch fail-decay analysis' },
        { status: 500 }
      );
    }

    // Aggregate statistics
    const stats = {
      totalProblems: failDecay?.length || 0,
      avgRetention: failDecay?.length ? 
        (failDecay.reduce((sum, item) => sum + parseFloat(item.retention_score || 0), 0) / failDecay.length).toFixed(2) : 0,
      highDecay: failDecay?.filter(item => parseFloat(item.decay_rate || 0) > 50).length || 0,
      needsReview: failDecay?.filter(item => 
        item.next_review && new Date(item.next_review) <= new Date()
      ).length || 0,
      byBox: {
        box1: failDecay?.filter(item => item.current_box === 1).length || 0,
        box2: failDecay?.filter(item => item.current_box === 2).length || 0,
        box3: failDecay?.filter(item => item.current_box === 3).length || 0,
        box4: failDecay?.filter(item => item.current_box === 4).length || 0,
        box5: failDecay?.filter(item => item.current_box === 5).length || 0,
      },
    };

    // Group by tag
    const byTag = new Map<string, any[]>();
    for (const item of failDecay || []) {
      const tags = item.problems?.tags || [];
      for (const tag of tags) {
        if (!byTag.has(tag)) {
          byTag.set(tag, []);
        }
        byTag.get(tag)!.push(item);
      }
    }

    const tagAnalysis = Array.from(byTag.entries()).map(([tag, items]) => ({
      tag,
      problemCount: items.length,
      avgRetention: (items.reduce((sum, item) => sum + parseFloat(item.retention_score || 0), 0) / items.length).toFixed(2),
      avgDecay: (items.reduce((sum, item) => sum + parseFloat(item.decay_rate || 0), 0) / items.length).toFixed(2),
      highDecayCount: items.filter(item => parseFloat(item.decay_rate || 0) > 50).length,
    })).sort((a, b) => parseFloat(b.avgDecay) - parseFloat(a.avgDecay));

    return NextResponse.json({
      success: true,
      failDecay: failDecay || [],
      stats,
      tagAnalysis: tagAnalysis.slice(0, 10), // Top 10 tags with highest decay
    });
  } catch (error: any) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/fail-decay
 * 
 * Refresh fail-decay analysis based on upsolve queue
 */
export async function POST(req: Request) {
  // Enforce Pro subscription
  const authCheck = await requireProSubscription(req);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const userId = authCheck.userId!;

  try {
    const supabase = await createClient();

    // Fetch upsolve queue with problem details
    const { data: queueItems, error: queueError } = await supabase
      .from('upsolve_queue')
      .select(`
        *,
        problems:problem_id (
          id,
          title,
          difficulty,
          tags
        )
      `)
      .eq('user_id', userId);

    if (queueError) {
      console.error('[Analytics] Failed to fetch queue:', queueError);
      return NextResponse.json(
        { error: 'Failed to analyze upsolve queue' },
        { status: 500 }
      );
    }

    // Fetch attempt history for each problem to calculate fail/success counts
    const failDecayData = [];
    
    for (const item of queueItems || []) {
      const { data: attempts } = await supabase
        .from('problem_attempts')
        .select('success, created_at')
        .eq('user_id', userId)
        .eq('problem_id', item.problem_id)
        .order('created_at', { ascending: true });

      const failCount = attempts?.filter(a => !a.success).length || 0;
      const successCount = attempts?.filter(a => a.success).length || 0;
      const totalAttempts = failCount + successCount;

      // Calculate decay rate (percentage of moves backward)
      let decayRate = 0;
      if (totalAttempts > 1) {
        // Count how many times box decreased
        let decreases = 0;
        let prevBox = 1;
        
        for (const attempt of attempts || []) {
          const newBox = attempt.success ? 
            Math.min(5, prevBox + 1) : 
            Math.max(1, prevBox - 1);
          
          if (newBox < prevBox) decreases++;
          prevBox = newBox;
        }
        
        decayRate = (decreases / totalAttempts) * 100;
      }

      // Calculate retention score
      const retentionScore = calculateRetentionScore(
        item.box,
        failCount,
        successCount
      );

      const tags = item.problems?.tags || [];
      const primaryTag = tags[0] || null;

      failDecayData.push({
        problem_id: item.problem_id,
        tag_name: primaryTag,
        difficulty: item.problems?.difficulty,
        current_box: item.box,
        fail_count: failCount,
        success_count: successCount,
        decay_rate: parseFloat(decayRate.toFixed(2)),
        retention_score: parseFloat(retentionScore.toFixed(2)),
        next_review: item.next_due_at,
        last_attempt_result: item.last_result,
      });
    }

    // Upsert fail-decay analysis
    for (const data of failDecayData) {
      await supabase
        .from('fail_decay_analysis')
        .upsert({
          user_id: userId,
          ...data,
        }, {
          onConflict: 'user_id,problem_id',
        });
    }

    // Fetch updated data
    const { data: updatedFailDecay } = await supabase
      .from('fail_decay_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('retention_score', { ascending: true });

    return NextResponse.json({
      success: true,
      failDecay: updatedFailDecay || [],
      analyzed: failDecayData.length,
    });
  } catch (error: any) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function calculateRetentionScore(
  currentBox: number,
  failCount: number,
  successCount: number
): number {
  const totalAttempts = failCount + successCount;
  
  if (totalAttempts === 0) {
    return 50; // Neutral score
  }
  
  const successRate = (successCount / totalAttempts) * 70;
  const boxBonus = (currentBox / 5) * 30;
  
  return Math.max(0, Math.min(100, successRate + boxBonus));
}
