'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
}

export function DailyChallenge() {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      setRemaining(end.getTime() - now.getTime());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { data, isLoading } = useSWR<{
    problems: {
      id: string;
      title: string;
      rating: number;
      tags: string[];
      url: string;
    }[];
    error?: string;
  }>('/api/today-problems', fetcher);
  const problems = data?.problems || [];

  return (
    <Card className='border'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center justify-between'>
          <span>Daily Challenge</span>
          <span className='text-sm text-muted-foreground'>
            Resets in {formatTime(remaining)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {isLoading && (
          <div className='text-sm text-muted-foreground'>
            Loading today’s set…
          </div>
        )}
        {!isLoading && problems.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            No personalized set yet. Link your CF handle in Profile.
          </div>
        )}
        {problems.map(p => (
          <div key={p.id} className='rounded-md border p-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='font-medium'>{p.title}</span>
              <Badge>CF {p.rating}</Badge>
              {p.tags?.slice(0, 3).map(t => (
                <Badge key={t} variant='outline'>
                  {t}
                </Badge>
              ))}
              <span className='ml-auto text-sm text-muted-foreground'>
                {p.id}
              </span>
            </div>
            <div className='mt-2 flex gap-2'>
              <Button size='sm' asChild>
                <a href={p.url} target='_blank' rel='noopener noreferrer'>
                  Solve now
                </a>
              </Button>
              <Button size='sm' variant='outline' className='bg-transparent'>
                Try similar
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}