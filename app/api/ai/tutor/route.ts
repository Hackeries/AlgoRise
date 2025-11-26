import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chatWithTutor } from '@/lib/ai';
import type { AIMessage } from '@/lib/ai/types';

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
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Missing required field: messages (array)' },
        { status: 400 }
      );
    }

    // Validate message format
    const messages: AIMessage[] = body.messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: String(msg.content || ''),
    }));

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array cannot be empty' },
        { status: 400 }
      );
    }

    // Get optional context
    const context = body.context ? {
      topic: body.context.topic,
      problemId: body.context.problemId,
    } : undefined;

    // Chat with AI tutor
    const response = await chatWithTutor(messages, context);

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Tutor API error:', error);
    return NextResponse.json(
      { error: 'Failed to process tutor request' },
      { status: 500 }
    );
  }
}
