import { useState, useCallback, useRef, useMemo } from 'react';

export interface SearchResult {
  id: string;
  type: 'contest' | 'group' | 'problem' | 'user' | 'handle';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
  relevanceScore?: number;
}
export interface SearchSuggestion {
  suggestion: string;
  type: string;
  frequency: number;
}

export interface SearchHookReturn {
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  loading: boolean;
  error: string | null;
  query: string;
  totalResults: number;
  searchTime: number;
  search: (query: string, options?: SearchOptions) => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  clearResults: () => void;
}

export interface SearchOptions {
  categories?: string[];
  limit?: number;
  includeMetadata?: boolean;
}

export function useSearch(): SearchHookReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  // Debounce and cache for suggestions
  const suggestionsCache = useRef<Map<string, SearchSuggestion[]>>(new Map());
  const searchCache = useRef<Map<string, SearchResult[]>>(new Map());
  const debounceTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const search = useCallback(
    async (searchQuery: string, options: SearchOptions = {}) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([]);
        setTotalResults(0);
        setQuery(searchQuery);
        return;
      }

      setLoading(true);
      setError(null);
      setQuery(searchQuery);

      try {
        // Check cache first
        const cacheKey = `${searchQuery}-${JSON.stringify(options)}`;
        if (searchCache.current.has(cacheKey)) {
          const cachedResults = searchCache.current.get(cacheKey)!;
          setResults(cachedResults);
          setTotalResults(cachedResults.length);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          q: searchQuery,
          ...(options.categories && {
            categories: options.categories.join(','),
          }),
          ...(options.limit && { limit: options.limit.toString() }),
          ...(options.includeMetadata && { metadata: 'true' }),
        });

        const response = await fetch(`/api/search?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const data = await response.json();

        setResults(data.results);
        setTotalResults(data.totalResults);
        setSearchTime(data.searchTime);

        // Cache results for 5 minutes
        searchCache.current.set(cacheKey, data.results);
        setTimeout(
          () => {
            searchCache.current.delete(cacheKey);
          },
          5 * 60 * 1000
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // Clear previous debounce timeout
    const existingTimeout = debounceTimeouts.current.get('suggestions');
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Debounce suggestions
    const timeoutId = setTimeout(async () => {
      try {
        // Check cache first
        if (suggestionsCache.current.has(searchQuery)) {
          setSuggestions(suggestionsCache.current.get(searchQuery)!);
          return;
        }

        const params = new URLSearchParams({
          q: searchQuery,
          limit: '5',
        });

        const response = await fetch(`/api/search/suggestions?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Suggestions request failed');
        }

        const data = await response.json();
        setSuggestions(data.suggestions);

        // Cache suggestions for 10 minutes
        suggestionsCache.current.set(searchQuery, data.suggestions);
        setTimeout(
          () => {
            suggestionsCache.current.delete(searchQuery);
          },
          10 * 60 * 1000
        );
      } catch (err) {
        console.error('Failed to get suggestions:', err);
        setSuggestions([]);
      }
    }, 300); // 300ms debounce

    debounceTimeouts.current.set('suggestions', timeoutId);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setSuggestions([]);
    setQuery('');
    setTotalResults(0);
    setSearchTime(0);
    setError(null);
  }, []);

  // Categorized results for easier frontend consumption
  const categorizedResults = useMemo(() => {
    return {
      contests: results.filter(r => r.type === 'contest'),
      groups: results.filter(r => r.type === 'group'),
      problems: results.filter(r => r.type === 'problem'),
      users: results.filter(r => r.type === 'user'),
      handles: results.filter(r => r.type === 'handle'),
    };
  }, [results]);
  return {
    results,
    suggestions,
    loading,
    error,
    query,
    totalResults,
    searchTime,
    search,
    getSuggestions,
    clearResults,
    categorizedResults,
  } as SearchHookReturn & { categorizedResults: typeof categorizedResults };
}
