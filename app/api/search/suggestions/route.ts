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
    const limit = Math.min(
      Number.parseInt(searchParams.get('limit') || '5'),
      10
    );

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        query: query || '',
      });
    }

    const suggestions: Array<{
      suggestion: string;
      type: string;
      frequency: number;
    }> = [];

    const queryLower = query.toLowerCase();
    const pageRoutes = [
      {
        keywords: ['con', 'contest', 'comp', 'competition'],
        suggestion: 'Contests',
        type: 'page',
        url: '/contests',
      },
      {
        keywords: ['group', 'team', 'icpc'],
        suggestion: 'Groups',
        type: 'page',
        url: '/groups',
      },
      {
        keywords: ['prac', 'practice', 'prob', 'problem'],
        suggestion: 'Practice Problems',
        type: 'page',
        url: '/practice',
      },
      {
        keywords: ['train', 'learning', 'path'],
        suggestion: 'Learning Paths',
        type: 'page',
        url: '/learning-paths',
      },
      {
        keywords: ['dash', 'dashboard', 'home'],
        suggestion: 'Dashboard',
        type: 'page',
        url: '/dashboard',
      },
      {
        keywords: ['prof', 'profile', 'account'],
        suggestion: 'Profile',
        type: 'page',
        url: '/profile/overview',
      },
      {
        keywords: ['lead', 'leaderboard', 'rank'],
        suggestion: 'Leaderboard',
        type: 'page',
        url: '/leaderboard',
      },
      {
        keywords: ['anal', 'analytics', 'stats'],
        suggestion: 'Analytics',
        type: 'page',
        url: '/analytics',
      },
      {
        keywords: ['visual', 'visualizer'],
        suggestion: 'Visualizers',
        type: 'page',
        url: '/visualizers',
      },
      {
        keywords: ['price', 'pricing', 'subscription', 'plan'],
        suggestion: 'Pricing',
        type: 'page',
        url: '/pricing',
      },
    ];

    for (const route of pageRoutes) {
      if (
        route.keywords.some(
          keyword =>
            keyword.startsWith(queryLower) || queryLower.startsWith(keyword)
        )
      ) {
        suggestions.push({
          suggestion: route.suggestion,
          type: route.type,
          frequency: 10, // High priority for page suggestions
        });
      }
    }

    // Use the optimized search suggestions function for database content
    const { data: dbSuggestions, error } = await supabase.rpc(
      'search_suggestions',
      {
        search_query: query,
        suggestion_limit: Math.max(1, limit - suggestions.length),
      }
    );

    if (!error && dbSuggestions) {
      suggestions.push(...dbSuggestions);
    }

    // Sort by frequency and limit
    const sortedSuggestions = suggestions
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);

    return NextResponse.json({
      suggestions: sortedSuggestions,
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