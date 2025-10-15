'use client';

import useSWR from 'swr';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LevelBadge } from '@/components/gamification/level-badge';
import { cn } from '@/lib/utils';
import { Flame, Star, Trophy } from 'lucide-react';
import { useCFVerification } from '@/lib/context/cf-verification';
import { motion } from 'framer-motion';

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
  const { isVerified, verificationData } = useCFVerification();
  const handle = isVerified ? verificationData?.handle : undefined;

  const { data, error, isValidating } = useSWR<ProgressResp>(
    handle ? `/api/cf/progress?handle=${encodeURIComponent(handle)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!handle) {
    return (
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        <Card className='rounded-lg border bg-card p-4'>
          <div className='text-sm text-muted-foreground'>Codeforces Progress</div>
          <div className='mt-2 text-foreground'>Verify your CF handle to track streaks, XP, and levels.</div>
          <div className='mt-3 text-xs text-muted-foreground'>Link it via your profile.</div>
        </Card>
      </div>
    );
  }

  if (isValidating && !data && !error) {
    const skeletons = Array.from({ length: 4 });
    return (
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        {skeletons.map((_, i) => (
          <Card key={i} className='rounded-lg border bg-card p-4 animate-pulse'>
            <div className='h-4 w-32 bg-muted rounded mb-2' />
            <div className='h-6 w-24 bg-muted rounded mb-2' />
            <div className='h-2 w-full bg-muted rounded' />
          </Card>
        ))}
      </div>
    );
  }

  // Compute fallback values if API missing data
  const streak =
    data?.streak ??
    (Array.isArray(data?.daily)
      ? (() => {
          let count = 0;
          const arr = [...data.daily!];
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
      ? data.daily!.slice(-7).reduce((a, d) => a + (d.solved || 0), 0)
      : 0);

  const totalSolved = data?.totalSolved ?? 0;
  const weeklyXP = solvedThisWeek * 10;
  const totalXP = totalSolved * 10;

  const level = getLevelFromXP(totalXP);
  const prevLevelXP = Math.pow(level - 1, 2) * 100;
  const nextLevelXP = Math.pow(level, 2) * 100;
  const xpInLevel = Math.max(0, totalXP - prevLevelXP);
  const xpNeeded = Math.max(0, nextLevelXP - prevLevelXP);
  const progressPct = Math.max(0, Math.min(100, xpNeeded === 0 ? 0 : Math.round((xpInLevel / xpNeeded) * 100)));

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
      {/* Streak */}
      <motion.div whileHover={{ scale: 1.03 }} className={cn('rounded-lg border bg-card p-4')}>
        <div className='text-xs text-muted-foreground'>Current Streak</div>
        <div className='mt-1 text-2xl font-semibold text-foreground'>{streak} day{streak === 1 ? '' : 's'}</div>
        <div className='mt-1 text-sm text-muted-foreground'>Daily reps {'>'} rare marathons. Keep the chain alive!</div>
        <div className='mt-3 h-2 rounded-full bg-muted'>
          <div
            className='h-2 rounded-full bg-primary transition-all'
            style={{ width: `${Math.min(100, streak)}%` }}
          />
        </div>
        <div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
          <Flame className='h-4 w-4 text-primary' /> Momentum matters—don’t break the chain
        </div>
      </motion.div>

      {/* Weekly XP */}
      <motion.div whileHover={{ scale: 1.03 }} className='rounded-lg border bg-card p-4'>
        <div className='text-xs text-muted-foreground'>Weekly XP</div>
        <div className='mt-1 text-2xl font-semibold text-foreground'>{weeklyXP} XP</div>
        <div className='mt-2 text-sm text-muted-foreground'>{solvedThisWeek} problems solved in last 7 days</div>
        <div className='mt-3'>
          <div className='mb-1 flex items-center justify-between text-xs'>
            <span>Progress</span>
            <span>{Math.min(100, weeklyXP)}%</span>
          </div>
          <Progress value={Math.min(100, weeklyXP)} className='h-2' />
        </div>
        <div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
          <Star className='h-4 w-4 text-primary' /> 10 XP per solved problem
        </div>
      </motion.div>

      {/* Level */}
      <motion.div whileHover={{ scale: 1.03 }} className='rounded-lg border bg-card p-4'>
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
          <div className='mt-1 text-xs text-muted-foreground'>{nextLevelXP - totalXP} XP to next level</div>
          <div className='mt-2 text-xs text-muted-foreground'>Level-ups compound—track the habit, not perfect plans</div>
        </div>
      </motion.div>

      {/* Contest Focus */}
      <motion.div whileHover={{ scale: 1.03 }} className='rounded-lg border bg-card p-4'>
        <div className='text-xs text-muted-foreground'>Contest Focus</div>
        <div className='mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground'>
          <Trophy className='h-6 w-6 text-primary' /> Be contest-ready
        </div>
        <div className='mt-2 text-sm text-muted-foreground'>Speed + accuracy under timed conditions.</div>
        <div className='mt-3 h-2 rounded-full bg-muted'>
          <div
            className='h-2 rounded-full bg-primary transition-all'
            style={{ width: `${Math.min(100, Math.floor((solvedThisWeek / 14) * 100))}%` }}
          />
        </div>
        <div className='mt-2 text-xs text-muted-foreground'>Target: 50 problems/week to stay sharp</div>
      </motion.div>
    </div>
  );
}