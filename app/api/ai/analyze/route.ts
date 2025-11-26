import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeCode } from '@/lib/ai';
import type { CodeAnalysisRequest } from '@/lib/ai/types';

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
    if (!body.code || !body.language) {
      return NextResponse.json(
        { error: 'Missing required fields: code, language' },
        { status: 400 }
      );
    }

    // Validate code length
    if (body.code.length > 10000) {
      return NextResponse.json(
        { error: 'Code too long. Maximum 10000 characters.' },
        { status: 400 }
      );
    }

    const analysisRequest: CodeAnalysisRequest = {
      code: body.code,
      language: body.language,
      problemContext: body.problemContext,
    };

    // Analyze code using AI
    const response = await analyzeCode(analysisRequest);

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Analyze API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    );
  }
}
