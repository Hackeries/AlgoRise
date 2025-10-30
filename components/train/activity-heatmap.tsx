'use client';

import { useMemo, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useCFVerification } from '@/lib/context/cf-verification';
import { Loader2 } from 'lucide-react';

interface Submission {
  creationTimeSeconds: number;
  verdict: string;
}

export function ActivityHeatmap() {
  const now = new Date();
  const year = now.getFullYear();
  const { verificationData } = useCFVerification();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate all days of the year
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  // Fetch real CF submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!verificationData?.handle) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://codeforces.com/api/user.status?handle=${verificationData.handle}&from=1&count=10000`
        );
        const data = await response.json();
        
        if (data.status === 'OK' && data.result) {
          // Filter for AC submissions only
          const acSubmissions = data.result.filter(
            (sub: any) => sub.verdict === 'OK'
          );
          setSubmissions(acSubmissions);
        }
      } catch (error) {
        console.error('Error fetching CF submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [verificationData?.handle]);

  // Calculate activity data from real submissions
  const activityData = useMemo(() => {
    const activityMap: { [key: string]: number } = {};
    
    submissions.forEach((sub) => {
      const date = new Date(sub.creationTimeSeconds * 1000);
      if (date.getFullYear() === year) {
        const dateKey = date.toDateString();
        activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
      }
    });

    return days.map((day) => activityMap[day.toDateString()] || 0);
  }, [submissions, days, year]);

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

  if (loading) {
    return (
      <Card className='p-4'>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>Loading activity data from Codeforces...</span>
        </div>
      </Card>
    );
  }

  if (!verificationData?.handle) {
    return (
      <Card className='p-4'>
        <div className='text-center py-8 text-muted-foreground'>
          <p>Connect your Codeforces account to see your activity heatmap</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-semibold text-sm text-muted-foreground'>
          Codeforces Activity ({year}) - {verificationData.handle}
        </h3>
        <div className='text-xs text-muted-foreground'>
          {submissions.length} AC submissions
        </div>
      </div>

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
