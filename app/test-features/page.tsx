'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSearch } from '@/hooks/use-search';
import {
  Search,
  RefreshCw,
  Database,
  TestTube,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface TestResult {
  timestamp: string;
  user: string;
  tests: {
    searchIndexRefresh: { success: boolean; error?: string };
    advancedSearch: {
      success: boolean;
      error?: string;
      resultsCount: number;
      sampleResults: any[];
    };
    searchSuggestions: {
      success: boolean;
      error?: string;
      suggestionsCount: number;
      sampleSuggestions: any[];
    };
    tableExistence: Record<
      string,
      { exists: boolean; error?: string; hasData: boolean }
    >;
    searchIndexContent: { success: boolean; error?: string; sampleData: any[] };
  };
  overallStatus: 'PASS' | 'FAIL';
  summary: {
    searchFunctionsWorking: boolean;
    materializedViewWorking: boolean;
    tablesAccessible: boolean;
  };
}

export default function TestFeaturesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const { results, loading: searchLoading, search, clearResults } = useSearch();

  // Run search if there's an initial query
  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    if (searchQuery.trim().length >= 2) {
      await search(searchQuery, {
        categories: ['contest', 'group', 'handle', 'user'],
        limit: 20,
      });
    } else {
      clearResults();
    }
  };

  const runTests = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('/api/search/test');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const refreshSearchIndex = async () => {
    setRefreshLoading(true);
    try {
      const response = await fetch('/api/search/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      });
      const data = await response.json();

      if (data.success) {
        // Re-run tests after refresh
        await runTests();
      }
    } catch (error) {
      console.error('Error refreshing search index:', error);
    } finally {
      setRefreshLoading(false);
    }
  };

  const getStatusIcon = (success?: boolean) => {
    if (success === true)
      return <CheckCircle className='h-4 w-4 text-green-500' />;
    if (success === false)
      return <AlertCircle className='h-4 w-4 text-red-500' />;
    return <TestTube className='h-4 w-4 text-white/50' />;
  };

  const getCategoryBadgeColor = (type: string) => {
    switch (type) {
      case 'contest':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'group':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'handle':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'user':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'problem':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  return (
    <main className='container mx-auto px-4 py-8 space-y-8'>
      {/* Header */}
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-bold text-white'>Test Features</h1>
        <p className='text-white/70 text-lg'>
          Test and debug the search functionality and real-time features
        </p>
      </div>

      {/* Quick Actions */}
      <div className='flex flex-wrap gap-4 justify-center'>
        <Button
          onClick={runTests}
          disabled={testLoading}
          className='bg-blue-600 hover:bg-blue-600/90'
        >
          {testLoading ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <TestTube className='h-4 w-4 mr-2' />
          )}
          Run All Tests
        </Button>
        <Button
          onClick={refreshSearchIndex}
          disabled={refreshLoading}
          variant='outline'
          className='border-white/20 text-white hover:bg-white/10'
        >
          {refreshLoading ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <RefreshCw className='h-4 w-4 mr-2' />
          )}
          Refresh Search Index
        </Button>
        <Button
          asChild
          variant='outline'
          className='border-white/20 text-white hover:bg-white/10'
        >
          <Link href='/api/search/debug'>
            <Database className='h-4 w-4 mr-2' />
            View Debug Data
          </Link>
        </Button>
      </div>

      {/* Search Testing */}
      <Card className='bg-[#1a1f36] border-[#2a3441]'>
        <CardHeader>
          <CardTitle className='text-white flex items-center gap-2'>
            <Search className='h-5 w-5' />
            Search Testing
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-2'>
            <Input
              placeholder='Enter search query...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className='bg-[#0B1020] border-[#2a3441] text-white'
            />
            <Button
              onClick={handleSearch}
              disabled={searchLoading}
              className='bg-blue-600 hover:bg-blue-600/90'
            >
              {searchLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Search className='h-4 w-4' />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-white font-semibold'>
                  Search Results ({results.length})
                </h3>
                <Button
                  onClick={clearResults}
                  variant='ghost'
                  size='sm'
                  className='text-white/70 hover:text-white'
                >
                  Clear
                </Button>
              </div>
              <div className='grid gap-3 max-h-96 overflow-y-auto'>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className='p-3 bg-[#0B1020] rounded-lg border border-[#2a3441] hover:border-blue-500/30 transition-colors'
                  >
                    <div className='flex items-start gap-3'>
                      <Badge className={getCategoryBadgeColor(result.type)}>
                        {result.type}
                      </Badge>
                      <div className='flex-1 min-w-0'>
                        <div className='text-white font-medium truncate'>
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className='text-white/70 text-sm truncate'>
                            {result.subtitle}
                          </div>
                        )}
                        {result.description && (
                          <div className='text-white/50 text-xs mt-1 truncate'>
                            {result.description}
                          </div>
                        )}
                      </div>
                      {result.relevanceScore && (
                        <div className='flex-shrink-0 text-xs text-white/40'>
                          {Math.round(result.relevanceScore * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery.length >= 2 &&
            results.length === 0 &&
            !searchLoading && (
              <div className='text-center py-8 text-white/70'>
                <Search className='h-8 w-8 mx-auto mb-2 opacity-50' />
                <div>No results found for "{searchQuery}"</div>
                <div className='text-xs text-white/50 mt-1'>
                  Try searching for contests, groups, or handles
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card className='bg-[#1a1f36] border-[#2a3441]'>
          <CardHeader>
            <CardTitle className='text-white flex items-center gap-2'>
              <TestTube className='h-5 w-5' />
              System Test Results
              <Badge
                className={
                  testResults.overallStatus === 'PASS'
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }
              >
                {testResults.overallStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Summary */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='p-3 bg-[#0B1020] rounded-lg border border-[#2a3441]'>
                <div className='flex items-center gap-2 mb-1'>
                  {getStatusIcon(testResults.summary.searchFunctionsWorking)}
                  <span className='text-white font-medium'>
                    Search Functions
                  </span>
                </div>
                <div className='text-xs text-white/70'>
                  Advanced search and suggestions
                </div>
              </div>
              <div className='p-3 bg-[#0B1020] rounded-lg border border-[#2a3441]'>
                <div className='flex items-center gap-2 mb-1'>
                  {getStatusIcon(testResults.summary.materializedViewWorking)}
                  <span className='text-white font-medium'>Search Index</span>
                </div>
                <div className='text-xs text-white/70'>
                  Materialized view and refresh
                </div>
              </div>
              <div className='p-3 bg-[#0B1020] rounded-lg border border-[#2a3441]'>
                <div className='flex items-center gap-2 mb-1'>
                  {getStatusIcon(testResults.summary.tablesAccessible)}
                  <span className='text-white font-medium'>
                    Database Tables
                  </span>
                </div>
                <div className='text-xs text-white/70'>
                  All required tables accessible
                </div>
              </div>
            </div>

            <Separator className='bg-[#2a3441]' />

            {/* Detailed Results */}
            <div className='space-y-4'>
              <h3 className='text-white font-semibold'>
                Detailed Test Results
              </h3>

              {/* Advanced Search Test */}
              <div className='p-3 bg-[#0B1020] rounded-lg border border-[#2a3441]'>
                <div className='flex items-center gap-2 mb-2'>
                  {getStatusIcon(testResults.tests.advancedSearch.success)}
                  <span className='text-white font-medium'>
                    Advanced Search
                  </span>
                </div>
                {testResults.tests.advancedSearch.success ? (
                  <div className='text-sm text-white/70'>
                    Found {testResults.tests.advancedSearch.resultsCount}{' '}
                    results
                  </div>
                ) : (
                  <div className='text-sm text-red-300'>
                    Error: {testResults.tests.advancedSearch.error}
                  </div>
                )}
              </div>

              {/* Search Suggestions Test */}
              <div className='p-3 bg-[#0B1020] rounded-lg border border-[#2a3441]'>
                <div className='flex items-center gap-2 mb-2'>
                  {getStatusIcon(testResults.tests.searchSuggestions.success)}
                  <span className='text-white font-medium'>
                    Search Suggestions
                  </span>
                </div>
                {testResults.tests.searchSuggestions.success ? (
                  <div className='text-sm text-white/70'>
                    Generated{' '}
                    {testResults.tests.searchSuggestions.suggestionsCount}{' '}
                    suggestions
                  </div>
                ) : (
                  <div className='text-sm text-red-300'>
                    Error: {testResults.tests.searchSuggestions.error}
                  </div>
                )}
              </div>

              {/* Table Existence Tests */}
              <div className='p-3 bg-[#0B1020] rounded-lg border border-[#2a3441]'>
                <div className='flex items-center gap-2 mb-2'>
                  <Database className='h-4 w-4 text-white/70' />
                  <span className='text-white font-medium'>
                    Database Tables
                  </span>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  {Object.entries(testResults.tests.tableExistence).map(
                    ([table, result]) => (
                      <div key={table} className='flex items-center gap-2'>
                        {getStatusIcon(result.exists)}
                        <span className='text-xs text-white/70'>{table}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className='text-xs text-white/50 pt-4 border-t border-[#2a3441]'>
              Last updated: {new Date(testResults.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      <Card className='bg-[#1a1f36] border-[#2a3441]'>
        <CardHeader>
          <CardTitle className='text-white'>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-white/70 space-y-2'>
            <p>
              1. <strong>Run Tests</strong> - Check if all search components are
              working properly
            </p>
            <p>
              2. <strong>Test Search</strong> - Try searching for contests,
              groups, or CF handles
            </p>
            <p>
              3. <strong>Check Debug Data</strong> - View raw database content
              and search indices
            </p>
            <p>
              4. <strong>Refresh Index</strong> - Update search index if results
              seem outdated
            </p>
            <p>
              5. <strong>Test Notifications</strong> - Visit /test-features/notifications
              to test smart notification features
            </p>
          </div>

          <div className='flex flex-wrap gap-2 pt-4'>
            <Badge
              variant='outline'
              className='border-purple-500/30 text-purple-300'
            >
              contests
            </Badge>
            <Badge
              variant='outline'
              className='border-green-500/30 text-green-300'
            >
              groups
            </Badge>
            <Badge
              variant='outline'
              className='border-blue-500/30 text-blue-300'
            >
              handles
            </Badge>
            <Badge
              variant='outline'
              className='border-orange-500/30 text-orange-300'
            >
              users
            </Badge>
            <Badge
              variant='outline'
              className='border-yellow-500/30 text-yellow-300'
            >
              notifications
            </Badge>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
