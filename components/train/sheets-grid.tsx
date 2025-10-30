'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filters } from './filter-bar';
import { cn } from '@/lib/utils';

export type Sheet = {
  id: string;
  title: string;
  platform: 'LeetCode' | 'CSES' | 'Internal';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  companies: string[];
  completed: number;
  total: number;
};

export function SheetsGrid({
  sheets,
  filters,
}: {
  sheets: Sheet[];
  filters: Filters;
}) {
  const filtered = useMemo(() => {
    return sheets.filter(s => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        if (
          !(
            s.title.toLowerCase().includes(q) ||
            s.topics.some(t => t.toLowerCase().includes(q)) ||
            s.companies.some(c => c.toLowerCase().includes(q))
          )
        )
          return false;
      }
      if (filters.topic && !s.topics.includes(filters.topic)) return false;
      if (filters.difficulty && s.difficulty !== filters.difficulty)
        return false;
      if (filters.platform && s.platform !== filters.platform) return false;
      return true;
    });
  }, [sheets, filters]);

  if (filtered.length === 0) {
    return (
      <div className='text-center py-16'>
        <div className='glass-intense rounded-2xl p-12 max-w-md mx-auto'>
          <div className='text-muted-foreground text-lg mb-4'>No problem sheets match your filters</div>
          <p className='text-sm text-muted-foreground'>Try adjusting your search criteria or clear all filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className='grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {filtered.map((s, index) => {
        const pct = s.total
          ? Math.min(100, Math.round((s.completed / s.total) * 100))
          : 0;

        const difficultyColor =
          s.difficulty === 'Easy'
            ? 'from-green-500/20 to-emerald-500/20 border-green-500/30'
            : s.difficulty === 'Medium'
            ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
            : 'from-red-500/20 to-rose-500/20 border-red-500/30';

        return (
          <Card
            key={s.id}
            className={cn(
              'group cursor-pointer card-3d hover-shine overflow-hidden',
              'transition-all duration-300',
              'animate-fade-in'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className='flex flex-col h-full p-5 sm:p-6 relative'>
              {/* Header */}
              <div className='flex items-start justify-between mb-4 gap-3'>
                <h3 className='font-bold text-base sm:text-lg text-foreground truncate flex-1 group-hover:text-primary transition-colors'>
                  {s.title}
                </h3>
                <Badge variant='outline' className='text-xs shrink-0 glass'>
                  {s.platform}
                </Badge>
              </div>

              {/* Difficulty with gradient background */}
              <div className={`bg-gradient-to-r ${difficultyColor} border rounded-lg px-3 py-1.5 mb-4 inline-flex items-center justify-center w-fit`}>
                <span className='text-xs font-semibold'>{s.difficulty}</span>
              </div>

              {/* Topics */}
              <div className='flex flex-wrap gap-1.5 mb-4'>
                {s.topics.slice(0, 3).map(t => (
                  <Badge
                    key={t}
                    variant='secondary'
                    className='text-[10px] px-2 py-0.5 hover:bg-primary/20 hover:text-primary transition-colors'
                  >
                    {t}
                  </Badge>
                ))}
                {s.topics.length > 3 && (
                  <Badge variant='secondary' className='text-[10px] px-2 py-0.5'>
                    +{s.topics.length - 3}
                  </Badge>
                )}
              </div>

              {/* Progress Bar with enhanced styling */}
              <div className='mb-5 mt-auto'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-xs text-muted-foreground font-medium'>
                    Progress
                  </span>
                  <span className='text-xs font-bold text-foreground'>
                    {pct}%
                  </span>
                </div>
                <div className='relative w-full h-2.5 rounded-full overflow-hidden bg-muted/50 shadow-inner'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700 ease-out',
                      'bg-gradient-to-r from-primary to-accent',
                      pct === 100 && 'from-green-500 to-emerald-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className='text-[11px] text-muted-foreground mt-1.5 block'>
                  {s.completed} of {s.total} problems solved
                </span>
              </div>

              {/* Action Buttons with improved styling */}
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  className='flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all'
                  onClick={() =>
                    window.open(
                      `https://leetcode.com/problems/${s.title
                        .toLowerCase()
                        .replaceAll(' ', '-')}/`,
                      '_blank'
                    )
                  }
                >
                  Start
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  className='flex-1 hover:bg-primary/10 hover:border-primary transition-all'
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
