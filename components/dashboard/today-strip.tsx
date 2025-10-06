'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCFVerification } from '@/lib/context/cf-verification';

type Problem = {
  id: string;
  title: string;
  rating: number;
  tags: string[];
  url: string;
  solved?: boolean;
};

export function TodayStrip() {
  const { isVerified, verificationData } = useCFVerification();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!isVerified || !verificationData) return;

    const storedStreak = localStorage.getItem('cf_daily_streak');
    setStreak(storedStreak ? parseInt(storedStreak) : 0);

    const fetchProblems = async () => {
      try {
        const res = await fetch(
          'https://codeforces.com/api/problemset.problems'
        );
        const data = await res.json();
        if (data.status === 'OK') {
          const userRating = verificationData.rating || 0;
          const recommended = data.result.problems
            .filter(
              (p: any) =>
                p.rating &&
                p.rating >= userRating - 200 &&
                p.rating <= userRating + 200
            )
            .slice(0, 6)
            .map((p: any) => ({
              id: `${p.contestId}${p.index}`,
              title: p.name,
              rating: p.rating,
              tags: p.tags,
              url: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
              solved: false,
            }));
          setProblems(recommended);
        }
      } catch (error) {
        console.error('Failed to fetch today problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [isVerified, verificationData]);

  const markSolved = (id: string) => {
    setProblems(prev =>
      prev.map(p => (p.id === id ? { ...p, solved: true } : p))
    );
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <h1 className='text-2xl font-semibold md:text-3xl'>
          Today's Challenge
        </h1>
        <p className='text-sm text-muted-foreground'>Loading problems…</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold md:text-3xl'>
          Today's Challenge
        </h1>
        <Badge className='bg-amber-500 text-black'>
          🔥 Streak: {streak} day{streak === 1 ? '' : 's'}
        </Badge>
      </div>

      {/* Problems */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {problems.map(p => (
          <Card
            key={p.id}
            className={`border ${
              p.solved
                ? 'border-green-400 bg-green-50'
                : 'border-muted-foreground/10'
            }`}
          >
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>{p.title}</CardTitle>
              <CardDescription className='flex items-center gap-2'>
                ⭐ {p.rating}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex items-center justify-end gap-2'>
              {p.solved ? (
                <Badge className='bg-green-500 text-white'>Solved ✅</Badge>
              ) : (
                <>
                  <Button asChild>
                    <Link
                      href={p.url}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Solve
                    </Link>
                  </Button>
                  <Button variant='outline' onClick={() => markSolved(p.id)}>
                    Mark Solved
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
