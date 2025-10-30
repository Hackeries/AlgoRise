/**
 * API Route: /api/adaptive-learning/learning-paths
 * Handles learning paths and user progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdaptiveLearningEngine } from '@/lib/adaptive-learning';

/**
 * GET: Get learning paths and user progress
 * Query params:
 * - pathId: specific path ID (optional)
 * - overview: get dashboard overview (default: false)
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
    const pathId = searchParams.get('pathId');
    const overview = searchParams.get('overview') === 'true';

    const engine = createAdaptiveLearningEngine(supabase);

    if (overview) {
      // Get dashboard overview
      const dashboardData = await engine.learningPaths.getDashboardOverview(user.id);
      return NextResponse.json(dashboardData);
    }

    if (pathId) {
      // Get specific path with progress
      const structured = await engine.learningPaths.getStructuredPath(user.id, pathId);
      if (!structured) {
        return NextResponse.json(
          { error: 'Path not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(structured);
    }

    // Get all paths with progress
    const allProgress = await engine.learningPaths.getAllUserProgress(user.id);
    return NextResponse.json({ paths: allProgress });
  } catch (error) {
    console.error('Error in learning paths API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Update learning path progress
 * Body: { pathId: string, problemCompleted?: boolean }
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
    const { pathId, problemCompleted = true } = body;

    if (!pathId) {
      return NextResponse.json(
        { error: 'Missing pathId' },
        { status: 400 }
      );
    }

    const engine = createAdaptiveLearningEngine(supabase);
    await engine.learningPaths.updateProgress(user.id, pathId, problemCompleted);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating path progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
