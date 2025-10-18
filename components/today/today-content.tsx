'use client';

import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type TodayProblem = {
  id: string;
  title: string;
  url: string;
  rating: number;
  tags: string[];
  next_due_at?: string;
};

type AdaptiveResponse = {
  items: TodayProblem[];
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

function isDueToday(iso?: string) {
  if (!iso) return false;
  const due = new Date(iso);
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return due.getTime() <= endOfDay.getTime();
}

function formatRelative(iso?: string) {
  if (!iso) return 'due';
  const diff = Math.max(0, new Date(iso).getTime() - Date.now());
  const mins = Math.floor(diff / 60000);
  if (mins <= 0) return 'due now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h`;
}

export function TodayContent() {
  const { data, isLoading, mutate } = useSWR<AdaptiveResponse>(
    '/api/adaptive-sheet',
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000,
    }
  );

  const { toast } = useToast();
  const [streak, setStreak] = useState(() => {
    const s = Number(localStorage.getItem('rg_streak') || '0');
    return isNaN(s) ? 0 : s;
  });

  useEffect(() => {
    localStorage.setItem('rg_streak_updated', Date.now().toString());
  }, []);

  const todaySlice = useMemo(() => {
    const dueToday = (data?.items || []).filter(p => isDueToday(p.next_due_at));
    dueToday.sort(
      (a, b) =>
        (a.next_due_at
          ? new Date(a.next_due_at).getTime()
          : Number.MAX_SAFE_INTEGER) -
        (b.next_due_at
          ? new Date(b.next_due_at).getTime()
          : Number.MAX_SAFE_INTEGER)
    );
    return dueToday.slice(0, 3);
  }, [data]);

  async function action(endpoint: 'solve' | 'skip' | 'fail', id: string) {
    try {
      // Optimistic update
      await mutate(
        prev => prev && { ...prev, items: prev.items.filter(p => p.id !== id) },
        { revalidate: false }
      );

      await fetch(`/api/adaptive-sheet/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: id }),
      });
      await mutate();

      // Update streak if solved
      if (endpoint === 'solve') {
        const next = streak + 1;
        setStreak(next);
        localStorage.setItem('rg_streak', String(next));
        toast({
          title: 'Solved ✅',
          description: `Your streak is now ${next} day${
            next === 1 ? '' : 's'
          }.`,
        });
      } else {
        const messages = {
          skip: 'Skipped — will appear later.',
          fail: 'Marked failed — keep practicing!',
        };
        toast({ title: messages[endpoint] });
      }
    } catch {
      await mutate(); // rollback
      toast({ title: 'Action failed', description: 'Please try again.' });
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Streak Banner */}
      <div className='rounded-lg border border-gray-800 bg-neutral-900/50 p-4'>
        <p className='text-sm text-gray-300'>
          {streak
            ? `You're on a ${streak}-day CP streak!`
            : 'Start your CP streak today.'}
        </p>
        <h2 className='text-lg font-semibold text-white mt-1'>
          Keep the competitive momentum
        </h2>
      </div>

      {/* Today's Problems */}
      <section className='flex flex-col gap-4'>
        <h3 className='text-sm font-medium text-gray-200'>
          Today's CP picks
          <span className='ml-2 rounded-full bg-black border border-gray-800 px-2 py-0.5 text-xs text-gray-300'>
            {isLoading ? '…' : todaySlice.length}
          </span>
        </h3>

        {isLoading ? (
          <div className='text-sm text-gray-300'>Loading tasks…</div>
        ) : todaySlice.length === 0 ? (
          <div className='rounded-md border border-gray-800 bg-neutral-900/50 p-4 text-sm text-gray-300'>
            You’re all caught up. Check back tomorrow for new CP problems.
          </div>
        ) : (
          <ul className='flex flex-col gap-3'>
            {todaySlice.map(p => (
              <li
                key={p.id}
                className='rounded-lg border border-gray-800 bg-neutral-950 p-4 flex justify-between items-start gap-3'
              >
                <div className='min-w-0'>
                  <a
                    href={p.url}
                    target='_blank'
                    rel='noreferrer'
                    className='text-base font-semibold text-white hover:text-blue-400'
                  >
                    {p.title}
                  </a>
                  <div className='mt-1 flex flex-wrap gap-2 text-xs text-gray-300'>
                    <span className='rounded-full bg-black border border-gray-800 px-2 py-0.5'>
                      Rating {p.rating}
                    </span>
                    <span className='rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-400'>
                      {formatRelative(p.next_due_at)}
                    </span>
                    {p.tags?.slice(0, 3).map(t => (
                      <span
                        key={t}
                        className='rounded-full bg-black border border-gray-800 px-2 py-0.5'
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className='flex flex-col gap-2 shrink-0'>
                  <button
                    onClick={() => action('solve', p.id)}
                    className='rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500'
                  >
                    Solve
                  </button>
                  <button
                    onClick={() => action('skip', p.id)}
                    className='rounded-md border border-gray-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-neutral-800'
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => action('fail', p.id)}
                    className='rounded-md border border-gray-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-neutral-800'
                  >
                    Fail
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
