/**
 * Weak Tags Analytics API (Pro-only)
 * 
 * GET /api/analytics/weak-tags
 * 
 * Returns user's weakest performing tags with detailed analysis.
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

    // Fetch weak tag analysis
    const { data: weakTags, error } = await supabase
      .from('weak_tag_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('weakness_score', { ascending: true }) // Lower score = weaker
      .limit(10);

    if (error) {
      console.error('[Analytics] Failed to fetch weak tags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch weak tags analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      weakTags: weakTags || [],
      recommendations: generateRecommendations(weakTags || []),
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
 * POST /api/analytics/weak-tags
 * 
 * Refresh weak tags analysis
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

    // Fetch user's problem attempt data to calculate weak tags
    const { data: attempts, error: attemptsError } = await supabase
      .from('problem_attempts')
      .select('problem_id, success, time_taken, problems(tags)')
      .eq('user_id', userId);

    if (attemptsError) {
      console.error('[Analytics] Failed to fetch attempts:', attemptsError);
      return NextResponse.json(
        { error: 'Failed to analyze problem attempts' },
        { status: 500 }
      );
    }

    // Aggregate by tag
    const tagStats = new Map<string, {
      attempted: number;
      solved: number;
      totalTime: number;
      count: number;
    }>();

    for (const attempt of attempts || []) {
      const tags = attempt.problems?.tags || [];
      
      for (const tag of tags) {
        if (!tagStats.has(tag)) {
          tagStats.set(tag, { attempted: 0, solved: 0, totalTime: 0, count: 0 });
        }
        
        const stats = tagStats.get(tag)!;
        stats.attempted++;
        
        if (attempt.success) {
          stats.solved++;
        }
        
        if (attempt.time_taken) {
          stats.totalTime += attempt.time_taken;
          stats.count++;
        }
      }
    }

    // Calculate weakness scores and update database
    const weakTagsData = [];
    
    for (const [tagName, stats] of tagStats.entries()) {
      const successRate = (stats.solved / stats.attempted) * 100;
      const avgTime = stats.count > 0 ? Math.round(stats.totalTime / stats.count) : null;
      
      // Calculate weakness score (lower is weaker)
      let weaknessScore = successRate;
      if (avgTime) {
        const timePenalty = Math.min(20, (avgTime / 3600) * 20);
        weaknessScore -= timePenalty;
      }
      weaknessScore = Math.max(0, Math.min(100, weaknessScore));

      weakTagsData.push({
        tag_name: tagName,
        problems_attempted: stats.attempted,
        problems_solved: stats.solved,
        success_rate: parseFloat(successRate.toFixed(2)),
        avg_time_seconds: avgTime,
        weakness_score: parseFloat(weaknessScore.toFixed(2)),
        last_attempted: new Date().toISOString(),
      });
    }

    // Upsert weak tags analysis
    for (const tagData of weakTagsData) {
      await supabase
        .from('weak_tag_analysis')
        .upsert({
          user_id: userId,
          ...tagData,
        }, {
          onConflict: 'user_id,tag_name',
        });
    }

    // Fetch updated data
    const { data: updatedWeakTags } = await supabase
      .from('weak_tag_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('weakness_score', { ascending: true })
      .limit(10);

    return NextResponse.json({
      success: true,
      weakTags: updatedWeakTags || [],
      analyzed: tagStats.size,
      recommendations: generateRecommendations(updatedWeakTags || []),
    });
  } catch (error: any) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function generateRecommendations(weakTags: any[]): string[] {
  const recommendations: string[] = [];
  
  if (weakTags.length === 0) {
    return ['Keep practicing! More data needed for personalized recommendations.'];
  }

  const weakest = weakTags[0];
  if (weakest.success_rate < 30) {
    recommendations.push(
      `Focus on ${weakest.tag_name} basics - your success rate is ${weakest.success_rate}%`
    );
  }

  const slowTags = weakTags.filter(t => t.avg_time_seconds > 1800);
  if (slowTags.length > 0) {
    recommendations.push(
      `Practice speed on: ${slowTags.slice(0, 3).map((t: any) => t.tag_name).join(', ')}`
    );
  }

  const lowAttempts = weakTags.filter(t => t.problems_attempted < 5);
  if (lowAttempts.length > 0) {
    recommendations.push(
      `Try more problems in: ${lowAttempts.slice(0, 3).map((t: any) => t.tag_name).join(', ')}`
    );
  }

  return recommendations;
}
