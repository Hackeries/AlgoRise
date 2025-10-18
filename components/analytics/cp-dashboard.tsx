'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Flame,
  Zap,
  Award,
  TrendingDown,
} from 'lucide-react';

// Mock data for CP analytics
const mockRatingData = [
  { date: 'Week 1', rating: 800, contests: 2 },
  { date: 'Week 2', rating: 850, contests: 3 },
  { date: 'Week 3', rating: 920, contests: 2 },
  { date: 'Week 4', rating: 1050, contests: 4 },
  { date: 'Week 5', rating: 1100, contests: 3 },
  { date: 'Week 6', rating: 1200, contests: 5 },
];

const mockTopicData = [
  { topic: 'Arrays', solved: 45, easy: 20, medium: 18, hard: 7 },
  { topic: 'Strings', solved: 38, easy: 15, medium: 16, hard: 7 },
  { topic: 'Graphs', solved: 32, easy: 8, medium: 15, hard: 9 },
  { topic: 'DP', solved: 28, easy: 5, medium: 12, hard: 11 },
  { topic: 'Math', solved: 25, easy: 12, medium: 10, hard: 3 },
  { topic: 'Recursion', solved: 22, easy: 10, medium: 8, hard: 4 },
];

const mockPlatformData = [
  { name: 'Codeforces', value: 120, color: '#3b82f6' },
  { name: 'LeetCode', value: 95, color: '#10b981' },
  { name: 'AtCoder', value: 65, color: '#f59e0b' },
  { name: 'CodeChef', value: 45, color: '#8b5cf6' },
];

const mockDifficultyData = [
  { name: 'Easy', value: 85, color: '#10b981' },
  { name: 'Medium', value: 120, color: '#f59e0b' },
  { name: 'Hard', value: 45, color: '#ef4444' },
];

const mockContestData = [
  {
    contestId: 'CF1234',
    date: '2024-01-15',
    rank: 245,
    rating: 1050,
    problems: 4,
    time: '2:15',
  },
  {
    contestId: 'CF1235',
    date: '2024-01-22',
    rank: 189,
    rating: 1100,
    problems: 5,
    time: '1:45',
  },
  {
    contestId: 'CF1236',
    date: '2024-01-29',
    rank: 312,
    rating: 1200,
    problems: 3,
    time: '2:45',
  },
];

const mockWeakTopics = [
  { topic: 'Segment Trees', accuracy: 35, attempts: 8 },
  { topic: 'Fenwick Trees', accuracy: 42, attempts: 6 },
  { topic: 'Heavy-Light Decomposition', accuracy: 25, attempts: 4 },
  { topic: 'Digit DP', accuracy: 40, attempts: 5 },
];

export function CPDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <div className='space-y-6'>
      {/* Header Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Total Problems Solved
                </p>
                <p className='text-3xl font-bold mt-2'>325</p>
                <p className='text-xs text-green-500 mt-1'>+12 this week</p>
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
                <p className='text-3xl font-bold mt-2'>1200</p>
                <p className='text-xs text-green-500 mt-1'>+100 this month</p>
              </div>
              <Trophy className='h-8 w-8 text-yellow-500 opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Contests Participated
                </p>
                <p className='text-3xl font-bold mt-2'>18</p>
                <p className='text-xs text-blue-500 mt-1'>Avg rank: 245</p>
              </div>
              <Zap className='h-8 w-8 text-blue-500 opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Current Streak</p>
                <p className='text-3xl font-bold mt-2'>24</p>
                <p className='text-xs text-orange-500 mt-1'>days</p>
              </div>
              <Flame className='h-8 w-8 text-orange-500 opacity-50' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='topics'>Topics</TabsTrigger>
          <TabsTrigger value='contests'>Contests</TabsTrigger>
          <TabsTrigger value='weak'>Weak Areas</TabsTrigger>
          <TabsTrigger value='insights'>Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {/* Rating Trend */}
            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Rating Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={mockRatingData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
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
              </CardContent>
            </Card>

            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Platform Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={mockPlatformData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {mockPlatformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Difficulty Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Difficulty-wise Problem Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={mockDifficultyData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='value' fill='#3b82f6' radius={[8, 8, 0, 0]}>
                    {mockDifficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value='topics' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Topic-wise Problem Solving</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <BarChart data={mockTopicData} layout='vertical'>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis type='number' />
                  <YAxis dataKey='topic' type='category' width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='easy' stackId='a' fill='#10b981' name='Easy' />
                  <Bar
                    dataKey='medium'
                    stackId='a'
                    fill='#f59e0b'
                    name='Medium'
                  />
                  <Bar dataKey='hard' stackId='a' fill='#ef4444' name='Hard' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Topic Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {mockTopicData.map(topic => (
              <Card
                key={topic.topic}
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() => setSelectedTopic(topic.topic)}
              >
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-semibold'>{topic.topic}</h3>
                    <Badge variant='secondary'>{topic.solved} solved</Badge>
                  </div>
                  <div className='space-y-1 text-sm'>
                    <p className='text-green-500'>Easy: {topic.easy}</p>
                    <p className='text-yellow-500'>Medium: {topic.medium}</p>
                    <p className='text-red-500'>Hard: {topic.hard}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contests Tab */}
        <TabsContent value='contests' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Trophy className='h-5 w-5' />
                Recent Contest Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {mockContestData.map(contest => (
                  <div
                    key={contest.contestId}
                    className='flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors'
                  >
                    <div>
                      <p className='font-semibold'>{contest.contestId}</p>
                      <p className='text-sm text-muted-foreground'>
                        {contest.date}
                      </p>
                    </div>
                    <div className='flex gap-6 text-sm'>
                      <div>
                        <p className='text-muted-foreground'>Rank</p>
                        <p className='font-semibold'>{contest.rank}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>Rating</p>
                        <p className='font-semibold text-blue-500'>
                          +{contest.rating}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>Problems</p>
                        <p className='font-semibold'>{contest.problems}/5</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>Time</p>
                        <p className='font-semibold'>{contest.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weak Areas Tab */}
        <TabsContent value='weak' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingDown className='h-5 w-5' />
                Topics Needing Practice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {mockWeakTopics.map(topic => (
                  <div key={topic.topic} className='p-4 bg-muted/50 rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-semibold'>{topic.topic}</h4>
                      <Badge variant='destructive'>
                        {topic.accuracy}% accuracy
                      </Badge>
                    </div>
                    <div className='w-full bg-muted rounded-full h-2'>
                      <div
                        className='bg-red-500 h-2 rounded-full'
                        style={{ width: `${topic.accuracy}%` }}
                      ></div>
                    </div>
                    <p className='text-xs text-muted-foreground mt-2'>
                      {topic.attempts} attempts
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value='insights' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Award className='h-5 w-5' />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex items-center gap-2 p-2 bg-muted/50 rounded'>
                  <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm'>
                    ★
                  </div>
                  <div>
                    <p className='text-sm font-semibold'>Rating 1000+</p>
                    <p className='text-xs text-muted-foreground'>
                      Reached expert level
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2 p-2 bg-muted/50 rounded'>
                  <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm'>
                    ✓
                  </div>
                  <div>
                    <p className='text-sm font-semibold'>300+ Problems</p>
                    <p className='text-xs text-muted-foreground'>
                      Solved 300 problems
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <p className='text-sm'>
                  Focus on Segment Trees - only 35% accuracy
                </p>
                <p className='text-sm'>
                  Practice more Hard problems - only 45 solved
                </p>
                <p className='text-sm'>
                  Participate in more contests - average rank 245
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}