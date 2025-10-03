'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react';
import useSWR from 'swr';

interface LeaderboardEntry {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  rating: number;
  problemsSolved: number;
  streakCurrent: number;
  streakLongest: number;
  lastActive: string;
  rank: number;
  change?: number; // Rating change from last week
}

interface GroupLeaderboardProps {
  groupId: string;
  groupName: string;
  timeRange?: '7d' | '30d' | 'all';
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function GroupLeaderboard({
  groupId,
  groupName,
  timeRange = 'all',
}: GroupLeaderboardProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'problems' | 'streak'>(
    'rating'
  );

  const { data, isLoading } = useSWR<{
    leaderboard: LeaderboardEntry[];
    stats: {
      totalMembers: number;
      activeMembers: number;
      avgRating: number;
      totalProblems: number;
    };
  }>(
    `/api/groups/${groupId}/leaderboard?range=${timeRange}&sort=${sortBy}`,
    fetcher
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='h-5 w-5 text-yellow-500' />;
      case 2:
        return <Medal className='h-5 w-5 text-gray-400' />;
      case 3:
        return <Award className='h-5 w-5 text-amber-600' />;
      default:
        return (
          <span className='text-sm font-medium text-muted-foreground'>
            #{rank}
          </span>
        );
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return 'text-red-500'; // Grandmaster
    if (rating >= 2100) return 'text-orange-500'; // Master
    if (rating >= 1900) return 'text-purple-500'; // Candidate Master
    if (rating >= 1600) return 'text-blue-500'; // Expert
    if (rating >= 1400) return 'text-cyan-500'; // Specialist
    if (rating >= 1200) return 'text-green-500'; // Pupil
    return 'text-gray-500'; // Newbie
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              {groupName} Leaderboard
            </CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            {data?.stats && (
              <Badge variant='secondary'>
                {data.stats.activeMembers}/{data.stats.totalMembers} active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={sortBy} onValueChange={value => setSortBy(value as any)}>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='rating'>By Rating</TabsTrigger>
            <TabsTrigger value='problems'>By Problems</TabsTrigger>
            <TabsTrigger value='streak'>By Streak</TabsTrigger>
          </TabsList>

          <TabsContent value={sortBy} className='mt-6'>
            {isLoading ? (
              <div className='space-y-3'>
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className='flex items-center space-x-4 p-3 bg-muted/20 rounded-lg animate-pulse'
                  >
                    <div className='h-10 w-10 bg-muted rounded-full' />
                    <div className='flex-1'>
                      <div className='h-4 bg-muted rounded w-24 mb-2' />
                      <div className='h-3 bg-muted rounded w-16' />
                    </div>
                    <div className='h-6 bg-muted rounded w-12' />
                  </div>
                ))}
              </div>
            ) : data?.leaderboard ? (
              <div className='space-y-2'>
                {data.leaderboard.map(entry => (
                  <div
                    key={entry.id}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-colors hover:bg-muted/20 ${
                      entry.rank <= 3 ? 'bg-muted/10 border border-muted' : ''
                    }`}
                  >
                    <div className='flex items-center justify-center w-8'>
                      {getRankIcon(entry.rank)}
                    </div>

                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={entry.avatar} alt={entry.name} />
                      <AvatarFallback>
                        {entry.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm font-medium truncate'>
                          {entry.name}
                        </p>
                        <Badge variant='outline' className='text-xs'>
                          {entry.handle}
                        </Badge>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Last active {formatTimeAgo(entry.lastActive)}
                      </p>
                    </div>

                    <div className='text-right'>
                      {sortBy === 'rating' && (
                        <div>
                          <p
                            className={`text-sm font-semibold ${getRatingColor(entry.rating)}`}
                          >
                            {entry.rating}
                          </p>
                          {entry.change !== undefined && (
                            <div className='flex items-center gap-1 text-xs'>
                              <TrendingUp
                                className={`h-3 w-3 ${
                                  entry.change >= 0
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                }`}
                              />
                              <span
                                className={
                                  entry.change >= 0
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                }
                              >
                                {entry.change >= 0 ? '+' : ''}
                                {entry.change}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {sortBy === 'problems' && (
                        <div>
                          <p className='text-sm font-semibold'>
                            {entry.problemsSolved}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            problems
                          </p>
                        </div>
                      )}

                      {sortBy === 'streak' && (
                        <div>
                          <p className='text-sm font-semibold text-orange-500'>
                            {entry.streakCurrent}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            best: {entry.streakLongest}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <Users className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <p className='text-sm text-muted-foreground'>
                  No members found
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Group Stats */}
        {data?.stats && (
          <div className='mt-6 pt-6 border-t'>
            <h4 className='text-sm font-medium mb-3'>Group Statistics</h4>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold'>{data.stats.totalMembers}</p>
                <p className='text-xs text-muted-foreground'>Members</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold'>
                  {Math.round(data.stats.avgRating)}
                </p>
                <p className='text-xs text-muted-foreground'>Avg Rating</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold'>{data.stats.totalProblems}</p>
                <p className='text-xs text-muted-foreground'>Total Solved</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold'>{data.stats.activeMembers}</p>
                <p className='text-xs text-muted-foreground'>Active</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
