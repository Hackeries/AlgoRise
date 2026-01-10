import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/search/debug - Debug search functionality
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

    const query = searchParams.get('q')?.trim() || 'test';

    const debugResults: any = {
      timestamp: new Date().toISOString(),
      user: user.id,
      query: query,
      tests: {},
    };

    // Test 1: Check if advanced_search function exists
    try {
      const { data: searchFunctionTest, error: searchFunctionError } =
        await supabase.rpc('advanced_search', {
          search_query: query,
          search_types: ['contest', 'group', 'problem', 'handle'],
          result_limit: 5,
          similarity_threshold: 0.1,
        });

      debugResults.tests.advancedSearchFunction = {
        exists: !searchFunctionError,
        error: searchFunctionError?.message || null,
        results: searchFunctionTest?.length || 0,
        sampleResults: searchFunctionTest?.slice(0, 3) || [],
      };
    } catch (error) {
      debugResults.tests.advancedSearchFunction = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results: 0,
        sampleResults: [],
      };
    }

    // Test 2: Check basic table access
    const tables = ['contests', 'groups', 'cf_handles', 'adaptive_items'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(3);

        debugResults.tests[`table_${table}`] = {
          accessible: !error,
          error: error?.message || null,
          rowCount: data?.length || 0,
          sampleData: data?.slice(0, 2) || [],
        };
      } catch (error) {
        debugResults.tests[`table_${table}`] = {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          rowCount: 0,
          sampleData: [],
        };
      }
    }

    // Test 3: Simple search without functions
    try {
      // Search contests by name
      const { data: contestSearch, error: contestError } = await supabase
        .from('contests')
        .select('id, name, status, visibility')
        .ilike('name', `%${query}%`)
        .limit(3);

      debugResults.tests.simpleContestSearch = {
        success: !contestError,
        error: contestError?.message || null,
        results: contestSearch?.length || 0,
        data: contestSearch || [],
      };
    } catch (error) {
      debugResults.tests.simpleContestSearch = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results: 0,
        data: [],
      };
    }

    // Test 4: Search handles
    try {
      const { data: handleSearch, error: handleError } = await supabase
        .from('cf_handles')
        .select('handle, verified, created_at')
        .ilike('handle', `%${query}%`)
        .limit(3);

      debugResults.tests.simpleHandleSearch = {
        success: !handleError,
        error: handleError?.message || null,
        results: handleSearch?.length || 0,
        data: handleSearch || [],
      };
    } catch (error) {
      debugResults.tests.simpleHandleSearch = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results: 0,
        data: [],
      };
    }

    return NextResponse.json(debugResults);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
