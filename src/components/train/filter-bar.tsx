'use client';

import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Filters = {
  query: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  platform?: 'LeetCode' | 'CSES' | 'Internal';
  companyId?: string;
};

type Company = { id: string; name: string };

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function FilterBar({
  value,
  onChange,
  className,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
  className?: string;
}) {
  const [q, setQ] = useState(value.query);

  useEffect(() => {
    setQ(value.query);
  }, [value.query]);

  const { data: companiesResp } = useSWR<{ companies: Company[] }>(
    '/api/companies',
    fetcher
  );
  const companies = companiesResp?.companies || [];

  const topics = useMemo(
    () => [
      'Arrays',
      'DP',
      'Graphs',
      'Math',
      'Strings',
      'Trees',
      'Greedy',
      'Binary Search',
      'Two Pointers',
    ],
    []
  );

  return (
    <div className={cn('sticky top-0 z-30', className)}>
      <Card className='border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='p-4 grid grid-cols-1 md:grid-cols-5 gap-3'>
          <div className='md:col-span-2'>
            <Input
              placeholder='Search problems, sheets, topics…'
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onChange({ ...value, query: q });
              }}
            />
          </div>

          <div className='grid grid-cols-2 gap-3 md:grid-cols-3 md:col-span-3'>
            {/* Topic Selector */}
            <Select
              value={value.topic || 'all'}
              onValueChange={v =>
                onChange({
                  ...value,
                  topic: v === 'all' ? undefined : (v as Filters['topic']),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Topic' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All topics</SelectItem>
                {topics.map(t => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Selector */}
            <Select
              value={value.difficulty || 'all'}
              onValueChange={v =>
                onChange({
                  ...value,
                  difficulty:
                    v === 'all' ? undefined : (v as Filters['difficulty']),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Difficulty' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Any</SelectItem>
                <SelectItem value='Easy'>Easy</SelectItem>
                <SelectItem value='Medium'>Medium</SelectItem>
                <SelectItem value='Hard'>Hard</SelectItem>
              </SelectContent>
            </Select>

            {/* Platform Selector */}
            <Select
              value={value.platform || 'all'}
              onValueChange={v =>
                onChange({
                  ...value,
                  platform:
                    v === 'all' ? undefined : (v as Filters['platform']),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Platform' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Any</SelectItem>
                <SelectItem value='LeetCode'>LeetCode</SelectItem>
                <SelectItem value='CSES'>CSES</SelectItem>
                <SelectItem value='Internal'>Internal</SelectItem>
              </SelectContent>
            </Select>

            {/* Company Selector */}
            <Select
              value={value.companyId || 'all'}
              onValueChange={v =>
                onChange({ ...value, companyId: v === 'all' ? undefined : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Company' />
              </SelectTrigger>
              <SelectContent className='max-h-80'>
                <SelectItem value='all'>Any</SelectItem>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Buttons */}
            <div className='flex items-center gap-2'>
              <Button
                className='w-full'
                onClick={() => onChange({ ...value, query: q })}
              >
                Apply
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setQ('');
                  onChange({ query: '' });
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {(value.topic || value.difficulty) && (
          <div className='px-4 pb-4'>
            <div className='flex flex-wrap items-center gap-2'>
              {value.topic && (
                <Badge variant='secondary' className='cursor-default'>
                  Topic: {value.topic}
                </Badge>
              )}
              {value.difficulty && (
                <Badge variant='secondary' className='cursor-default'>
                  {value.difficulty}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}