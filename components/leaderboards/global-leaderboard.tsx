'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Users, Flame, Activity } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  handle: string;
  rating: number;
  college: string;
  problemsSolved: number;
  streak: number;
  lastActive: string | null;
  rank: number;
}

interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
}

interface ViewerSummary {
  userId: string;
  name: string;
  avatar: string | null;
  handle: string;
  rating: number;
  rank: number | null;
  college: string | null;
  totalPeers: number | null;
  problemsSolved: number;
  streak: number;
  lastActive: string | null;
  scope: 'global' | 'cohort';
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  pagination: PaginationMeta;
  scope: 'global' | 'cohort';
  viewer: ViewerSummary | null;
}

const PAGE_SIZE = 25;

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

  const formatTimeAgo = (isoDate: string | null) => {
    if (!isoDate) return '—';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '—';
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) return `${diffWeeks}w ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
  };

  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 4000]);
  const [activeTab, setActiveTab] = useState<'same' | 'all'>('same');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [viewer, setViewer] = useState<ViewerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = useMemo(() => {
    if (!pagination) return false;
    return entries.length < pagination.total;
  }, [pagination, entries]);

  const buildUrl = useCallback(
    (offset: number) =>
      `/api/leaderboards?type=${activeTab}&ratingMin=${ratingRange[0]}&ratingMax=${ratingRange[1]}&limit=${PAGE_SIZE}&offset=${offset}`,
    [activeTab, ratingRange]
  );

  const fetchPage = useCallback(
    async (offset: number, replace = false) => {
      try {
        if (replace) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const res = await fetch(buildUrl(offset));
        if (!res.ok) {
          throw new Error('Failed to load leaderboard');
        }

        const json: LeaderboardResponse = await res.json();
        setPagination(json.pagination);
        setViewer(json.viewer);
        setEntries(prev => (replace ? json.leaderboard : [...prev, ...json.leaderboard]));
      } catch (err: any) {
        console.error('Leaderboard fetch failed:', err);
        setError(err?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildUrl]
  );

  useEffect(() => {
    setEntries([]);
    setPagination(null);
    setViewer(null);
    fetchPage(0, true);
  }, [activeTab, ratingRange, fetchPage]);

  const viewerMessage = useMemo(() => {
    if (!viewer) return null;
    const rankText = viewer.rank ? `#${viewer.rank}` : 'outside the top ranks';
    if (viewer.scope === 'cohort') {
      const cohortName = viewer.college || 'your cohort';
      const totalText = viewer.totalPeers ? ` (out of ${viewer.totalPeers.toLocaleString()})` : '';
      return `You're ${rankText} in ${cohortName}${totalText}`;
    }
    const totalText = viewer.totalPeers ? ` of ${viewer.totalPeers.toLocaleString()} coders` : '';
    return `You're ${rankText} on the global leaderboard${totalText}`;
  }, [viewer]);

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Leaderboards
            </CardTitle>
          </div>
        </div>
        {viewerMessage && (
          <CardDescription className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Flame className='h-4 w-4 text-orange-400' />
            {viewerMessage}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue='same'
          onValueChange={value => setActiveTab(value as 'same' | 'all')}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='same'>Same College</TabsTrigger>
            <TabsTrigger value='all'>All Colleges</TabsTrigger>
          </TabsList>

          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>
                Rating Filter: {ratingRange[0]} - {ratingRange[1]}
              </label>
              <Slider
                value={ratingRange}
                onValueChange={value =>
                  setRatingRange(value as [number, number])
                }
                max={4000}
                min={0}
                step={100}
                className='mt-2'
              />
            </div>
          </div>

          <TabsContent value='same' className='mt-6'>
            {loading ? (
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
            ) : error ? (
              <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300'>
                {error}
              </div>
            ) : entries.length ? (
              <div className='space-y-2'>
                {entries.map(entry => (
                  <div
                    key={`${entry.userId}-${entry.rank}`}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-colors hover:bg-muted/20 ${
                      entry.rank <= 3 ? 'bg-muted/10 border border-muted' : ''
                    }`}
                  >
                    <div className='flex items-center justify-center w-8'>
                      {getRankIcon(entry.rank)}
                    </div>

                    <Avatar className='h-10 w-10'>
                      {entry.avatar && <AvatarImage src={entry.avatar} alt={entry.name} />}
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
                        {entry.college}
                      </p>
                    </div>

                    <div className='flex items-center gap-6 text-right text-xs sm:text-sm'>
                      <div>
                        <p className={`font-semibold ${getRatingColor(entry.rating)}`}>
                          {entry.rating}
                        </p>
                        <p className='text-muted-foreground text-[11px] uppercase tracking-wide'>Rating</p>
                      </div>
                      <div>
                        <p className='font-semibold'>{entry.problemsSolved}</p>
                        <p className='text-muted-foreground text-[11px] uppercase tracking-wide'>Solved</p>
                      </div>
                      <div>
                        <p className='font-semibold text-orange-500 flex items-center justify-end gap-1'>
                          <Flame className='h-3 w-3' /> {entry.streak}
                        </p>
                        <p className='text-muted-foreground text-[11px] uppercase tracking-wide'>Streak</p>
                      </div>
                      <div className='hidden sm:block'>
                        <p className='font-semibold text-muted-foreground flex items-center justify-end gap-1'>
                          <Activity className='h-3 w-3' />
                          {formatTimeAgo(entry.lastActive)}
                        </p>
                        <p className='text-muted-foreground text-[11px] uppercase tracking-wide'>Last active</p>
                      </div>
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <div className='pt-4 flex justify-center'>
                    <Button
                      onClick={() => fetchPage(entries.length, false)}
                      disabled={loadingMore || loading}
                      variant='secondary'
                    >
                      {loadingMore ? 'Loading…' : 'Load more'}
                    </Button>
                  </div>
                )}
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

          <TabsContent value='all' className='mt-6'>
            {loading ? (
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
            ) : error ? (
              <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300'>
                {error}
              </div>
            ) : entries.length ? (
              <div className='space-y-2'>
                {entries.map(entry => (
                  <div
                    key={`${entry.userId}-${entry.rank}`}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-colors hover:bg-muted/20 ${
                      entry.rank <= 3 ? 'bg-muted/10 border border-muted' : ''
                    }`}
                  >
                    <div className='flex items-center justify-center w-8'>
                      {getRankIcon(entry.rank)}
                    </div>

                    <Avatar className='h-10 w-10'>
                      {entry.avatar && <AvatarImage src={entry.avatar} alt={entry.name} />}
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
                        {entry.college}
                      </p>
                    </div>

                    <div className='flex items-center gap-6 text-right text-xs sm:text-sm'>
                      <div>
                        <p className={`font-semibold ${getRatingColor(entry.rating)}`}>
                          {entry.rating}
                        </p>
                        <p className='text-muted-foreground text-[11px] uppercase tracking-wide'>Rating</p>
                      </div>
                      <div>
                        <p className='font-semibold'>{entry.problemsSolved}</p>
                        <p className='text-muted-foreground text-[11px] uppercase tracking-wide'>Solved</p>
                      </div>
                      <div>
                        <p className='font-semibold text-orange-500 flex items-center justify-end gap-1'>
                          <Flame className='h-3 w-3' /> {entry.streak}
                        </p>
                        <p className='text-muted-foreground text-[11px] uppercase tracking-wide'>Streak</p>
                      </div>
                      <div className='hidden sm:block'>
                        <p className='font-semibold text-muted-foreground flex items-center justify-end gap-1'>
                          <Activity className='h-3 w-3' />
                          {formatTimeAgo(entry.lastActive)}
                        </p>
                        <p className='text-muted-foreground text-[11px] uppercase tracking-wide'>Last active</p>
                      </div>
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <div className='pt-4 flex justify-center'>
                    <Button
                      onClick={() => fetchPage(entries.length, false)}
                      disabled={loadingMore || loading}
                      variant='secondary'
                    >
                      {loadingMore ? 'Loading…' : 'Load more'}
                    </Button>
                  </div>
                )}
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
      </CardContent>
    </Card>
  );
}
