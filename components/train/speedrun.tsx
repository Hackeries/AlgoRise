'use client';

import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const getJSON = (url: string) => fetch(url).then(r => r.json());
const postJSON = (url: string, body: any) =>
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json());

function cfUrl(contestId: number, index: string) {
  return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
}

export function Speedrun() {
  const [running, setRunning] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(
    'Easy'
  );
  const [seconds, setSeconds] = useState(0);
  const [index, setIndex] = useState(0);
  const [problems, setProblems] = useState<any[]>([]);

  const { data: profile } = useSWR<
    { cf_handle?: string; cf_verified?: boolean } | { error: string }
  >('/api/profile', getJSON);
  const { data: progress } = useSWR<any>('/api/cf/progress', getJSON);

  const latestRating = progress?.progress?.ratingHistory?.length
    ? progress.progress.ratingHistory[
        progress.progress.ratingHistory.length - 1
      ]?.newRating
    : undefined;

  const ratingBase = typeof latestRating === 'number' ? latestRating : 1200;
  const [min, max] = useMemo(() => {
    if (difficulty === 'Easy')
      return [Math.max(800, ratingBase - 300), Math.max(900, ratingBase - 50)];
    if (difficulty === 'Medium')
      return [Math.max(900, ratingBase - 100), ratingBase + 150];
    return [ratingBase + 100, ratingBase + 400];
  }, [difficulty, ratingBase]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = async () => {
    setSeconds(0);
    setIndex(0);
    setRunning(true);
    const handle = (profile as any)?.cf_verified
      ? (profile as any)?.cf_handle
      : undefined;
    const res = await postJSON('/api/practice/generate', {
      count: 8,
      ratingMin: min,
      ratingMax: max,
      handle,
    });
    setProblems(res?.problems || []);
  };

  const next = () =>
    setIndex(i => (problems.length ? (i + 1) % problems.length : 0));
  const stop = () => setRunning(false);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  };

  const current = problems[index];

  return (
    <Card className='border h-full'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center justify-between'>
          <span>Speedrun Mode</span>
          <Badge variant='secondary'>{difficulty}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          <div className='col-span-2'>
            <Label className='text-sm text-muted-foreground'>
              Select difficulty
            </Label>
            <div className='mt-2 grid grid-cols-3 gap-2'>
              {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                <Button
                  key={d}
                  variant={d === difficulty ? 'default' : 'outline'}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className='text-sm text-muted-foreground'>Time</Label>
            <Input readOnly value={fmt(seconds)} className='mt-2' />
          </div>
        </div>
        <div className='rounded-md border p-3'>
          <p className='text-sm text-muted-foreground'>Current</p>
          {current ? (
            <div className='flex flex-wrap items-center gap-2'>
              <p className='font-medium'>{current.name}</p>
              {typeof current.rating === 'number' && (
                <Badge>CF {current.rating}</Badge>
              )}
              {current.tags?.slice(0, 3).map((t: string) => (
                <Badge key={t} variant='outline'>
                  {t}
                </Badge>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              Press Start to fetch a timed set.
            </p>
          )}
        </div>
        <div className='flex gap-2'>
          {!running ? (
            <Button className='flex-1' onClick={start}>
              Start
            </Button>
          ) : (
            <>
              <Button
                variant='outline'
                className='flex-1 bg-transparent'
                onClick={next}
                disabled={!problems.length}
              >
                Next
              </Button>
              <Button className='flex-1' onClick={stop}>
                End
              </Button>
            </>
          )}
        </div>
        {current && (
          <Button className='w-full' asChild>
            <a
              href={cfUrl(current.contestId, current.index)}
              target='_blank'
              rel='noopener noreferrer'
            >
              Open Problem
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
