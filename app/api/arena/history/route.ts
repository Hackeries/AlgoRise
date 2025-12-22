import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Match History API endpoint
 * Returns user's past matches
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get match history
    const { data: history, error } = await supabase
      .from('arena_match_history')
      .select('*')
      .eq('user_id', user.id)
      .order('match_finished_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Match history error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch match history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      history,
      total: history.length,
    });
  } catch (error) {
    console.error('Match history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

