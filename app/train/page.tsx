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

export default function TrainingHub() {
  const sheetsRef = useRef<HTMLDivElement | null>(null);
  const companiesRef = useRef<HTMLDivElement | null>(null);
  const activityRef = useRef<HTMLDivElement | null>(null);
  const searchInputId = useId();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const handleQuickNav = useCallback((key: 'blind75' | 'neet250' | 'cses' | 'leetcode') => {
    sheetsRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Set appropriate filters based on quick nav
    const filterMap = {
      blind75: { query: 'Blind 75', platform: 'LeetCode' as Platform },
      neet250: { query: 'NeetCode', platform: 'LeetCode' as Platform },
      cses: { query: '', platform: 'CSES' as Platform },
      leetcode: { query: '', platform: 'LeetCode' as Platform },
    };
    
    const filter = filterMap[key];
    setFilters(prev => ({ ...prev, ...filter }));
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

  // Stats calculation
  const stats = useMemo(() => {
    const totalProblems = SHEETS.reduce((acc, sheet) => acc + sheet.total, 0);
    const completedProblems = SHEETS.reduce((acc, sheet) => acc + sheet.completed, 0);
    const completionRate = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;
    
    return {
      totalSheets: SHEETS.length,
      totalProblems,
      completedProblems,
      completionRate,
    };
  }, []);

  return (
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
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12'>
        {/* Stats Overview */}
        <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='card-3d border-l-4 border-l-blue-500 hover-lift'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-2'>
                <BookOpen className='h-8 w-8 text-blue-500' />
                <Badge variant='secondary' className='text-lg font-bold'>{stats.totalSheets}</Badge>
              </div>
              <h3 className='text-sm font-medium text-muted-foreground'>Problem Sheets</h3>
              <p className='text-lg font-bold mt-1'>Available</p>
            </CardContent>
          </Card>

          <Card className='card-3d border-l-4 border-l-green-500 hover-lift'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-2'>
                <Target className='h-8 w-8 text-green-500' />
                <Badge variant='secondary' className='text-lg font-bold'>{stats.totalProblems}</Badge>
              </div>
              <h3 className='text-sm font-medium text-muted-foreground'>Total Problems</h3>
              <p className='text-lg font-bold mt-1'>To Master</p>
            </CardContent>
          </Card>

          <Card className='card-3d border-l-4 border-l-purple-500 hover-lift'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-2'>
                <Trophy className='h-8 w-8 text-purple-500' />
                <Badge variant='secondary' className='text-lg font-bold'>{stats.completedProblems}</Badge>
              </div>
              <h3 className='text-sm font-medium text-muted-foreground'>Solved Problems</h3>
              <p className='text-lg font-bold mt-1'>Progress</p>
            </CardContent>
          </Card>

          <Card className='card-3d border-l-4 border-l-orange-500 hover-lift'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-2'>
                <Zap className='h-8 w-8 text-orange-500' />
                <Badge variant='secondary' className='text-lg font-bold'>{stats.completionRate}%</Badge>
              </div>
              <h3 className='text-sm font-medium text-muted-foreground'>Completion Rate</h3>
              <p className='text-lg font-bold mt-1'>Overall</p>
            </CardContent>
          </Card>
        </section>

        {/* Problem Sheets Section */}
        <section
          ref={sheetsRef}
          className='space-y-6'
          aria-labelledby='sheets-heading'
        >
          {/* Section Header */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <h2
                id='sheets-heading'
                className='text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-3'
              >
                <Sparkles className='h-8 w-8 text-primary animate-pulse' />
                DSA & ICPC Problem Sheets
              </h2>
              <p className='text-muted-foreground mt-2'>
                Curated collections for competitive programming excellence
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('grid')}
                className='gap-2'
              >
                <Grid3x3 className='h-4 w-4' />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='gap-2'
              >
                <List className='h-4 w-4' />
                List
              </Button>
            </div>
          </div>

          {/* Filters Card */}
          <Card className='border-border/50 bg-card/50 backdrop-blur-sm shadow-lg'>
            <CardContent className='p-4 sm:p-6'>
              <div className='space-y-4'>
                {/* Filter Label and Clear Button */}
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor={searchInputId}
                    className='text-sm font-semibold text-foreground flex items-center gap-2'
                  >
                    <Filter className='h-4 w-4 text-primary' />
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
                    <span className='text-xs text-muted-foreground self-center font-medium'>
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

        {/* Activity Heatmap Section */}
        <section ref={activityRef} className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-3'>
              <Zap className='h-6 w-6 text-orange-500' />
              Practice Activity
            </h2>
          </div>
          <ActivityHeatmap />
        </section>

        {/* Interview Grind Section */}
        <section ref={companiesRef} className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-3'>
                <Trophy className='h-6 w-6 text-yellow-500' />
                Company Practice
              </h2>
              <p className='text-muted-foreground mt-2'>
                Target problems from top tech companies
              </p>
            </div>
          </div>
          <Card className='border-primary/20 bg-gradient-to-br from-primary/5 to-transparent'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-primary' />
                Coming Soon
              </CardTitle>
              <CardDescription>
                Company-specific problem collections based on actual interview questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                We're curating problems from Google, Meta, Amazon, Microsoft, and more. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}