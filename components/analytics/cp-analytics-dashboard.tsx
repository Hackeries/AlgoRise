'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Trophy,
  Target,
  Zap,
  Award,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CPAnalytics {
  user: {
    handle: string;
    rating?: number;
    maxRating?: number;
    rank?: string;
    maxRank?: string;
    contestCount?: number;
    ratingChanges?: Array<{
      contestId: number;
      contestName: string;
      rating: number;
      ratingChange: number;
      date: number;
    }>;
  };
  stats: {
    totalSolved: number;
    totalSubmissions: number;
    acceptanceRate: number;
    currentRating: number;
    maxRating: number;
    ratingChange: number;
    rank: string;
    maxRank: string;
    contests: number;
  };
  topicStats: Record<
    string,
    { solved: number; attempted: number; accuracy: number }
  >;
  difficultyStats: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentSubmissions: Array<{
    id: number;
    contestId: number;
    creationTimeSeconds: number;
    relativeTimeSeconds: number;
    problem: {
      contestId: number;
      index: string;
      name: string;
      type: string;
      points?: number;
      rating?: number;
      tags: string[];
    };
    author: { contestId: number; members: Array<{ handle: string }> };
    programmingLanguage: string;
    verdict: string;
    testset: string;
    passedTestCount: number;
    timeConsumedMillis: number;
    memoryConsumedBytes: number;
  }>;
  ratingHistory: Array<{
    contestId: number;
    contestName: string;
    rating: number;
    ratingChange: number;
    date: number;
  }>;
}

interface DashboardProps {
  handle: string;
}

function getDivTier(rating: number): { div: string; color: string } {
  if (rating < 1200) return { div: 'Div 4', color: '#6366f1' };
  if (rating < 1400) return { div: 'Div 3', color: '#8b5cf6' };
  if (rating < 1600) return { div: 'Div 2', color: '#ec4899' };
  if (rating < 1900) return { div: 'Div 1', color: '#f59e0b' };
  return { div: 'Master', color: '#ef4444' };
}

function getProblemDifficultyColor(rating?: number): string {
  if (!rating) return '#6b7280';
  if (rating < 1200) return '#10b981'; // Easy - Green
  if (rating < 1400) return '#3b82f6'; // Medium - Blue
  if (rating < 1600) return '#f59e0b'; // Hard - Orange
  if (rating < 1900) return '#ef4444'; // Very Hard - Red
  return '#8b5cf6'; // Expert - Purple
}

