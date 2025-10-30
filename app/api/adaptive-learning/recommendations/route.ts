/**
 * API Route: /api/adaptive-learning/recommendations
 * Handles problem recommendations for adaptive learning
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdaptiveLearningEngine } from '@/lib/adaptive-learning';

/**
 * GET: Get problem recommendations for the authenticated user
 * Query params:
 * - count: number of recommendations (default: 10)
 * - refresh: generate new recommendations (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '10');
    const refresh = searchParams.get('refresh') === 'true';

    const engine = createAdaptiveLearningEngine(supabase);

    if (refresh) {
      // Generate fresh recommendations
      const recommendations = await engine.recommendations.generateRecommendations(
        user.id,
        { count }
      );

      // Save to database
      await engine.recommendations.saveRecommendations(user.id, recommendations);

      return NextResponse.json({
        recommendations,
        generated_at: new Date().toISOString(),
      });
    } else {
      // Get saved recommendations
      const recommendations = await engine.recommendations.getRecommendations(user.id);

      // If no recommendations, generate new ones
      if (recommendations.length === 0) {
        const newRecommendations = await engine.recommendations.generateRecommendations(
          user.id,
          { count }
        );
        await engine.recommendations.saveRecommendations(user.id, newRecommendations);
        
        return NextResponse.json({
          recommendations: newRecommendations,
          generated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        recommendations,
      });
    }
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Update recommendation status
 * Body: { problemId: string, status: 'viewed' | 'started' | 'completed' | 'skipped' }
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
    const { problemId, status } = body;

    if (!problemId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const engine = createAdaptiveLearningEngine(supabase);
    await engine.recommendations.updateRecommendationStatus(user.id, problemId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating recommendation status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
