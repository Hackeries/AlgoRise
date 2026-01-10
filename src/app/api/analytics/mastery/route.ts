/**
 * Mastery Tracking Analytics API (Pro-only)
 * 
 * GET /api/analytics/mastery
 * 
 * Returns detailed per-tag mastery tracking with trends.
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
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');

    const supabase = await createClient();

    if (tag) {
      // Get specific tag mastery
      const { data, error } = await supabase
        .from('tag_mastery_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('tag_name', tag)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Tag not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        mastery: data,
      });
    } else {
      // Get all tag masteries
      const { data, error } = await supabase
        .from('tag_mastery_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('mastery_score', { ascending: false });

      if (error) {
        console.error('[Analytics] Failed to fetch mastery:', error);
        return NextResponse.json(
          { error: 'Failed to fetch mastery tracking' },
          { status: 500 }
        );
      }

      // Categorize by mastery level
      const expert = data?.filter(t => t.mastery_score >= 80) || [];
      const advanced = data?.filter(t => t.mastery_score >= 60 && t.mastery_score < 80) || [];
      const intermediate = data?.filter(t => t.mastery_score >= 40 && t.mastery_score < 60) || [];
      const beginner = data?.filter(t => t.mastery_score < 40) || [];

      return NextResponse.json({
        success: true,
        mastery: {
          all: data || [],
          byLevel: {
            expert,
            advanced,
            intermediate,
            beginner,
          },
          stats: {
            totalTags: data?.length || 0,
            averageScore: data?.length ? 
              (data.reduce((sum, t) => sum + parseFloat(t.mastery_score), 0) / data.length).toFixed(2) : 0,
            improving: data?.filter(t => t.trend === 'improving').length || 0,
            declining: data?.filter(t => t.trend === 'declining').length || 0,
          },
        },
      });
    }
  } catch (error: any) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/mastery
 * 
 * Refresh mastery tracking
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

    // Fetch user's problem history
    const { data: attempts, error: attemptsError } = await supabase
      .from('problem_attempts')
      .select('problem_id, success, created_at, problems(tags, difficulty)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (attemptsError) {
      console.error('[Analytics] Failed to fetch attempts:', attemptsError);
      return NextResponse.json(
        { error: 'Failed to analyze problem attempts' },
        { status: 500 }
      );
    }

    // Calculate mastery for each tag
    const tagData = new Map<string, {
      total: number;
      last7d: number;
      last30d: number;
      lastPracticed: Date;
      difficulties: number[];
      historicalScores: number[];
    }>();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const attempt of attempts || []) {
      if (!attempt.success) continue; // Only count solved problems
      
      const attemptDate = new Date(attempt.created_at);
      const tags = attempt.problems?.tags || [];
      const difficulty = parseDifficulty(attempt.problems?.difficulty);

      for (const tag of tags) {
        if (!tagData.has(tag)) {
          tagData.set(tag, {
            total: 0,
            last7d: 0,
            last30d: 0,
            lastPracticed: attemptDate,
            difficulties: [],
            historicalScores: [],
          });
        }

        const data = tagData.get(tag)!;
        data.total++;
        
        if (attemptDate >= weekAgo) data.last7d++;
        if (attemptDate >= monthAgo) data.last30d++;
        if (attemptDate > data.lastPracticed) data.lastPracticed = attemptDate;
        if (difficulty) data.difficulties.push(difficulty);
      }
    }

    // Calculate mastery scores and trends
    const masteryData = [];
    
    for (const [tagName, data] of tagData.entries()) {
      // Fetch previous mastery score for trend calculation
      const { data: prevMastery } = await supabase
        .from('tag_mastery_tracking')
        .select('mastery_score')
        .eq('user_id', userId)
        .eq('tag_name', tagName)
        .single();

      const prevScore = prevMastery?.mastery_score || 0;
      
      // Calculate mastery score (0-100)
      let masteryScore = 0;
      
      // Volume component (40 points max)
      masteryScore += Math.min(40, (data.total / 50) * 40);
      
      // Consistency component (30 points max)
      const consistencyScore = (data.last7d * 4 + data.last30d) / 10;
      masteryScore += Math.min(30, consistencyScore);
      
      // Difficulty component (30 points max)
      if (data.difficulties.length > 0) {
        const avgDifficulty = data.difficulties.reduce((a, b) => a + b, 0) / data.difficulties.length;
        masteryScore += Math.min(30, (avgDifficulty / 5) * 30);
      }
      
      masteryScore = Math.min(100, masteryScore);

      // Determine trend
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (masteryScore > prevScore + 5) trend = 'improving';
      else if (masteryScore < prevScore - 5) trend = 'declining';

      masteryData.push({
        tag_name: tagName,
        mastery_score: parseFloat(masteryScore.toFixed(2)),
        trend,
        streak_days: calculateStreak(data.lastPracticed),
        total_problems: data.total,
        problems_last_7d: data.last7d,
        problems_last_30d: data.last30d,
        avg_difficulty: data.difficulties.length > 0 ? 
          parseFloat((data.difficulties.reduce((a, b) => a + b, 0) / data.difficulties.length).toFixed(1)) : null,
        last_practiced: data.lastPracticed.toISOString(),
      });
    }

    // Upsert mastery tracking
    for (const mastery of masteryData) {
      await supabase
        .from('tag_mastery_tracking')
        .upsert({
          user_id: userId,
          ...mastery,
        }, {
          onConflict: 'user_id,tag_name',
        });
    }

    // Fetch updated data
    const { data: updatedMastery } = await supabase
      .from('tag_mastery_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('mastery_score', { ascending: false });

    return NextResponse.json({
      success: true,
      mastery: updatedMastery || [],
      analyzed: tagData.size,
    });
  } catch (error: any) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function parseDifficulty(difficulty: string | undefined): number | null {
  if (!difficulty) return null;
  
  const diffMap: Record<string, number> = {
    'easy': 1,
    'medium': 3,
    'hard': 5,
  };
  
  return diffMap[difficulty.toLowerCase()] || 3;
}

function calculateStreak(lastPracticed: Date): number {
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastPracticed.getTime()) / (24 * 60 * 60 * 1000));
  
  // If practiced within last day, return 1, otherwise 0 (simplified)
  return daysDiff <= 1 ? 1 : 0;
}
