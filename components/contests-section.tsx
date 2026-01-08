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
        .order('fetched_at', { ascending: false })
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
          <div className='inline-flex items-center gap-2 mb-6 px-5 py-3 rounded-lg border-2 bg-muted/50 shadow-sm'>
            <Trophy className='w-5 h-5 text-foreground' />
            <span className='text-sm font-bold text-foreground tracking-wider'>
              LIVE CONTESTS
            </span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Upcoming Contests
          </h2>
          <p className='text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
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
                  transition={{ duration: 0.5, delay: i * 0.1 }}
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
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className='h-full'
                  >
                    <Card className='group relative overflow-hidden h-full cursor-pointer border-2 hover:border-foreground/20 hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm'>
                      {/* Subtle gradient overlay on hover */}
                      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                      
                      <CardHeader className='pb-4 relative z-10'>
                        <div className='flex justify-between items-start gap-3 mb-3'>
                          <div className='flex-1 min-w-0'>
                            <CardTitle className='text-base font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors'>
                              {contest.name}
                            </CardTitle>
                            <div className='flex items-center gap-2 flex-wrap'>
                              <Badge
                                className='text-xs font-medium border-foreground/20'
                                variant='outline'
                              >
                                {contest.type}
                              </Badge>
                              <Badge variant='secondary' className='text-xs font-medium'>
                                {difficulty.level}
                              </Badge>
                            </div>
                          </div>
                          <div className='p-2 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors shrink-0'>
                            <Target className='h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors' />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className='space-y-4 relative z-10'>
                        <div className='rounded-lg p-4 border-2 bg-muted/30 group-hover:bg-muted/50 transition-colors'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Zap className='h-4 w-4 text-foreground/70' />
                            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                              Starts in
                            </span>
                          </div>
                          <div className='text-2xl font-mono font-bold text-foreground'>
                            <Countdown startTime={contest.startTimeSeconds} />
                          </div>
                        </div>

                        <div className='space-y-3'>
                          <div className='flex items-center gap-3 text-sm'>
                            <div className='p-2 rounded-md bg-muted/50'>
                              <Calendar className='h-4 w-4 text-foreground/70' />
                            </div>
                            <span className='truncate text-foreground/80 font-medium'>
                              {new Date(
                                contest.startTimeSeconds * 1000
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className='flex items-center gap-3 text-sm'>
                            <div className='p-2 rounded-md bg-muted/50'>
                              <Timer className='h-4 w-4 text-foreground/70' />
                            </div>
                            <span className='text-foreground/80 font-medium'>
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
                          className={`w-full mt-4 font-semibold shadow-md hover:shadow-lg transition-all ${
                            urgent ? 'bg-primary hover:bg-primary/90' : ''
                          }`}
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
              <div className='inline-flex p-6 rounded-lg border-2 bg-muted/50 mb-4'>
                <Trophy className='w-16 h-16 text-muted-foreground/50' />
              </div>
              <p className='text-base text-muted-foreground font-medium'>
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