export function CPAnalyticsDashboard({ handle }: DashboardProps) {
  const [data, setData] = useState<CPAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRatingChange, setLastRatingChange] = useState<{
    change: number;
    timestamp: string;
  } | null>(null);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `/api/analytics/cp-profile?handle=${handle}`
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const analytics = await response.json();
      setData(analytics);

      if (analytics.ratingHistory && analytics.ratingHistory.length > 0) {
        const lastContest =
          analytics.ratingHistory[analytics.ratingHistory.length - 1];
        setLastRatingChange({
          change: lastContest.ratingChange,
          timestamp: new Date(lastContest.date * 1000).toLocaleDateString(),
        });
      }

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch analytics'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [handle]);

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className='p-6'>
                <Skeleton className='h-20 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className='border-destructive/50 bg-destructive/5'>
        <CardContent className='p-6 flex items-center gap-3'>
          <AlertCircle className='h-5 w-5 text-destructive' />
          <div>
            <p className='font-semibold text-destructive'>
              Error Loading Analytics
            </p>
            <p className='text-sm text-muted-foreground'>{error}</p>
          </div>
          <Button
            onClick={fetchAnalytics}
            variant='outline'
            size='sm'
            className='ml-auto bg-transparent'
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const ratingChartData = data.ratingHistory.slice(-20).map(r => ({
    name: r.contestName,
    rating: r.rating,
    change: r.ratingChange,
    div: getDivTier(r.rating).div,
    divColor: getDivTier(r.rating).color,
  }));

  const topicChartData = Object.entries(data.topicStats)
    .sort((a, b) => b[1].solved - a[1].solved)
    .slice(0, 10)
    .map(([topic, stats]) => ({
      topic,
      solved: stats.solved,
      attempted: stats.attempted,
      accuracy: stats.accuracy,
    }));

  const difficultyChartData = [
    { name: 'Easy', value: data.difficultyStats.easy, color: '#10b981' },
    { name: 'Medium', value: data.difficultyStats.medium, color: '#3b82f6' },
    { name: 'Hard', value: data.difficultyStats.hard, color: '#f59e0b' },
  ];

  const divWiseData = ratingChartData.map(item => ({
    ...item,
    divColor: getDivTier(item.rating).color,
  }));

  return (
    <div className='section-spacing content-padding'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
        <div>
          <h2 className='text-2xl font-bold'>
            CP Analytics for {data.user.handle}
          </h2>
          <p className='text-sm text-muted-foreground'>
            Real-time competitive programming statistics
          </p>
        </div>
        <Button
          onClick={fetchAnalytics}
          disabled={refreshing}
          variant='outline'
          size='sm'
          className='btn-hover bg-transparent'
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 card-spacing mb-8'>
        <Card className='stat-card group'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-sm text-muted-foreground group-hover:text-primary transition-colors'>
                  Problems Solved
                </p>
                <p className='text-3xl font-bold mt-2'>
                  {data.stats.totalSolved}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Acceptance: {data.stats.acceptanceRate}%
                </p>
              </div>
              <Target className='h-8 w-8 text-primary opacity-50 group-hover:opacity-100 transition-opacity' />
            </div>
          </CardContent>
        </Card>

        <Card className='stat-card group'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-sm text-muted-foreground group-hover:text-primary transition-colors'>
                  Current Rating
                </p>
                <p className='text-3xl font-bold mt-2'>
                  {data.stats.currentRating}
                </p>
                <div className='flex items-center gap-1 mt-1'>
                  {lastRatingChange && lastRatingChange.change !== 0 ? (
                    <>
                      {lastRatingChange.change > 0 ? (
                        <ArrowUp className='h-3 w-3 text-green-500' />
                      ) : (
                        <ArrowDown className='h-3 w-3 text-red-500' />
                      )}
                      <p
                        className={`text-xs font-semibold ${
                          lastRatingChange.change >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {lastRatingChange.change >= 0 ? '+' : ''}
                        {lastRatingChange.change}
                      </p>
                    </>
                  ) : (
                    <p className='text-xs text-muted-foreground'>No change</p>
                  )}
                </div>
              </div>
              <Trophy className='h-8 w-8 text-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity' />
            </div>
          </CardContent>
        </Card>

        <Card className='stat-card group'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-sm text-muted-foreground group-hover:text-primary transition-colors'>
                  Contests
                </p>
                <p className='text-3xl font-bold mt-2'>{data.stats.contests}</p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Rank: {data.stats.rank}
                </p>
              </div>
              <Zap className='h-8 w-8 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity' />
            </div>
          </CardContent>
        </Card>

        <Card className='stat-card group'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-sm text-muted-foreground group-hover:text-primary transition-colors'>
                  Max Rating
                </p>
                <p className='text-3xl font-bold mt-2'>
                  {data.stats.maxRating}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Rank: {data.stats.maxRank}
                </p>
              </div>
              <Award className='h-8 w-8 text-orange-500 opacity-50 group-hover:opacity-100 transition-opacity' />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg'>
          <TabsTrigger
            value='overview'
            className='hover:bg-muted transition-colors data-[state=active]:bg-primary/20'
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value='topics'
            className='hover:bg-muted transition-colors data-[state=active]:bg-primary/20'
          >
            Topics
          </TabsTrigger>
          <TabsTrigger
            value='difficulty'
            className='hover:bg-muted transition-colors data-[state=active]:bg-primary/20'
          >
            Difficulty
          </TabsTrigger>
          <TabsTrigger
            value='recent'
            className='hover:bg-muted transition-colors data-[state=active]:bg-primary/20'
          >
            Recent
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Div-wise breakdown */}
        <TabsContent value='overview' className='space-y-4'>
          <Card className='section-hover'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Rating Progression (Div-wise)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ratingChartData.length > 0 ? (
                <div className='space-y-4'>
                  <ResponsiveContainer width='100%' height={350}>
                    <ComposedChart data={divWiseData}>
                      <defs>
                        <linearGradient
                          id='ratingGradient'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='0%'
                            stopColor='#3b82f6'
                            stopOpacity={0.3}
                          />
                          <stop
                            offset='100%'
                            stopColor='#3b82f6'
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                      <XAxis
                        dataKey='name'
                        angle={-45}
                        textAnchor='end'
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem',
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'rating') return [value, 'Rating'];
                          if (name === 'change') {
                            return [
                              `${value >= 0 ? '+' : ''}${value}`,
                              'Change',
                            ];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Area
                        type='monotone'
                        dataKey='rating'
                        stroke='#3b82f6'
                        fill='url(#ratingGradient)'
                        strokeWidth={2}
                        name='Rating'
                      />
                      <Line
                        type='monotone'
                        dataKey='change'
                        stroke='#10b981'
                        strokeWidth={2}
                        name='Change'
                        yAxisId='right'
                      />
                    </ComposedChart>
                  </ResponsiveContainer>

                  <div className='grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t'>
                    {[
                      { div: 'Div 4', color: '#6366f1', range: '< 1200' },
                      { div: 'Div 3', color: '#8b5cf6', range: '1200-1400' },
                      { div: 'Div 2', color: '#ec4899', range: '1400-1600' },
                      { div: 'Div 1', color: '#f59e0b', range: '1600-1900' },
                      { div: 'Master', color: '#ef4444', range: '≥ 1900' },
                    ].map(item => (
                      <div
                        key={item.div}
                        className='flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer'
                      >
                        <div
                          className='w-3 h-3 rounded-full flex-shrink-0'
                          style={{ backgroundColor: item.color }}
                        />
                        <div className='text-xs min-w-0'>
                          <p className='font-semibold truncate'>{item.div}</p>
                          <p className='text-muted-foreground truncate'>
                            {item.range}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className='text-center text-muted-foreground py-8'>
                  No rating history available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab - Improved layout without duplicates */}
        <TabsContent value='topics' className='space-y-4'>
          <Card className='section-hover'>
            <CardHeader>
              <CardTitle>Top Topics by Problems Solved</CardTitle>
            </CardHeader>
            <CardContent>
              {topicChartData.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={topicChartData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                    <XAxis
                      dataKey='topic'
                      angle={-45}
                      textAnchor='end'
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Bar dataKey='solved' fill='#10b981' name='Solved' />
                    <Bar dataKey='attempted' fill='#f59e0b' name='Attempted' />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className='text-center text-muted-foreground py-8'>
                  No topic data available
                </p>
              )}
            </CardContent>
          </Card>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 card-spacing'>
            {topicChartData.slice(0, 6).map(topic => (
              <Card key={topic.topic} className='stat-card group'>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-semibold capitalize group-hover:text-primary transition-colors truncate'>
                      {topic.topic}
                    </h3>
                    <Badge
                      variant='secondary'
                      className='group-hover:bg-primary/20 transition-colors flex-shrink-0 ml-2'
                    >
                      {topic.accuracy}%
                    </Badge>
                  </div>
                  <div className='space-y-1 text-sm'>
                    <p className='text-muted-foreground'>
                      Solved: {topic.solved}/{topic.attempted}
                    </p>
                    <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
                      <div
                        className='bg-gradient-to-r from-primary to-primary/50 h-2 rounded-full transition-all duration-500'
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Difficulty Tab */}
        <TabsContent value='difficulty' className='space-y-4'>
          <Card className='section-hover'>
            <CardHeader>
              <CardTitle>Problems by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={difficultyChartData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {difficultyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Submissions Tab - Limited to 15 items, improved styling */}
        <TabsContent value='recent' className='space-y-4'>
          <Card className='section-hover'>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 max-h-96 overflow-y-auto scrollbar-thin'>
                {data.recentSubmissions.slice(0, 15).map(submission => (
                  <div
                    key={submission.id}
                    className='flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer group border border-transparent'
                  >
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-sm group-hover:text-primary transition-colors truncate'>
                        {submission.problem.name}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {submission.problem.tags.slice(0, 3).join(', ')}
                        {submission.problem.tags.length > 3 &&
                          ` +${submission.problem.tags.length - 3}`}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 flex-shrink-0 ml-2'>
                      {submission.problem.rating && (
                        <Badge
                          variant='outline'
                          style={{
                            backgroundColor: getProblemDifficultyColor(
                              submission.problem.rating
                            ),
                            color: 'white',
                            borderColor: getProblemDifficultyColor(
                              submission.problem.rating
                            ),
                          }}
                        >
                          {submission.problem.rating}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          submission.verdict === 'OK'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {submission.verdict}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
