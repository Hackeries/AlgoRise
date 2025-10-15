'use client';

import useSWR, { type Fetcher } from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

const getJSON = async <T,>(url: string): Promise<T> =>
  fetch(url).then(r => r.json() as Promise<T>);
const postJSON = async <T,>(url: string, body: unknown): Promise<T> =>
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json() as Promise<T>);

function cfUrl(contestId: number, index: string) {
  return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
}

type CFProblem = {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags?: string[];
};
type ProfileResponse =
  | {
      cf_handle?: string;
      cf_verified?: boolean;
      name?: string;
      full_name?: string;
    }
  | { error: string };
type RecosResponse = { problems: CFProblem[]; total?: number; error?: string };
type RecosKey = readonly [
  'practice-generate',
  number,
  number,
  string | undefined,
  string[] | undefined,
  number
];

const QUICK_TAGS = ['greedy', 'dp', 'math', 'implementation', 'graphs'];

export function ProblemRecos() {
  // Profile + progress
  const { data: profile } = useSWR<ProfileResponse>('/api/profile', getJSON);
  const { data: progress } = useSWR<any>('/api/cf/progress', getJSON);

  const latestRating = progress?.progress?.ratingHistory?.length
    ? progress.progress.ratingHistory[
        progress.progress.ratingHistory.length - 1
      ]?.newRating
    : undefined;

  // Defaults derived from rating
  const defaultMin =
    typeof latestRating === 'number' ? Math.max(800, latestRating - 200) : 900;
  const defaultMax =
    typeof latestRating === 'number' ? latestRating + 150 : 1400;

  // Interactive controls
  const [min, setMin] = useState<number>(defaultMin);
  const [max, setMax] = useState<number>(defaultMax);
  const [tags, setTags] = useState<string[]>([]);
  const [count, setCount] = useState<number>(6);

  const handle = (profile as any)?.cf_verified
    ? (profile as any)?.cf_handle
    : undefined;

  const recosKey: RecosKey = useMemo(
    () => [
      'practice-generate',
      min,
      max,
      handle,
      tags.length ? tags : undefined,
      count,
    ],
    [min, max, handle, tags, count]
  );

  const recosFetcher: Fetcher<RecosResponse, RecosKey> = async ([
    ,
    ratingMin,
    ratingMax,
    h,
    t,
    c,
  ]: RecosKey) =>
    postJSON<RecosResponse>('/api/practice/generate', {
      count: c,
      ratingMin,
      ratingMax,
      tags: t,
      handle: h,
    });

  const { data, isLoading, mutate } = useSWR<RecosResponse, Error, RecosKey>(
    recosKey,
    recosFetcher
  );
  const recos: CFProblem[] = data?.problems || [];

  function toggleTag(tag: string) {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function preset(type: 'warmup' | 'grind' | 'peak') {
    const base = typeof latestRating === 'number' ? latestRating : 1200;
    if (type === 'warmup') {
      setMin(Math.max(800, base - 200));
      setMax(Math.max(900, base - 50));
    } else if (type === 'grind') {
      setMin(Math.max(800, base - 50));
      setMax(base + 150);
    } else {
      setMin(base + 150);
      setMax(base + 300);
    }
  }

  return (
    <Card className='border h-full'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between gap-3'>
          <CardTitle>Recommended Problems</CardTitle>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => preset('warmup')}
            >
              Warmup
            </Button>
            <Button size='sm' variant='outline' onClick={() => preset('grind')}>
              Grind
            </Button>
            <Button size='sm' variant='outline' onClick={() => preset('peak')}>
              Peak
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Controls */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <div className='flex items-end gap-2'>
            <div className='flex-1'>
              <label className='text-xs text-muted-foreground'>
                Min rating
              </label>
              <Input
                type='number'
                inputMode='numeric'
                min={800}
                max={3900}
                value={min}
                onChange={e => setMin(Number(e.target.value || 0))}
              />
            </div>
            <div className='flex-1'>
              <label className='text-xs text-muted-foreground'>
                Max rating
              </label>
              <Input
                type='number'
                inputMode='numeric'
                min={min}
                max={4000}
                value={max}
                onChange={e => setMax(Number(e.target.value || 0))}
              />
            </div>
            <div className='w-24'>
              <label className='text-xs text-muted-foreground'>Count</label>
              <Input
                type='number'
                inputMode='numeric'
                min={3}
                max={20}
                value={count}
                onChange={e =>
                  setCount(
                    Math.min(20, Math.max(3, Number(e.target.value || 0)))
                  )
                }
              />
            </div>
          </div>

          <div className='md:col-span-2'>
            <div className='flex flex-wrap items-center gap-2'>
              {QUICK_TAGS.map(t => (
                <Button
                  key={t}
                  type='button'
                  size='sm'
                  variant={tags.includes(t) ? 'default' : 'outline'}
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </Button>
              ))}
              <Button
                type='button'
                size='sm'
                onClick={() => mutate()}
                className='ml-auto'
              >
                Refresh
              </Button>
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>
              {handle
                ? 'Excluding solved for your CF handle.'
                : 'Link your CF handle to exclude solved problems.'}
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading && (
          <div className='text-sm text-muted-foreground'>
            Fetching recommendations…
          </div>
        )}

        {!isLoading && recos.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            No recommendations found for the current filters. Try widening the
            rating window or clearing tags.
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {recos.map(p => (
            <div
              key={`${p.contestId}${p.index}`}
              className='rounded-md border p-3'
            >
              <div className='flex flex-wrap items-center gap-2'>
                <span className='font-medium text-pretty'>{p.name}</span>
                {typeof p.rating === 'number' && <Badge>CF {p.rating}</Badge>}
                {p.tags?.slice(0, 3).map(t => (
                  <Badge key={t} variant='outline'>
                    {t}
                  </Badge>
                ))}
                <span className='ml-auto text-sm text-muted-foreground'>
                  {p.contestId}
                  {p.index}
                </span>
              </div>
              <div className='mt-2 flex gap-2'>
                <Button size='sm' asChild>
                  <a
                    href={cfUrl(p.contestId, p.index)}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Solve
                  </a>
                </Button>
                <Button size='sm' variant='outline'>
                  Add to List
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}