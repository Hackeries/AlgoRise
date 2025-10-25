'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function ActivityHeatmap() {
  const now = new Date();
  const year = now.getFullYear();

  // Generate all days of the year
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  // Mock data (replace with real activity)
  const activityData = useMemo(
    () => days.map(() => Math.floor(Math.random() * 5)),
    [year]
  );

  const getColor = (intensity: number) =>
    [
      'bg-muted/20 dark:bg-muted/30',
      'bg-emerald-300/40 dark:bg-emerald-500/30',
      'bg-emerald-400/60 dark:bg-emerald-500/60',
      'bg-emerald-500 dark:bg-emerald-600',
      'bg-emerald-600 dark:bg-emerald-700',
    ][intensity > 4 ? 4 : intensity];

  const monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Group days into weeks
  const weeks: { date: Date; intensity: number }[][] = [];
  let week: { date: Date; intensity: number }[] = [];

  days.forEach((date, i) => {
    week.push({ date, intensity: activityData[i] });
    if (date.getDay() === 6) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);

  return (
    <Card className='p-4'>
      <h3 className='font-semibold text-sm mb-4 text-muted-foreground'>
        Training Activity ({year})
      </h3>

      <div className='overflow-x-auto'>
        <TooltipProvider>
          {/* Month Labels */}
          <div className='flex flex-row text-xs text-muted-foreground mb-1 ml-6'>
            {weeks.map((week, wi) => {
              const firstDay = week[0]?.date;
              const isMonthStart = firstDay?.getDate() === 1;
              return (
                <div
                  key={wi}
                  className={cn('w-5 text-center', isMonthStart && 'ml-1')}
                >
                  {isMonthStart ? monthLabels[firstDay.getMonth()] : ''}
                </div>
              );
            })}
          </div>

          {/* Heatmap Grid */}
          <div className='flex flex-row gap-[2px]'>
            {weeks.map((week, wi) => (
              <div key={wi} className='flex flex-col gap-[2px]'>
                {Array.from({ length: 7 }).map((_, di) => {
                  const day = week.find(d => d.date.getDay() === di);
                  if (!day) return <div key={di} className='w-5 h-5' />;
                  return (
                    <Tooltip key={di}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'w-5 h-5 rounded-sm transition-transform duration-200 hover:scale-125 cursor-pointer',
                            getColor(day.intensity)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side='top'>
                        <p className='text-xs'>
                          {monthLabels[day.date.getMonth()]}{' '}
                          {day.date.getDate()}: {day.intensity} solved
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className='flex items-center justify-end gap-1 mt-4 text-xs text-muted-foreground'>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={cn('w-5 h-5 rounded-sm', getColor(i))} />
        ))}
        <span>More</span>
      </div>
    </Card>
  );
}
