'use client';

import useSWR from 'swr';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LevelBadge } from '@/components/gamification/level-badge';
import { cn } from '@/lib/utils';
import { Flame, Star, Trophy } from 'lucide-react';

// Types for progress payload (kept permissive to match current API)
type DailyEntry = { date?: string; solved?: number };
type ProgressResp = {
  daily?: DailyEntry[];
  streak?: number;
  solvedThisWeek?: number;
  totalSolved?: number;
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

function getLevelFromXP(xp: number) {
  let level = 1;
  while (xp >= Math.pow(level, 2) * 100) level++;
  return Math.max(level, 1);
}

export function GamifiedStrip() {
  const { data } = useSWR<ProgressResp>('/api/cf/progress', fetcher, {
    revalidateOnFocus: false,
  });

  // Fallbacks keep the strip resilient
  const streak =
    data?.streak ??
    (Array.isArray(data?.daily)
      ? (() => {
          const arr = [...data!.daily!];
          let count = 0;
          for (let i = arr.length - 1; i >= 0; i--) {
            if ((arr[i].solved ?? 0) > 0) count++;
            else break;
          }
          return count;
        })()
      : 0);

  const solvedThisWeek =
    data?.solvedThisWeek ??
    (Array.isArray(data?.daily)
      ? data!.daily!.slice(-7).reduce((a, d) => a + (d.solved || 0), 0)
      : 0);

  const totalSolved = data?.totalSolved ?? 0;

  // XP model: 10 XP per AC (simple baseline, aligns with LevelBadge math)
  const weeklyXP = solvedThisWeek * 10;
  const totalXP = totalSolved * 10;

  const level = getLevelFromXP(totalXP);
  const prevLevelXP = Math.pow(level - 1, 2) * 100;
  const nextLevelXP = Math.pow(level, 2) * 100;
  const xpInLevel = Math.max(0, totalXP - prevLevelXP);
  const xpNeeded = Math.max(0, nextLevelXP - prevLevelXP);
  const progressPct = Math.max(
    0,
    Math.min(100, xpNeeded === 0 ? 0 : Math.round((xpInLevel / xpNeeded) * 100))
  );

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
      {/* Streak */}
      <Card className={cn('rounded-lg border bg-card p-4')}>
        <div className='text-xs text-muted-foreground'>Current Streak</div>
        <div className='mt-1 text-2xl font-semibold text-foreground'>
          {streak} day{streak === 1 ? '' : 's'}
        </div>
        <div className='mt-1 text-sm text-muted-foreground'>
          Keep solving at least one problem per day to grow your streak.
        </div>
        <div className='mt-3 h-2 rounded-full bg-muted'>
          <div
            className='h-2 rounded-full bg-primary transition-all'
            style={{ width: `${Math.min(100, streak)}%` }}
            aria-label='streak-progress'
          />
        </div>
        <div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
          <Flame className='h-4 w-4 text-primary' />
          Momentum matters—don’t break the chain.
        </div>
      </Card>

      {/* Weekly XP */}
      <Card className='rounded-lg border bg-card p-4'>
        <div className='text-xs text-muted-foreground'>Weekly XP</div>
        <div className='mt-1 text-2xl font-semibold text-foreground'>
          {weeklyXP} XP
        </div>
        <div className='mt-2 text-sm text-muted-foreground'>
          {solvedThisWeek} solved in the last 7 days
        </div>
        <div className='mt-3'>
          <div className='mb-1 flex items-center justify-between text-xs'>
            <span>Weekly progress</span>
            <span>{Math.min(100, weeklyXP)}%</span>
          </div>
          <Progress value={Math.min(100, weeklyXP)} className='h-2' />
        </div>
        <div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
          <Star className='h-4 w-4 text-primary' />
          10 XP per accepted submission
        </div>
      </Card>

      {/* Level & Lifetime XP */}
      <Card className='rounded-lg border bg-card p-4'>
        <div className='mb-3'>
          <LevelBadge
            level={level}
            totalXP={totalXP}
            currentStreak={streak}
            problemsSolved={totalSolved}
            compact
          />
        </div>
        <div className='text-sm'>
          <div className='mb-1 flex items-center justify-between text-xs text-muted-foreground'>
            <span>Progress to Level {level + 1}</span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className='h-2' />
          <div className='mt-1 text-xs text-muted-foreground'>
            {nextLevelXP - totalXP} XP to next level
          </div>
        </div>
      </Card>

      {/* Contest Focus */}
      <Card className='rounded-lg border bg-card p-4'>
        <div className='text-xs text-muted-foreground'>Contest Focus</div>
        <div className='mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground'>
          <Trophy className='h-6 w-6 text-primary' />
          Be contest-ready
        </div>
        <div className='mt-2 text-sm text-muted-foreground'>
          Practice speed and accuracy with timed problem sets.
        </div>
        <div className='mt-3 h-2 rounded-full bg-muted'>
          <div
            className='h-2 rounded-full bg-primary transition-all'
            style={{
              width: `${Math.min(
                100,
                Math.floor((solvedThisWeek / 14) * 100)
              )}%`,
            }}
            aria-label='contest-readiness-progress'
          />
        </div>
        <div className='mt-2 text-xs text-muted-foreground'>
          Target: 50 solved per week for contest sharpness
        </div>
      </Card>
    </div>
  );
}