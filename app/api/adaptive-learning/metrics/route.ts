/**
 * API Route: /api/adaptive-learning/metrics
 * Handles user learning metrics and skill profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdaptiveLearningEngine } from '@/lib/adaptive-learning';

/**
 * GET: Get user skill profile and metrics summary
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const engine = createAdaptiveLearningEngine(supabase);
    
    // Update skill profile with latest data
    await engine.metrics.updateSkillProfile(user.id);
    
    // Get comprehensive metrics
    const summary = await engine.metrics.getMetricsSummary(user.id);

    if (!summary) {
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in metrics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Record a problem attempt
 * Body: ProblemAttempt
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      problem_id,
      problem_title,
      problem_url,
      rating,
      tags,
      status,
      time_spent_seconds,
      hints_used,
      test_cases_passed,
      total_test_cases,
      language,
    } = body;

    if (!problem_id || !problem_title || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const engine = createAdaptiveLearningEngine(supabase);
    
    const result = await engine.metrics.recordAttempt({
      user_id: user.id,
      problem_id,
      problem_title,
      problem_url,
      rating,
      tags: tags || [],
      attempt_number: 1, // Will be calculated in service
      status,
      time_spent_seconds,
      hints_used,
      test_cases_passed,
      total_test_cases,
      language,
      started_at: new Date().toISOString(),
      completed_at: status === 'solved' ? new Date().toISOString() : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to record attempt' },
        { status: 500 }
      );
    }

    // Update skill profile after recording
    await engine.metrics.updateSkillProfile(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording attempt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
