'use client';

import { Trophy, Zap, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LevelBadgeProps {
  level: number;
  totalXP: number;
  currentStreak: number;
  problemsSolved: number;
  compact?: boolean;
}

export function LevelBadge({
  level,
  totalXP,
  currentStreak,
  problemsSolved,
  compact = false,
}: LevelBadgeProps) {
  const getXPForNextLevel = () => {
    return Math.pow(level, 2) * 100;
  };

  const getXPProgress = () => {
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = getXPForNextLevel();
    const xpInCurrentLevel = totalXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    return Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
  };

  const getLevelColor = () => {
    if (level >= 20) return 'from-purple-500 to-pink-500';
    if (level >= 15) return 'from-blue-500 to-purple-500';
    if (level >= 10) return 'from-green-500 to-blue-500';
    if (level >= 5) return 'from-yellow-500 to-green-500';
    return 'from-gray-500 to-yellow-500';
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 cursor-pointer hover:border-purple-500/40 transition-colors'>
              <Trophy className='h-4 w-4 text-yellow-500' />
              <span className='text-sm font-semibold'>Lv {level}</span>
              <div className='w-16 h-1.5 bg-muted rounded-full overflow-hidden'>
                <div
                  className={`h-full bg-gradient-to-r ${getLevelColor()} transition-all`}
                  style={{ width: `${getXPProgress()}%` }}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className='space-y-2'>
              <div className='font-semibold'>Level {level}</div>
              <div className='text-sm text-muted-foreground'>
                {totalXP} / {getXPForNextLevel()} XP
              </div>
              <div className='flex items-center gap-4 text-xs'>
                <div className='flex items-center gap-1'>
                  <Star className='h-3 w-3 text-yellow-500' />
                  <span>{problemsSolved} solved</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Zap className='h-3 w-3 text-orange-500' />
                  <span>{currentStreak} day streak</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className='p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-3'>
          <div className={`p-2 rounded-lg bg-gradient-to-r ${getLevelColor()}`}>
            <Trophy className='h-5 w-5 text-white' />
          </div>
          <div>
            <div className='text-lg font-bold'>Level {level}</div>
            <div className='text-sm text-muted-foreground'>{totalXP} XP</div>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold'>{problemsSolved}</div>
            <div className='text-xs text-muted-foreground'>Problems</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold flex items-center gap-1'>
              <Zap className='h-5 w-5 text-orange-500' />
              {currentStreak}
            </div>
            <div className='text-xs text-muted-foreground'>Day Streak</div>
          </div>
        </div>
      </div>
      <div>
        <div className='flex justify-between text-xs mb-1'>
          <span>Progress to Level {level + 1}</span>
          <span>{getXPProgress()}%</span>
        </div>
        <Progress value={getXPProgress()} className='h-2' />
        <div className='text-xs text-muted-foreground mt-1'>
          {getXPForNextLevel() - totalXP} XP needed
        </div>
      </div>
    </div>
  );
}