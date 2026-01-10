'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Flame,
  Target,
  Sparkles,
  UserPlus,
  Crown,
} from 'lucide-react';
import useSWR from 'swr';
import { cn } from '@/lib/utils';

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
  change?: number;
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
        return <Crown className='h-5 w-5 text-yellow-400' />;
      case 2:
        return <Medal className='h-5 w-5 text-slate-300' />;
      case 3:
        return <Award className='h-5 w-5 text-amber-600' />;
      default:
        return null;
    }
  };

  const getRankBadgeStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30';
      case 2:
        return 'bg-gradient-to-br from-slate-300 via-gray-400 to-slate-500 text-white shadow-lg shadow-slate-400/30';
      case 3:
        return 'bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white shadow-lg shadow-amber-600/30';
      default:
        return 'bg-muted/50 text-muted-foreground';
    }
  };

  const getRowStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border-l-4 border-l-yellow-500 dark:from-yellow-500/15';
      case 2:
        return 'bg-gradient-to-r from-slate-400/10 via-gray-400/5 to-transparent border-l-4 border-l-slate-400 dark:from-slate-400/15';
      case 3:
        return 'bg-gradient-to-r from-amber-600/10 via-orange-600/5 to-transparent border-l-4 border-l-amber-600 dark:from-amber-600/15';
      default:
        return 'hover:bg-muted/30 dark:hover:bg-muted/20';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return 'text-red-500 dark:text-red-400';
    if (rating >= 2100) return 'text-orange-500 dark:text-orange-400';
    if (rating >= 1900) return 'text-violet-500 dark:text-violet-400';
    if (rating >= 1600) return 'text-blue-500 dark:text-blue-400';
    if (rating >= 1400) return 'text-cyan-500 dark:text-cyan-400';
    if (rating >= 1200) return 'text-green-500 dark:text-green-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getRatingTier = (rating: number) => {
    if (rating >= 2400) return 'Grandmaster';
    if (rating >= 2100) return 'Master';
    if (rating >= 1900) return 'Candidate Master';
    if (rating >= 1600) return 'Expert';
    if (rating >= 1400) return 'Specialist';
    if (rating >= 1200) return 'Pupil';
    return 'Newbie';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return 'Online';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const isOnline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return diffMins < 5;
  };

  const sortOptions = [
    { value: 'rating', label: 'Rating', icon: Target },
    { value: 'problems', label: 'Problems', icon: Sparkles },
    { value: 'streak', label: 'Streak', icon: Flame },
  ] as const;

  return (
    <div className='relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl'>
      {/* Header with Gradient */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent dark:from-primary/30 dark:via-primary/15' />
        <div className='absolute inset-0 backdrop-blur-xl' />
        <div className='relative px-6 py-5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 backdrop-blur-sm'>
                <Trophy className='h-5 w-5 text-primary' />
              </div>
              <div>
                <h2 className='text-lg font-semibold tracking-tight'>
                  {groupName} Leaderboard
                </h2>
                <p className='text-sm text-muted-foreground'>
                  Compete and climb the ranks
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          {data?.stats && (
            <div className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <div className='group rounded-xl bg-background/60 p-3 backdrop-blur-sm transition-all hover:bg-background/80 dark:bg-background/40 dark:hover:bg-background/60'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <span className='text-xs text-muted-foreground'>Members</span>
                </div>
                <p className='mt-1 text-xl font-bold'>
                  {data.stats.totalMembers}
                </p>
              </div>
              <div className='group rounded-xl bg-background/60 p-3 backdrop-blur-sm transition-all hover:bg-background/80 dark:bg-background/40 dark:hover:bg-background/60'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
                  <span className='text-xs text-muted-foreground'>Active</span>
                </div>
                <p className='mt-1 text-xl font-bold'>
                  {data.stats.activeMembers}
                </p>
              </div>
              <div className='group rounded-xl bg-background/60 p-3 backdrop-blur-sm transition-all hover:bg-background/80 dark:bg-background/40 dark:hover:bg-background/60'>
                <div className='flex items-center gap-2'>
                  <Target className='h-4 w-4 text-muted-foreground' />
                  <span className='text-xs text-muted-foreground'>
                    Avg Rating
                  </span>
                </div>
                <p className='mt-1 text-xl font-bold'>
                  {Math.round(data.stats.avgRating)}
                </p>
              </div>
              <div className='group rounded-xl bg-background/60 p-3 backdrop-blur-sm transition-all hover:bg-background/80 dark:bg-background/40 dark:hover:bg-background/60'>
                <div className='flex items-center gap-2'>
                  <Sparkles className='h-4 w-4 text-muted-foreground' />
                  <span className='text-xs text-muted-foreground'>Solved</span>
                </div>
                <p className='mt-1 text-xl font-bold'>
                  {data.stats.totalProblems}
                </p>
              </div>
            </div>
          )}

          {/* Sort Tabs */}
          <div className='mt-5 flex gap-2'>
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  sortBy === option.value
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-background/60 text-muted-foreground hover:bg-background/80 hover:text-foreground dark:bg-background/40'
                )}
              >
                <option.icon className='h-4 w-4' />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className='px-4 py-4 sm:px-6'>
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className='flex items-center gap-4 rounded-xl bg-muted/20 p-4 animate-pulse'
              >
                <div className='h-8 w-8 rounded-lg bg-muted' />
                <div className='h-11 w-11 rounded-full bg-muted' />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 w-32 rounded bg-muted' />
                  <div className='h-3 w-20 rounded bg-muted' />
                </div>
                <div className='h-6 w-16 rounded bg-muted' />
              </div>
            ))}
          </div>
        ) : data?.leaderboard && data.leaderboard.length > 0 ? (
          <div className='space-y-2'>
            {data.leaderboard.map(entry => (
              <div
                key={entry.id}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl p-3 transition-all sm:gap-4 sm:p-4',
                  getRowStyles(entry.rank),
                  entry.rank <= 3 &&
                    'backdrop-blur-sm hover:scale-[1.01] hover:shadow-lg'
                )}
              >
                {/* Rank Badge */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-transform group-hover:scale-110',
                    getRankBadgeStyles(entry.rank)
                  )}
                >
                  {getRankIcon(entry.rank) || entry.rank}
                </div>

                {/* Avatar with Online Status */}
                <div className='relative shrink-0'>
                  <Avatar className='h-10 w-10 ring-2 ring-background sm:h-11 sm:w-11'>
                    <AvatarImage src={entry.avatar} alt={entry.name} />
                    <AvatarFallback className='bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-medium'>
                      {entry.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline(entry.lastActive) && (
                    <div className='absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500'>
                      <div className='absolute inset-0.5 animate-ping rounded-full bg-green-400' />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='truncate text-sm font-semibold sm:text-base'>
                      {entry.name}
                    </p>
                    <Badge
                      variant='outline'
                      className='hidden text-xs sm:inline-flex'
                    >
                      @{entry.handle}
                    </Badge>
                  </div>
                  <div className='mt-0.5 flex items-center gap-2 text-xs text-muted-foreground'>
                    {isOnline(entry.lastActive) ? (
                      <span className='flex items-center gap-1 text-green-500 dark:text-green-400'>
                        <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
                        Online
                      </span>
                    ) : (
                      <span>{formatTimeAgo(entry.lastActive)}</span>
                    )}
                    {sortBy === 'rating' && (
                      <span
                        className={cn('hidden sm:inline', getRatingColor(entry.rating))}
                      >
                        • {getRatingTier(entry.rating)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats Display */}
                <div className='shrink-0 text-right'>
                  {sortBy === 'rating' && (
                    <div className='flex flex-col items-end'>
                      <p
                        className={cn(
                          'text-lg font-bold tabular-nums',
                          getRatingColor(entry.rating)
                        )}
                      >
                        {entry.rating}
                      </p>
                      {entry.change !== undefined && entry.change !== 0 && (
                        <div
                          className={cn(
                            'flex items-center gap-0.5 text-xs font-medium transition-transform',
                            entry.change > 0
                              ? 'text-green-500 dark:text-green-400'
                              : 'text-red-500 dark:text-red-400'
                          )}
                        >
                          {entry.change > 0 ? (
                            <TrendingUp className='h-3 w-3 animate-bounce' />
                          ) : (
                            <TrendingDown className='h-3 w-3' />
                          )}
                          <span>
                            {entry.change > 0 ? '+' : ''}
                            {entry.change}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {sortBy === 'problems' && (
                    <div className='flex flex-col items-end'>
                      <p className='text-lg font-bold tabular-nums text-primary'>
                        {entry.problemsSolved}
                      </p>
                      <span className='text-xs text-muted-foreground'>
                        solved
                      </span>
                    </div>
                  )}

                  {sortBy === 'streak' && (
                    <div className='flex flex-col items-end'>
                      <div className='flex items-center gap-1'>
                        <Flame className='h-4 w-4 text-orange-500' />
                        <p className='text-lg font-bold tabular-nums text-orange-500 dark:text-orange-400'>
                          {entry.streakCurrent}
                        </p>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        best: {entry.streakLongest}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className='flex flex-col items-center justify-center py-16'>
            <div className='relative'>
              <div className='absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl' />
              <div className='relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50'>
                <Trophy className='h-10 w-10 text-muted-foreground' />
              </div>
            </div>
            <h3 className='mt-6 text-lg font-semibold'>No members yet</h3>
            <p className='mt-2 max-w-sm text-center text-sm text-muted-foreground'>
              Invite your friends to join the group and start competing on the
              leaderboard!
            </p>
            <Button className='mt-6 gap-2' variant='outline'>
              <UserPlus className='h-4 w-4' />
              Invite Members
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
