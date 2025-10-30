'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Timer, Calendar, Trophy, Zap, Target } from 'lucide-react';
import { CardHeader, Card, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface Contest {
  id: number;
  name: string;
  startTimeSeconds: number;
  durationSeconds: number;
  type: string;
}

const getBadgeClass = (type: string) => {
  // Simple, clean badge styling for all types
  return 'bg-secondary text-secondary-foreground';
};

const getDifficultyIndicator = (type: string) => {
  if (type.includes('Div. 1'))
    return { level: 'Expert', color: 'text-muted-foreground' };
  if (type.includes('Div. 2'))
    return { level: 'Advanced', color: 'text-muted-foreground' };
  if (type.includes('Div. 3'))
    return { level: 'Intermediate', color: 'text-muted-foreground' };
  if (type.includes('Div. 4'))
    return { level: 'Beginner', color: 'text-muted-foreground' };
  return { level: 'Mixed', color: 'text-muted-foreground' };
};

// Countdown component
function Countdown({ startTime }: { startTime: number }) {
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(startTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeRemaining(startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className='font-mono font-bold'>{timeLeft}</span>;
}

// Countdown formatter
const formatTimeRemaining = (startTime: number) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = startTime - now;

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export default function ContestSection() {
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);

  useEffect(() => {
    fetchUpcomingContests();

    const refresher = setInterval(fetchUpcomingContests, 5 * 60 * 1000);
    return () => clearInterval(refresher);
  }, []);

  useEffect(() => {
    const fetchUserRating = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('cf_snapshots')
        .select('rating')
        .eq('user_id', userId)
        .order('captured_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return;
      if (data?.rating) setUserRating(data.rating);
    };

    fetchUserRating();
  }, []);

  const fetchUpcomingContests = async () => {
    try {
      const response = await fetch('/api/cf/contests');
      if (!response.ok) throw new Error('Failed to fetch contests');
      const data = await response.json();
      setUpcomingContests(data.upcoming || []);
    } catch {
      setUpcomingContests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContestClick = (contest: Contest) => {
    const url = `https://codeforces.com/contestRegistration/${contest.id}`;
    const timeLeftMs = contest.startTimeSeconds * 1000 - Date.now();
    const daysLeft = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
    const lowername = contest.name.toLowerCase();

    if (lowername.includes('div. 1') && !lowername.includes('div. 2')) {
      if (userRating < 1900) {
        toast({
          title: 'Not Eligible',
          description:
            'Register for Div2 because your current rating is <1900.',
          variant: 'destructive',
          className: 'text-white',
        });
        return;
      }
    }

    if (daysLeft < 2) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Registration Not Started',
        description: `Registration isn't opened yet, please wait ~${daysLeft} days!`,
        variant: 'destructive',
        className: 'text-white',
      });
    }
  };

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-6 w-3/4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-4 w-full mb-2' />
              <Skeleton className='h-4 w-1/2' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <section className='py-16 px-4 mb-8 mt-5'>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <div className='inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-md border bg-background'>
            <Trophy className='w-4 h-4 text-foreground' />
            <span className='text-sm font-semibold text-foreground'>
              LIVE CONTESTS
            </span>
          </div>
          <h2 className='text-2xl md:text-3xl font-semibold mb-4'>
            Upcoming Contests
          </h2>
          <p className='text-base text-muted-foreground max-w-2xl mx-auto'>
            Compete in real-time contests with live countdowns. Choose your
            division and challenge yourself against the community.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {upcomingContests.length > 0 ? (
            upcomingContests.map((contest, i) => {
              const now = Math.floor(Date.now() / 1000);
              const timeDiff = contest.startTimeSeconds - now;
              const urgent = timeDiff < 3600; // <1 hour
              const difficulty = getDifficultyIndicator(contest.type);

              return (
                <motion.div
                  key={contest.id}
                  className='block h-full'
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  viewport={{ once: true }}
                  onClick={() => handleContestClick(contest)}
                  role='link'
                  tabIndex={0}
                  aria-label={`Contest ${
                    contest.name
                  }, starts in ${formatTimeRemaining(
                    contest.startTimeSeconds
                  )}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className='rounded-lg h-full cursor-pointer border hover:shadow-md transition-all duration-200'
                  >
                    <Card className='border-0 rounded-lg h-full'>
                      <CardHeader className='pb-3'>
                        <div className='flex justify-between items-start gap-3 mb-2'>
                          <div className='flex-1'>
                            <CardTitle className='text-base line-clamp-2'>
                              {contest.name}
                            </CardTitle>
                          </div>
                          <Badge
                            className={`${getBadgeClass(
                              contest.type
                            )} whitespace-nowrap flex-shrink-0 text-xs`}
                            variant='secondary'
                          >
                            {contest.type}
                          </Badge>
                        </div>

                        <div
                          className={`text-xs ${difficulty.color}`}
                        >
                          <span>{difficulty.level}</span>
                        </div>
                      </CardHeader>

                      <CardContent className='space-y-4'>
                        <div className='rounded-md p-3 border bg-muted/50'>
                          <div className='flex items-center gap-2 mb-1'>
                            <Zap className='h-4 w-4 text-foreground' />
                            <span className='text-xs font-medium text-muted-foreground'>
                              Starts in
                            </span>
                          </div>
                          <div className='text-xl font-mono font-semibold'>
                            <Countdown startTime={contest.startTimeSeconds} />
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Calendar className='h-4 w-4 flex-shrink-0' />
                            <span className='truncate'>
                              {new Date(
                                contest.startTimeSeconds * 1000
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Timer className='h-4 w-4 flex-shrink-0' />
                            <span>
                              {Math.floor(contest.durationSeconds / 3600)}h{' '}
                              {Math.floor(
                                (contest.durationSeconds % 3600) / 60
                              )}
                              m duration
                            </span>
                          </div>
                        </div>

                        <Button
                          asChild
                          className='w-full mt-4'
                          variant={urgent ? 'default' : 'outline'}
                          onClick={e => e.stopPropagation()}
                        >
                          <a
                            href={`https://codeforces.com/contest/${contest.id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center justify-center gap-2'
                          >
                            <Target className='h-4 w-4' />
                            {urgent ? 'Register Now' : 'View Contest'}
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })
          ) : (
            <div className='col-span-full text-center py-16'>
              <Trophy className='w-16 h-16 text-muted-foreground/30 mx-auto mb-4' />
              <p className='text-base text-muted-foreground'>
                No upcoming contests found. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
      <hr className='border-border/30 dark:border-border/20 m-10' />
    </section>
  );
}