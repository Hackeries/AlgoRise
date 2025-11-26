import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/auth/requireAuth';
import { getSession, getCurrentProblem } from '@/lib/train/session';

/**
 * GET /api/train/session/[id]
 * Fetch session state.
 */
export async function GET(
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
    const session = getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Verify session belongs to user (in production)
    // For stub, we allow anonymous access
    // TODO: Add proper ownership check with Supabase
    
    const currentProblem = getCurrentProblem(sessionId);
    
    return NextResponse.json({
      id: session.id,
      status: session.status,
      config: session.config,
      current_problem_index: session.currentProblemIndex,
      current_problem: currentProblem ? {
        id: currentProblem.id,
        title: currentProblem.title,
        description: currentProblem.description,
        difficulty: currentProblem.difficulty,
        topic: currentProblem.topic,
        hints_available: currentProblem.hints.length,
        test_cases_count: currentProblem.testCases.length,
      } : null,
      problems: session.problems.map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
      })),
      metrics: session.metrics,
      recommendations: session.recommendations,
      started_at: session.startedAt,
      paused_at: session.pausedAt,
      finished_at: session.finishedAt,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
    });
    
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
