import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/auth/requireAuth';
import { createSession, SessionConfigSchema } from '@/lib/train/session';

/**
 * POST /api/train/session
 * Create a new training session.
 * 
 * TODO: Add rate limiting
 * TODO: Integrate with actual problem generation
 */
export async function POST(request: NextRequest) {
  // Auth check
  const userId = requireAuth(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    
    // Validate config with Zod
    const parseResult = SessionConfigSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid session configuration',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }
    
    const config = parseResult.data;
    
    // Create session
    const session = createSession(userId, config);
    
    return NextResponse.json({
      session_id: session.id,
      status: session.status,
      planned_problems: session.problems.map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
      })),
      config: session.config,
      created_at: session.createdAt,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
