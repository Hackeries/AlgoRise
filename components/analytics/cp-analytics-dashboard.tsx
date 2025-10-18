'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
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
} from 'recharts';
import {
  TrendingUp,
  Trophy,
  Target,
  Zap,
  Award,
  RefreshCw,
  AlertCircle,
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

export function CPAnalyticsDashboard({ handle }: DashboardProps) {
  const [data, setData] = useState<CPAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `/api/analytics/cp-profile?handle=${handle}`
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const analytics = await response.json();
      setData(analytics);
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
    { name: 'Medium', value: data.difficultyStats.medium, color: '#f59e0b' },
    { name: 'Hard', value: data.difficultyStats.hard, color: '#ef4444' },
  ];

  return (
    <div className='space-y-6'>
      {/* Header with Refresh */}
      <div className='flex items-center justify-between'>
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
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Key Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Problems Solved</p>
                <p className='text-3xl font-bold mt-2'>
                  {data.stats.totalSolved}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Acceptance: {data.stats.acceptanceRate}%
                </p>
              </div>
              <Target className='h-8 w-8 text-primary opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Current Rating</p>
                <p className='text-3xl font-bold mt-2'>
                  {data.stats.currentRating}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    data.stats.ratingChange >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {data.stats.ratingChange >= 0 ? '+' : ''}
                  {data.stats.ratingChange} from max
                </p>
              </div>
              <Trophy className='h-8 w-8 text-yellow-500 opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Contests</p>
                <p className='text-3xl font-bold mt-2'>{data.stats.contests}</p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Rank: {data.stats.rank}
                </p>
              </div>
              <Zap className='h-8 w-8 text-blue-500 opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Max Rating</p>
                <p className='text-3xl font-bold mt-2'>
                  {data.stats.maxRating}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Rank: {data.stats.maxRank}
                </p>
              </div>
              <Award className='h-8 w-8 text-orange-500 opacity-50' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='topics'>Topics</TabsTrigger>
          <TabsTrigger value='difficulty'>Difficulty</TabsTrigger>
          <TabsTrigger value='recent'>Recent</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Rating Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ratingChartData.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={ratingChartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='name'
                      angle={-45}
                      textAnchor='end'
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='rating'
                      stroke='#3b82f6'
                      strokeWidth={2}
                      name='Rating'
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className='text-center text-muted-foreground py-8'>
                  No rating history available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value='topics' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Top Topics by Problems Solved</CardTitle>
            </CardHeader>
            <CardContent>
              {topicChartData.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={topicChartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='topic'
                      angle={-45}
                      textAnchor='end'
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
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

          {/* Topic Accuracy Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {topicChartData.map(topic => (
              <Card key={topic.topic}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-semibold capitalize'>{topic.topic}</h3>
                    <Badge variant='secondary'>{topic.accuracy}%</Badge>
                  </div>
                  <div className='space-y-1 text-sm'>
                    <p className='text-muted-foreground'>
                      Solved: {topic.solved}/{topic.attempted}
                    </p>
                    <div className='w-full bg-muted rounded-full h-2'>
                      <div
                        className='bg-primary h-2 rounded-full'
                        style={{ width: `${topic.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Difficulty Tab */}
        <TabsContent value='difficulty' className='space-y-4'>
          <Card>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Submissions Tab */}
        <TabsContent value='recent' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 max-h-96 overflow-y-auto'>
                {data.recentSubmissions.slice(0, 20).map(submission => (
                  <div
                    key={submission.id}
                    className='flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors'
                  >
                    <div className='flex-1'>
                      <p className='font-semibold text-sm'>
                        {submission.problem.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {submission.problem.tags.join(', ')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        submission.verdict === 'OK' ? 'default' : 'destructive'
                      }
                    >
                      {submission.verdict}
                    </Badge>
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