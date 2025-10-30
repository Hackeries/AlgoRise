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

  return (
    <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {filtered.map(s => {
        const pct = s.total
          ? Math.min(100, Math.round((s.completed / s.total) * 100))
          : 0;

        return (
          <Card
            key={s.id}
            className='group cursor-pointer border border-gray-800/50 bg-gray-950/50 backdrop-blur-md rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-transform duration-300'
          >
            <CardContent className='flex flex-col h-full p-6'>
              {/* Header */}
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-bold text-lg text-white truncate'>
                  {s.title}
                </h3>
                <Badge variant='outline' className='text-xs text-gray-300'>
                  {s.platform}
                </Badge>
              </div>

              {/* Difficulty */}
              <Badge
                variant={
                  s.difficulty === 'Easy'
                    ? 'secondary'
                    : s.difficulty === 'Medium'
                    ? 'destructive'
                    : 'destructive'
                }
                className='text-xs mb-3 px-2 py-1'
              >
                {s.difficulty}
              </Badge>

              {/* Topics */}
              <div className='flex flex-wrap gap-2 mb-4'>
                {s.topics.map(t => (
                  <Badge
                    key={t}
                    variant='outline'
                    className='text-[10px] bg-gray-800/30 hover:bg-gray-800/50 transition'
                  >
                    {t}
                  </Badge>
                ))}
              </div>

              {/* Progress Bar */}
              <div className='mb-4'>
                <div className='relative w-full h-3 rounded-full overflow-hidden bg-gray-800'>
                  <div
                    className='h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500'
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className='text-xs text-gray-400 mt-1 block'>
                  {s.completed} / {s.total} solved ({pct}%)
                </span>
              </div>

              {/* Action Buttons */}
              <div className='mt-auto flex gap-2'>
                <Button
                  size='sm'
                  className='flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-105 transition-transform'
                  onClick={() =>
                    window.open(
                      `https://leetcode.com/problems/${s.title
                        .toLowerCase()
                        .replaceAll(' ', '-')}/`,
                      '_blank'
                    )
                  }
                >
                  Open
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  className='flex-1 hover:bg-gray-800 hover:text-white transition'
                >
                  Continue
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  className='flex-1 text-green-400 hover:text-green-500 transition'
                >
                  Mark Done
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
