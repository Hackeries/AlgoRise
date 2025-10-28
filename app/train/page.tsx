 feature/add-problem-generator-&-test-case
import { TrainHeader } from '@/components/train/header';
import { DailyChallenge } from '@/components/train/daily-challenge';
import { TopicLadder } from '@/components/train/topic-ladder';
import { ProblemRecos } from '@/components/train/problem-recos';
import { Speedrun } from '@/components/train/speedrun';
import { UpcomingContests } from '@/components/train/contests';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Zap, FileText, TestTube } from 'lucide-react';

'use client';

import { useRef, useState, useMemo, useCallback, useId } from 'react';
import { Sparkles, ChevronRight, Search, X } from 'lucide-react';
import { TrainHero } from '@/components/train/hero';
import { SheetsGrid, type Sheet } from '@/components/train/sheets-grid';
import { CompanyGrid, type CompanySet } from '@/components/train/company-grid';
import { ActivityHeatmap } from '@/components/train/activity-heatmap';
import { buildInterviewGrindFull } from '@/data/interview-grind';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Constants
const SHEETS: Sheet[] = [
  /* ...your sheets data... */
];

const COMPANIES: CompanySet[] = [
  /* ...your companies data... */
];

const INTERVIEW_GRIND_BY_COMPANY = buildInterviewGrindFull();

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const PLATFORMS = ['LeetCode', 'CSES', 'Internal'] as const;

type Difficulty = (typeof DIFFICULTIES)[number];
type Platform = (typeof PLATFORMS)[number];

type Filters = {
  query: string;
  difficulty?: Difficulty;
  platform?: Platform;
  topic?: string;
};
 main

