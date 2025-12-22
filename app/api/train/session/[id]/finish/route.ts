import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/auth/requireAuth';
import { finalizeSession, getSession } from '@/lib/train/session';
import { publish } from '@/lib/train/stream';

/**
 * POST /api/train/session/[id]/finish
 * Finalize a session and get summary.
 * 
 * TODO: Persist summary to Supabase
 * TODO: Integrate with analytics for session tracking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const userId = requireAuth(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  const { id: sessionId } = await params;

  try {
    // Verify session exists
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Check if session is already finished
    if (session.status === 'finished') {
      return NextResponse.json(
        { error: 'Session is already finished' },
        { status: 400 }
      );
    }
    
    // Finalize the session
    const summary = finalizeSession(sessionId);
    
    if (!summary) {
      return NextResponse.json(
        { error: 'Failed to finalize session' },
        { status: 500 }
      );
    }
    
    // Emit SSE event for session completion
    publish(sessionId, 'session_finished', {
      session_id: sessionId,
      summary: {
        status: summary.status,
        metrics: summary.metrics,
        topic_mastery: summary.topicMastery,
        recommendations: summary.recommendations,
        next_steps: summary.nextSteps,
        completed_at: summary.completedAt,
      },
    });
    
    return NextResponse.json({
      session_id: summary.sessionId,
      status: summary.status,
      config: summary.config,
      metrics: {
        total_problems: summary.metrics.totalProblems,
        solved_count: summary.metrics.solvedCount,
        skipped_count: summary.metrics.skippedCount,
        hints_used: summary.metrics.hintsUsed,
        accuracy: summary.metrics.accuracy,
        avg_time_per_problem_ms: summary.metrics.avgTimePerProblemMs,
        total_time_ms: summary.metrics.totalTimeMs,
        topic_stats: summary.metrics.topicStats,
      },
      topic_mastery: summary.topicMastery,
      recommendations: summary.recommendations,
      next_steps: summary.nextSteps,
      completed_at: summary.completedAt,
    });
    
  } catch (error) {
    console.error('Error finishing session:', error);
    return NextResponse.json(
      { error: 'Failed to finish session' },
      { status: 500 }
    );
  }
}
