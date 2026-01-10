import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/auth/requireAuth';
import { processEvent, SessionEventSchema, generateAdaptiveRecommendations } from '@/lib/train/events';

/**
 * POST /api/train/session/[id]/event
 * Ingest session events (attempt, hint, skip, pass_tests, fail_tests, submit, pause, resume).
 * 
 * TODO: Add rate limiting for event ingestion
 * TODO: Add analytics integration
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
    const body = await request.json();
    
    // Validate event with Zod
    const parseResult = SessionEventSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid event',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }
    
    const event = parseResult.data;
    
    // Process the event
    const result = processEvent(sessionId, event);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.message,
          session: result.session,
        },
        { status: 400 }
      );
    }
    
    // Generate adaptive recommendations after certain events
    if (['submit', 'skip', 'fail_tests'].includes(event.type)) {
      generateAdaptiveRecommendations(sessionId);
    }
    
    return NextResponse.json({
      success: true,
      message: result.message,
      current_problem: result.currentProblem ? {
        id: result.currentProblem.id,
        title: result.currentProblem.title,
        description: result.currentProblem.description,
        difficulty: result.currentProblem.difficulty,
        topic: result.currentProblem.topic,
      } : null,
      hint: result.hint,
      test_results: result.testResults,
      recommendation: result.recommendation,
      metrics: result.session?.metrics,
    });
    
  } catch (error) {
    console.error('Error processing event:', error);
    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}