export default function TrainingHub() {
  const sheetsRef = useRef<HTMLDivElement | null>(null);
  const searchInputId = useId();

  const [filters, setFilters] = useState<Filters>({
    query: '',
    difficulty: undefined,
    platform: undefined,
    topic: undefined,
  });

  // Memoized topics list
  const allTopics = useMemo(
    () => Array.from(new Set(SHEETS.flatMap(s => s.topics))).sort(),
    []
  );

  // Optimized filter update handlers
  const handleQueryChange = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }));
  }, []);

  const handleDifficultyChange = useCallback((difficulty?: Difficulty) => {
    setFilters(prev => ({ ...prev, difficulty }));
  }, []);

  const handlePlatformChange = useCallback((platform?: Platform) => {
    setFilters(prev => ({ ...prev, platform }));
  }, []);

  const handleTopicChange = useCallback((topic?: string) => {
    setFilters(prev => ({ ...prev, topic }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      difficulty: undefined,
      platform: undefined,
      topic: undefined,
    });
  }, []);

  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, query: '' }));
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      filters.query !== '' ||
      filters.difficulty !== undefined ||
      filters.platform !== undefined ||
      filters.topic !== undefined,
    [filters]
  );

  return (
 feature/add-problem-generator-&-test-case
    <main className='min-h-screen bg-background text-foreground'>
      <section className='max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6'>
        <TrainHeader />

        {/* Problem Generator Section */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Problem Generator & Custom Test Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Generate unlimited practice problems and comprehensive test cases using algorithmic templates.
              Create custom test cases for thorough solution validation.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/problem-generator">
                <Button>
                  Generate Problems
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/test-suites">
                <Button variant="outline">
                  <TestTube className="mr-2 h-4 w-4" />
                  Manage Test Suites
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Row 1: Topic Ladder + Daily Challenge */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-2'>
            <TopicLadder />
          </div>
          <div className='lg:col-span-1'>
            <DailyChallenge />
          </div>

    <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted/20'>
      {/* Hero Section */}
      <header className='sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <TrainHero
            onQuickNav={() =>
              sheetsRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          />
 main
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12'>
        {/* Problem Sheets Section */}
        <section
          ref={sheetsRef}
          className='space-y-6'
          aria-labelledby='sheets-heading'
        >
          {/* Section Header */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <h2
              id='sheets-heading'
              className='text-3xl font-bold tracking-tight text-foreground'
            >
              Problem Sheets
            </h2>
            <Button
              variant='ghost'
              size='sm'
              className='text-primary hover:text-primary/90 hover:bg-primary/10 transition-colors'
            >
              View All
              <ChevronRight className='h-4 w-4 ml-1' aria-hidden='true' />
            </Button>
          </div>

          {/* Filters Card */}
          <Card className='border-border/50 bg-card/50 backdrop-blur-sm'>
            <CardContent className='p-4 sm:p-6'>
              <div className='space-y-4'>
                {/* Filter Label and Clear Button */}
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor={searchInputId}
                    className='text-sm font-medium text-muted-foreground'
                  >
                    Filter Problem Sheets
                  </label>
                  {hasActiveFilters && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={clearFilters}
                      className='h-8 text-xs text-muted-foreground hover:text-foreground'
                    >
                      <X className='h-3 w-3 mr-1' aria-hidden='true' />
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                  {/* Search Input */}
                  <div className='relative sm:col-span-2'>
                    <Search
                      className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground'
                      aria-hidden='true'
                    />
                    <Input
                      id={searchInputId}
                      type='search'
                      placeholder='Search by title, topic, or company…'
                      value={filters.query}
                      onChange={e => handleQueryChange(e.target.value)}
                      className='pl-9 bg-background border-border focus-visible:ring-primary'
                      aria-label='Search problem sheets'
                    />
                    {filters.query && (
                      <button
                        onClick={clearSearch}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                        aria-label='Clear search'
                      >
                        <X className='h-4 w-4' aria-hidden='true' />
                      </button>
                    )}
                  </div>

                  {/* Difficulty Select */}
                  <Select
                    value={filters.difficulty || 'all'}
                    onValueChange={value =>
                      handleDifficultyChange(
                        value === 'all' ? undefined : (value as Difficulty)
                      )
                    }
                  >
                    <SelectTrigger
                      className='bg-background border-border'
                      aria-label='Filter by difficulty'
                    >
                      <SelectValue placeholder='Difficulty' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Difficulties</SelectItem>
                      {DIFFICULTIES.map(diff => (
                        <SelectItem key={diff} value={diff}>
                          {diff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Platform Select */}
                  <Select
                    value={filters.platform || 'all'}
                    onValueChange={value =>
                      handlePlatformChange(
                        value === 'all' ? undefined : (value as Platform)
                      )
                    }
                  >
                    <SelectTrigger
                      className='bg-background border-border'
                      aria-label='Filter by platform'
                    >
                      <SelectValue placeholder='Platform' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Platforms</SelectItem>
                      {PLATFORMS.map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Topic Select - Full Width on Mobile */}
                  <div className='sm:col-span-2 lg:col-span-4'>
                    <Select
                      value={filters.topic || 'all'}
                      onValueChange={value =>
                        handleTopicChange(value === 'all' ? undefined : value)
                      }
                    >
                      <SelectTrigger
                        className='bg-background border-border'
                        aria-label='Filter by topic'
                      >
                        <SelectValue placeholder='All Topics' />
                      </SelectTrigger>
                      <SelectContent className='max-h-[300px]'>
                        <SelectItem value='all'>All Topics</SelectItem>
                        {allTopics.map(topic => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className='flex flex-wrap gap-2 pt-2 border-t border-border/50'>
                    <span className='text-xs text-muted-foreground self-center'>
                      Active filters:
                    </span>
                    {filters.difficulty && (
                      <Badge
                        variant='secondary'
                        className='gap-1 pr-1 cursor-pointer hover:bg-secondary/80'
                        onClick={() => handleDifficultyChange(undefined)}
                      >
                        {filters.difficulty}
                        <X className='h-3 w-3' aria-hidden='true' />
                      </Badge>
                    )}
                    {filters.platform && (
                      <Badge
                        variant='secondary'
                        className='gap-1 pr-1 cursor-pointer hover:bg-secondary/80'
                        onClick={() => handlePlatformChange(undefined)}
                      >
                        {filters.platform}
                        <X className='h-3 w-3' aria-hidden='true' />
                      </Badge>
                    )}
                    {filters.topic && (
                      <Badge
                        variant='secondary'
                        className='gap-1 pr-1 cursor-pointer hover:bg-secondary/80'
                        onClick={() => handleTopicChange(undefined)}
                      >
                        {filters.topic}
                        <X className='h-3 w-3' aria-hidden='true' />
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sheets Grid */}
          <SheetsGrid sheets={SHEETS} filters={filters} />
        </section>

        {/* Interview Grind Section */}
        {/* …existing code for Interview Grind… */}

        {/* Activity Heatmap Section */}
        {/* …existing code for Activity Heatmap… */}

        {/* Company Sets Section */}
        {/* …existing code for Company Sets… */}
      </main>
    </div>
  );
}