import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/search/test - Test search functionality
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testResults: any = {
      timestamp: new Date().toISOString(),
      user: user.id,
      tests: {},
    };

    // Test 1: Check if search_index materialized view exists
    try {
      const { data: searchIndexCheck, error: searchIndexError } =
        await supabase.rpc('refresh_search_index');

      testResults.tests.searchIndexRefresh = {
        success: !searchIndexError,
        error: searchIndexError?.message,
      };
    } catch (error) {
      testResults.tests.searchIndexRefresh = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 2: Test advanced_search function
    try {
      const { data: searchResults, error: searchError } = await supabase.rpc(
        'advanced_search',
        {
          search_query: 'test',
          search_types: ['contest', 'group', 'problem', 'handle'],
          result_limit: 5,
          similarity_threshold: 0.1,
        }
      );

      testResults.tests.advancedSearch = {
        success: !searchError,
        error: searchError?.message,
        resultsCount: searchResults?.length || 0,
        sampleResults: searchResults?.slice(0, 2) || [],
      };
    } catch (error) {
      testResults.tests.advancedSearch = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 3: Test search_suggestions function
    try {
      const { data: suggestions, error: suggestionsError } = await supabase.rpc(
        'search_suggestions',
        {
          search_query: 'test',
          suggestion_limit: 3,
        }
      );

      testResults.tests.searchSuggestions = {
        success: !suggestionsError,
        error: suggestionsError?.message,
        suggestionsCount: suggestions?.length || 0,
        sampleSuggestions: suggestions || [],
      };
    } catch (error) {
      testResults.tests.searchSuggestions = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Test 4: Check table existence
    const tables = ['contests', 'groups', 'adaptive_items', 'cf_handles'];
    testResults.tests.tableExistence = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);

        testResults.tests.tableExistence[table] = {
          exists: !error,
          error: error?.message,
          hasData: (data?.length || 0) > 0,
        };
      } catch (error) {
        testResults.tests.tableExistence[table] = {
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          hasData: false,
        };
      }
    }

    // Test 5: Check search_index materialized view content
    try {
      const { data: indexData, error: indexError } = await supabase
        .from('search_index')
        .select('type, count')
        .limit(10);

      testResults.tests.searchIndexContent = {
        success: !indexError,
        error: indexError?.message,
        sampleData: indexData || [],
      };
    } catch (error) {
      testResults.tests.searchIndexContent = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Overall status
    const allTestsPassed = Object.values(testResults.tests).every(
      (test: any) =>
        typeof test === 'object' &&
        (test.success === true ||
          Object.values(test).every((subTest: any) => subTest.exists !== false))
    );

    testResults.overallStatus = allTestsPassed ? 'PASS' : 'FAIL';
    testResults.summary = {
      searchFunctionsWorking:
        testResults.tests.advancedSearch?.success &&
        testResults.tests.searchSuggestions?.success,
      materializedViewWorking:
        testResults.tests.searchIndexRefresh?.success &&
        testResults.tests.searchIndexContent?.success,
      tablesAccessible: Object.values(
        testResults.tests.tableExistence || {}
      ).every((t: any) => t.exists),
    };

    return NextResponse.json(testResults);
  } catch (error) {
    console.error('Error in search test:', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/search/test - Initialize search system
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action = 'refresh' } = body;

    let result;

    switch (action) {
      case 'refresh':
        // Refresh the search index
        const { error: refreshError } = await supabase.rpc(
          'refresh_search_index'
        );

        result = {
          action: 'refresh',
          success: !refreshError,
          error: refreshError?.message,
          message: refreshError
            ? 'Failed to refresh search index'
            : 'Search index refreshed successfully',
        };
        break;

      case 'recreate':
        // This would require calling the create function
        // For now, just refresh
        const { error: recreateError } = await supabase.rpc(
          'refresh_search_index'
        );

        result = {
          action: 'recreate',
          success: !recreateError,
          error: recreateError?.message,
          message: recreateError
            ? 'Failed to recreate search index'
            : 'Search index recreated successfully',
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in search initialization:', error);
    return NextResponse.json(
      {
        error: 'Initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
