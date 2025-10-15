'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface Contest {
  id: number;
  name: string;
  type: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds: number;
}

export function UpcomingContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch('https://codeforces.com/api/contest.list');
        const data = await res.json();

        if (data.status === 'OK') {
          const upcoming = data.result
            .filter((c: Contest) => c.phase === 'BEFORE')
            .sort(
              (a: Contest, b: Contest) =>
                a.startTimeSeconds - b.startTimeSeconds
            ) // ascending order
            .slice(0, 3);
          setContests(upcoming);
        }

      } catch (error) {
        console.error('Failed to fetch contests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatStartTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h`;
    return 'soon';
  };

  return (
    <Card className='bg-neutral-900/90 border-gray-800'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold text-white'>
          Upcoming Contests
        </CardTitle>
        <CardDescription>
          Get ready to solve! Codeforces contests starting soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-20 w-full rounded-lg' />
            ))
          ) : contests.length > 0 ? (
            contests.map((contest, idx) => (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className='relative p-4 border border-gray-800 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80'>
                  <div className='flex flex-col gap-2'>
                    <h4 className='text-white font-semibold truncate group-hover:text-purple-400 text-sm'>
                      {contest.name}
                    </h4>
                    <div className='flex items-center gap-3 text-xs text-gray-400'>
                      <Calendar className='h-3 w-3' />
                      <span>{formatStartTime(contest.startTimeSeconds)}</span>
                      <Clock className='h-3 w-3' />
                      <span>{formatDuration(contest.durationSeconds)}</span>
                    </div>
                    <Badge
                      variant='outline'
                      className='mt-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    >
                      {contest.type}
                    </Badge>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    asChild
                    className='absolute top-2 right-2 text-gray-400 group-hover:text-white'
                  >
                    <a
                      href={`https://codeforces.com/contest/${contest.id}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <ExternalLink className='h-4 w-4' />
                    </a>
                  </Button>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className='col-span-full text-center py-8 text-gray-400'>
              No upcoming contests
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
