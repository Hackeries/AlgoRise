/**
 * API Route: /api/adaptive-learning/spaced-repetition
 * Handles spaced repetition reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdaptiveLearningEngine } from '@/lib/adaptive-learning';

/**
 * GET: Get due reviews and statistics
 * Query params:
 * - stats: return statistics only (default: false)
 * - upcoming: include upcoming reviews (default: false)
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

    const searchParams = request.nextUrl.searchParams;
    const statsOnly = searchParams.get('stats') === 'true';
    const includeUpcoming = searchParams.get('upcoming') === 'true';

    const engine = createAdaptiveLearningEngine(supabase);

    if (statsOnly) {
      const stats = await engine.spacedRepetition.getReviewStats(user.id);
      return NextResponse.json({ stats });
    }

    const dueReviews = await engine.spacedRepetition.getDueReviews(user.id);
    
    const response: any = {
      dueReviews,
      count: dueReviews.length,
    };

    if (includeUpcoming) {
      const upcoming = await engine.spacedRepetition.getUpcomingReviews(user.id);
      response.upcomingReviews = upcoming;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in spaced repetition API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Record a review outcome
 * Body: { problemId: string, outcome: 'failed' | 'partial' | 'success', timeSpentSeconds?: number }
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
    const { problemId, outcome, timeSpentSeconds, hintsUsed } = body;

    if (!problemId || !outcome) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['failed', 'partial', 'success'].includes(outcome)) {
      return NextResponse.json(
        { error: 'Invalid outcome' },
        { status: 400 }
      );
    }

    const engine = createAdaptiveLearningEngine(supabase);
    
    const result = await engine.spacedRepetition.recordReview(user.id, problemId, {
      outcome,
      timeSpentSeconds,
      hintsUsed,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to record review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      nextReviewAt: result.nextReviewAt,
      mastered: result.mastered,
    });
  } catch (error) {
    console.error('Error recording review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Archive a review
 * Query params: problemId
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const problemId = searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json(
        { error: 'Missing problemId' },
        { status: 400 }
      );
    }

    const engine = createAdaptiveLearningEngine(supabase);
    const result = await engine.spacedRepetition.archiveReview(user.id, problemId);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to archive review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
