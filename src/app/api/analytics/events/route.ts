import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.event_name) {
      return NextResponse.json(
        { error: 'event_name is required' },
        { status: 400 }
      );
    }

    // Get user if authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Insert analytics event
    const { error } = await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      event_name: body.event_name,
      event_category: body.event_category || 'engagement',
      properties: body.properties || {},
      session_id: body.session_id || null,
      page_url: body.page_url || null,
      created_at: body.timestamp || new Date().toISOString(),
    });

    if (error) {
      // Log but don't fail - analytics should be non-blocking
      console.error('Analytics insert error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    // Return success even on error to not block the client
    return NextResponse.json({ success: true });
  }
}
