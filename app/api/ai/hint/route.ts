import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateHint } from '@/lib/ai';
import type { HintRequest } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.problemTitle || !body.problemDescription || !body.hintLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: problemTitle, problemDescription, hintLevel' },
        { status: 400 }
      );
    }

    // Validate hint level
    if (!['subtle', 'medium', 'detailed'].includes(body.hintLevel)) {
      return NextResponse.json(
        { error: 'Invalid hintLevel. Must be one of: subtle, medium, detailed' },
        { status: 400 }
      );
    }

    const hintRequest: HintRequest = {
      problemTitle: body.problemTitle,
      problemDescription: body.problemDescription,
      problemTags: body.problemTags || [],
      problemDifficulty: body.problemDifficulty,
      userCode: body.userCode,
      hintLevel: body.hintLevel,
    };

    // Generate hint using AI
    const response = await generateHint(hintRequest);

    // Log usage for analytics
    await logAIUsage(supabase, user.id, 'hint', {
      problemTitle: body.problemTitle,
      hintLevel: body.hintLevel,
      cached: response.cached || false,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Hint API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hint' },
      { status: 500 }
    );
  }
}

async function logAIUsage(
  supabase: any,
  userId: string,
  type: string,
  metadata: Record<string, unknown>
) {
  try {
    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      type,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to log AI usage:', error);
  }
}
