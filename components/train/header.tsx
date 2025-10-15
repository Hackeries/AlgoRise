'use client';

import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function TrainHeader() {
  const now = new Date();
  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  const { data: profile } = useSWR<
    { name?: string; full_name?: string } | { error: string }
  >('/api/profile', fetcher);
  const { data: streak } = useSWR<
    { currentStreak?: number } | { error: string }
  >('/api/streaks', fetcher);
  const { data: progress } = useSWR<any>('/api/cf/progress', fetcher);

  const name = (profile as any)?.name || (profile as any)?.full_name || 'coder';
  const currentStreak = (streak as any)?.currentStreak;
  const latestRating = progress?.progress?.ratingHistory?.length
    ? progress.progress.ratingHistory[
        progress.progress.ratingHistory.length - 1
      ]?.newRating
    : undefined;

  return (
    <header className='space-y-4'>
      <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-3'>
        <div>
          <h1 className='text-2xl md:text-3xl font-semibold text-balance'>
            {greeting}, {name}! Welcome back to your Training Hub
          </h1>
          <p className='text-muted-foreground'>
            Build rating, keep your streak, and climb the CP ladder.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {typeof currentStreak === 'number' && (
            <Badge variant='secondary'>🔥 {currentStreak} day streak</Badge>
          )}
          {typeof latestRating === 'number' && (
            <Badge>Rating {latestRating}</Badge>
          )}
        </div>
      </div>
      <Card className='border'>
        <CardContent className='p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3'>
          <div>
            <p className='text-sm text-muted-foreground'>Last session</p>
            <p className='font-medium'>
              Resume your practice or start a new focused set.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button>Resume</Button>
            <Button variant='outline'>New Session</Button>
          </div>
        </CardContent>
      </Card>
    </header>
  );
}