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

export interface SearchOptions {
  categories?: string[];
  limit?: number;
  includeMetadata?: boolean;
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
  categorizedResults: {
    contests: SearchResult[];
    groups: SearchResult[];
    problems: SearchResult[];
    users: SearchResult[];
    handles: SearchResult[];
  };
}

export function useSearch(): SearchHookReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

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
        const cacheKey = `${searchQuery}-${JSON.stringify(options)}`;
        if (searchCache.current.has(cacheKey)) {
          const cachedResults = searchCache.current.get(cacheKey) || [];
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

        const response = await fetch(`/api/search?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Search request failed');

        const data = await response.json();
        const safeResults: SearchResult[] = Array.isArray(data.results)
          ? data.results
          : [];

        setResults(safeResults);
        setTotalResults(data.totalResults ?? safeResults.length);
        setSearchTime(data.searchTime ?? 0);

        searchCache.current.set(cacheKey, safeResults);
        setTimeout(() => searchCache.current.delete(cacheKey), 5 * 60 * 1000); // 5 min cache
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
        setTotalResults(0);
        setSearchTime(0);
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

    const existingTimeout = debounceTimeouts.current.get('suggestions');
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeoutId = setTimeout(async () => {
      try {
        if (suggestionsCache.current.has(searchQuery)) {
          setSuggestions(suggestionsCache.current.get(searchQuery) || []);
          return;
        }

        const params = new URLSearchParams({ q: searchQuery, limit: '5' });
        const response = await fetch(
          `/api/search/suggestions?${params.toString()}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        let safeSuggestions: SearchSuggestion[] = [];

        if (response.ok) {
          const data = await response.json();
          safeSuggestions = Array.isArray(data.suggestions)
            ? data.suggestions
            : [];
        }

        // Provide client-side fallback if API returns empty or fails
        if (safeSuggestions.length === 0) {
          const queryLower = searchQuery.toLowerCase();
          const clientFallbacks: SearchSuggestion[] = [
            { suggestion: 'Contests', type: 'page', frequency: 10 },
            { suggestion: 'Practice Problems', type: 'page', frequency: 10 },
            { suggestion: 'Dashboard', type: 'page', frequency: 10 },
            { suggestion: 'Leaderboard', type: 'page', frequency: 10 },
            { suggestion: 'Groups', type: 'page', frequency: 10 },
          ].filter(s => s.suggestion.toLowerCase().includes(queryLower));

          safeSuggestions = clientFallbacks.slice(0, 3);
        }

        setSuggestions(safeSuggestions);
        if (safeSuggestions.length > 0) {
          suggestionsCache.current.set(searchQuery, safeSuggestions);
          setTimeout(
            () => suggestionsCache.current.delete(searchQuery),
            10 * 60 * 1000
          );
        }
      } catch (err) {
        console.warn('Failed to get suggestions:', err);
        // Don't clear suggestions on error - keep any existing ones
      }
    }, 300);

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

  const categorizedResults = useMemo(() => {
    const safeResults = results || [];
    return {
      contests: safeResults.filter(r => r.type === 'contest'),
      groups: safeResults.filter(r => r.type === 'group'),
      problems: safeResults.filter(r => r.type === 'problem'),
      users: safeResults.filter(r => r.type === 'user'),
      handles: safeResults.filter(r => r.type === 'handle'),
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
  };
}
