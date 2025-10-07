import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface SearchResult {
  id: string;
  type: 'contest' | 'group' | 'problem' | 'user' | 'handle';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
  relevanceScore?: number;
}

interface SearchResponse {
  results: SearchResult[];
  categories: {
    contests: SearchResult[];
    groups: SearchResult[];
    problems: SearchResult[];
    users: SearchResult[];
    handles: SearchResult[];
  };
  totalResults: number;
  query: string;
  searchTime: number;
  fallback?: boolean;
} // GET /api/search - Global search endpoint
export async function GET(req: NextRequest) {
  const startTime = Date.now();

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
    const categories = searchParams.get('categories')?.split(',') || [
      'contests',
      'groups',
      'problems',
      'users',
      'handles',
    ];
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const includeMetadata = searchParams.get('metadata') === 'true';

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          error: 'Query must be at least 2 characters long',
        },
        { status: 400 }
      );
    }

    const results: SearchResult[] = [];
    const categorizedResults = {
      contests: [] as SearchResult[],
      groups: [] as SearchResult[],
      problems: [] as SearchResult[],
      users: [] as SearchResult[],
      handles: [] as SearchResult[],
    };

    // Map frontend categories to schema types
    const searchTypesMap: Record<string, string> = {
      contests: 'contest',
      groups: 'group',
      problems: 'problem',
      users: 'user',
      handles: 'handle',
    };

    const searchTypes = categories
      .map(cat => searchTypesMap[cat])
      .filter(Boolean); // Use optimized search function for better performance and relevance
    try {
      console.log(
        'Attempting advanced search with query:',
        query,
        'types:',
        searchTypes
      );

      const { data: searchResults, error } = await supabase.rpc(
        'advanced_search',
        {
          search_query: query,
          search_types: searchTypes,
          result_limit: limit,
          similarity_threshold: 0.25, // Match schema default
        }
      );

      console.log('Advanced search results:', {
        error: error?.message,
        resultCount: searchResults?.length || 0,
        sampleResults: searchResults?.slice(0, 2) || [],
      });

      if (error) {
        console.error('Error in advanced search:', error);
        // Fall back to basic search if advanced search fails
        return await performBasicSearch();
      } // Process search results and categorize them
      console.log(
        'Processing',
        searchResults?.length || 0,
        'search results...'
      );
      for (const searchResult of searchResults || []) {
        console.log(
          'Processing result:',
          searchResult.type,
          searchResult.entity_id,
          searchResult.title
        );
        let result: SearchResult;

        switch (searchResult.type) {
          case 'contest':
            // Get additional contest data
            const { data: contestData } = await supabase
              .from('contests')
              .select(
                `
                id,
                name,
                status,
                visibility,
                starts_at,
                ends_at,
                host_user_id
              `
              )
              .eq('id', searchResult.entity_id)
              .single();

            if (contestData) {
              result = {
                id: contestData.id,
                type: 'contest',
                title: contestData.name,
                subtitle: `Status: ${contestData.status}`,
                description: `Visibility: ${contestData.visibility}`,
                url: `/contests/${contestData.id}`,
                relevanceScore: searchResult.relevance_score,
                metadata: includeMetadata
                  ? {
                      status: contestData.status,
                      visibility: contestData.visibility,
                      startsAt: contestData.starts_at,
                      endsAt: contestData.ends_at,
                    }
                  : undefined,
              };
              results.push(result);
              categorizedResults.contests.push(result);
            }
            break;

          case 'group':
            // Get additional group data
            const { data: groupData } = await supabase
              .from('groups')
              .select(
                `
                id,
                name,
                description,
                type,
                colleges(name),
                group_memberships!inner(user_id, role)
              `
              )
              .eq('id', searchResult.entity_id)
              .eq('group_memberships.user_id', user.id)
              .single();

            if (groupData) {
              const userMembership = groupData.group_memberships?.find(
                m => m.user_id === user.id
              );
              const collegeName = groupData.colleges?.[0]?.name || 'Group';

              result = {
                id: groupData.id,
                type: 'group',
                title: groupData.name,
                subtitle: collegeName,
                description:
                  groupData.description || 'No description available',
                url: `/groups?groupId=${groupData.id}`,
                relevanceScore: searchResult.relevance_score,
                metadata: includeMetadata
                  ? {
                      type: groupData.type,
                      role: userMembership?.role,
                      collegeName,
                    }
                  : undefined,
              };
              results.push(result);
              categorizedResults.groups.push(result);
            }
            break;

          case 'user':
            // Get additional user data
            const { data: userData } = await supabase
              .from('profiles')
              .select(
                `
                id,
                full_name,
                cf_handles(handle, verified),
                colleges(name)
              `
              )
              .eq('id', searchResult.entity_id)
              .neq('id', user.id)
              .single();

            if (userData) {
              const cfHandle = userData.cf_handles?.[0];
              const collegeName =
                userData.colleges?.[0]?.name || 'No college info';

              result = {
                id: userData.id,
                type: 'user',
                title: userData.full_name || 'Unknown User',
                subtitle: cfHandle
                  ? `CF: ${cfHandle.handle} (${cfHandle.verified ? 'Verified' : 'Unverified'})`
                  : 'No CF Handle',
                description: collegeName,
                url: `/profile?userId=${userData.id}`,
                relevanceScore: searchResult.relevance_score,
                metadata: includeMetadata
                  ? {
                      cfHandle: cfHandle?.handle,
                      verified: cfHandle?.verified,
                      collegeName,
                    }
                  : undefined,
              };
              results.push(result);
              categorizedResults.users.push(result);
            }
            break;

          case 'handle':
            console.log('Processing handle:', searchResult.entity_id);
            // Get additional CF handle data with simpler query
            const { data: handleData, error: handleError } = await supabase
              .from('cf_handles')
              .select(
                `
                id,
                handle,
                verified,
                user_id
              `
              )
              .eq('id', searchResult.entity_id)
              .single();

            console.log('Handle data query result:', {
              data: handleData,
              error: handleError?.message,
            });

            if (handleData) {
              // Get profile info separately if needed
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', handleData.user_id)
                .single();

              const profileName = profileData?.full_name || 'Unknown User';

              result = {
                id: handleData.id,
                type: 'handle',
                title: handleData.handle,
                subtitle: `${profileName} (${handleData.verified ? 'Verified' : 'Unverified'})`,
                description: 'CF Handle',
                url: `/profile?userId=${handleData.user_id}`,
                relevanceScore: searchResult.relevance_score,
                metadata: includeMetadata
                  ? {
                      verified: handleData.verified,
                      userId: handleData.user_id,
                      profileName,
                    }
                  : undefined,
              };
              console.log('Created handle result:', result);
              results.push(result);
              categorizedResults.handles.push(result);
            } else {
              console.warn('No handle data found for:', searchResult.entity_id);
            }
            break;

          case 'user':
            // This case might be used if you have users in the search index
            // For now, we'll treat it similar to handles
            break;

          case 'problem':
            // Get additional problem data
            const { data: problemData } = await supabase
              .from('adaptive_items')
              .select(
                `
                problem_id,
                problem_name,
                problem_tags,
                problem_rating,
                outcome
              `
              )
              .eq('problem_id', searchResult.entity_id)
              .eq('user_id', user.id)
              .single();

            if (problemData) {
              result = {
                id: problemData.problem_id,
                type: 'problem',
                title: problemData.problem_name,
                subtitle: `Rating: ${problemData.problem_rating || 'Unknown'}`,
                description: `Tags: ${problemData.problem_tags || 'No tags'}`,
                url: `https://codeforces.com/problemset/problem/${problemData.problem_id.split('/')[0]}/${problemData.problem_id.split('/')[1]}`,
                relevanceScore: searchResult.relevance_score,
                metadata: includeMetadata
                  ? {
                      rating: problemData.problem_rating,
                      tags: problemData.problem_tags?.split(',') || [],
                      outcome: problemData.outcome,
                    }
                  : undefined,
              };
              results.push(result);
              categorizedResults.problems.push(result);
            }
            break;
        }
      }
    } catch (error) {
      console.error('Error in optimized search:', error);
      return await performBasicSearch();
    }

    async function performBasicSearch() {
      // Fallback to basic search implementation
      console.warn('Advanced search failed, using basic fallback');
      console.log('Basic search - query:', query, 'categories:', categories);

      try {
        // Simple ILIKE search as fallback
        const fallbackResults: SearchResult[] = [];

        // Search contests if requested
        if (categories.includes('contests')) {
          console.log('Searching contests...');
          const { data: contests, error: contestError } = await supabase
            .from('contests')
            .select('id, name, status, created_at')
            .ilike('name', `%${query}%`)
            .limit(Math.ceil(limit / categories.length));

          console.log('Contest search results:', {
            error: contestError?.message,
            count: contests?.length || 0,
            sample: contests?.slice(0, 2) || [],
          });

          contests?.forEach(contest => {
            fallbackResults.push({
              id: contest.id,
              type: 'contest',
              title: contest.name,
              subtitle: 'Contest',
              description: 'No description available',
              url: `/contests/${contest.id}`,
            });
          });
        }

        // Search groups if requested
        if (categories.includes('groups')) {
          const { data: groups } = await supabase
            .from('groups')
            .select('id, name, created_at')
            .ilike('name', `%${query}%`)
            .limit(Math.ceil(limit / categories.length));

          groups?.forEach(group => {
            fallbackResults.push({
              id: group.id,
              type: 'group',
              title: group.name,
              subtitle: 'Group',
              description: 'No description available',
              url: `/groups?groupId=${group.id}`,
            });
          });
        }

        // Search handles if requested
        if (categories.includes('handles')) {
          console.log('Searching handles...');
          const { data: handles, error: handleError } = await supabase
            .from('cf_handles')
            .select('id, handle, verified')
            .ilike('handle', `%${query}%`)
            .limit(Math.ceil(limit / categories.length));

          console.log('Handle search results:', {
            error: handleError?.message,
            count: handles?.length || 0,
            sample: handles?.slice(0, 2) || [],
          });

          handles?.forEach(handle => {
            fallbackResults.push({
              id: handle.id,
              type: 'handle',
              title: handle.handle,
              subtitle: `${handle.verified ? 'Verified' : 'Unverified'}`,
              description: 'CF Handle',
              url: `/profile?handle=${handle.handle}`,
            });
          });
        }

        console.log(
          'Final fallback results:',
          fallbackResults.length,
          'results'
        );

        const fallbackCategories = {
          contests: fallbackResults.filter(r => r.type === 'contest'),
          groups: fallbackResults.filter(r => r.type === 'group'),
          problems: fallbackResults.filter(r => r.type === 'problem'),
          users: fallbackResults.filter(r => r.type === 'user'),
          handles: fallbackResults.filter(r => r.type === 'handle'),
        };

        return NextResponse.json({
          results: fallbackResults.slice(0, limit),
          categories: fallbackCategories,
          totalResults: fallbackResults.length,
          query,
          searchTime: Date.now() - startTime,
          fallback: true,
        });
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        return NextResponse.json({
          results: [],
          categories: {
            contests: [],
            groups: [],
            problems: [],
            users: [],
            handles: [],
          },
          totalResults: 0,
          query,
          searchTime: Date.now() - startTime,
          fallback: true,
          error: 'Search temporarily unavailable',
        });
      }
    } // Sort results by relevance score (already provided by the search function)
    const sortedResults = results
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, limit);

    const searchTime = Date.now() - startTime;

    console.log('Final search summary:', {
      totalResultsProcessed: results.length,
      sortedResultsCount: sortedResults.length,
      categoryCounts: {
        contests: categorizedResults.contests.length,
        groups: categorizedResults.groups.length,
        problems: categorizedResults.problems.length,
        users: categorizedResults.users.length,
        handles: categorizedResults.handles.length,
      },
      searchTime,
    });

    const response: SearchResponse = {
      results: sortedResults,
      categories: categorizedResults,
      totalResults: results.length,
      query,
      searchTime,
    };

    console.log('Returning response with', response.results.length, 'results');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
