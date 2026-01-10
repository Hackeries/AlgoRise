import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const PAGE_ROUTES = [
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

const FALLBACK_SUGGESTIONS = [
  { suggestion: 'Binary Search', type: 'topic', frequency: 8 },
  { suggestion: 'Dynamic Programming', type: 'topic', frequency: 8 },
  { suggestion: 'Graph Algorithms', type: 'topic', frequency: 7 },
  { suggestion: 'Sorting', type: 'topic', frequency: 7 },
  { suggestion: 'Two Pointers', type: 'topic', frequency: 6 },
  { suggestion: 'BFS', type: 'topic', frequency: 6 },
  { suggestion: 'DFS', type: 'topic', frequency: 6 },
  { suggestion: 'Greedy', type: 'topic', frequency: 5 },
  { suggestion: 'Recursion', type: 'topic', frequency: 5 },
  { suggestion: 'Trees', type: 'topic', frequency: 5 },
];

function getPageSuggestions(queryLower: string) {
  const suggestions: Array<{
    suggestion: string;
    type: string;
    frequency: number;
  }> = [];

  for (const route of PAGE_ROUTES) {
    if (
      route.keywords.some(
        keyword =>
          keyword.startsWith(queryLower) || queryLower.startsWith(keyword)
      )
    ) {
      suggestions.push({
        suggestion: route.suggestion,
        type: route.type,
        frequency: 10,
      });
    }
  }

  return suggestions;
}

function getFallbackSuggestions(queryLower: string, limit: number) {
  return FALLBACK_SUGGESTIONS.filter(s =>
    s.suggestion.toLowerCase().includes(queryLower)
  ).slice(0, limit);
}

// GET /api/search/suggestions - Get search suggestions for autocomplete
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
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

  const queryLower = query.toLowerCase();
  const suggestions: Array<{
    suggestion: string;
    type: string;
    frequency: number;
  }> = [];

  // Always add matching page route suggestions
  suggestions.push(...getPageSuggestions(queryLower));

  // Try to get database suggestions with proper error handling
  let dbSuggestionsAdded = false;
  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const remainingLimit = Math.max(1, limit - suggestions.length);
      const { data: dbSuggestions, error } = await supabase.rpc(
        'search_suggestions',
        {
          search_query: query,
          suggestion_limit: remainingLimit,
        }
      );

      if (error) {
        console.warn('Database search_suggestions RPC failed:', error.message);
      } else if (dbSuggestions && Array.isArray(dbSuggestions)) {
        suggestions.push(...dbSuggestions);
        dbSuggestionsAdded = true;
      }
    }
  } catch (error) {
    console.warn(
      'Error fetching database suggestions:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Add fallback suggestions if no DB suggestions were added
  if (!dbSuggestionsAdded && suggestions.length < limit) {
    const fallbacks = getFallbackSuggestions(
      queryLower,
      limit - suggestions.length
    );
    suggestions.push(...fallbacks);
  }

  // Sort by frequency and limit
  const sortedSuggestions = suggestions
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);

  return NextResponse.json({
    suggestions: sortedSuggestions,
    query,
  });
}