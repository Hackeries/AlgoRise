import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/search/suggestions - Get search suggestions for autocomplete
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10);

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        query: query || '',
      });
    }

    // Use the optimized search suggestions function
    const { data: suggestions, error } = await supabase.rpc(
      'search_suggestions',
      {
        search_query: query,
        suggestion_limit: limit,
      }
    );

    if (error) {
      console.error('Error getting search suggestions:', error);
      // Fallback to empty suggestions instead of error
      return NextResponse.json({
        suggestions: [],
        query,
        fallback: true,
      });
    }
    return NextResponse.json({
      suggestions: suggestions || [],
      query,
    });
  } catch (error) {
    console.error('Error in search suggestions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
