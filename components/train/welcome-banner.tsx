'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Flame, Bolt, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type WelcomeBannerProps = {
  onDismiss?: () => void;
};

export function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);

  const quotes = [
    'No one becomes LGM by luck. It’s all sweat and debugging.',
    'Wake up. Your next AC is waiting.',
    'Upsolve before sleep. Not tomorrow.',
    'If you didn’t code today, someone else did.',
    'ICPC finalists aren’t born — they grind.',
    'Graph theory won’t learn itself.',
    'DP waits for no one.',
    'Solve, optimize, repeat.',
  ];

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeBanner');
    const justCompletedProfile = sessionStorage.getItem('profileCompleted');

    if (!hasSeenWelcome || justCompletedProfile) {
      setIsVisible(true);
      sessionStorage.removeItem('profileCompleted');
    }

    // Fetch user name
    fetch('/api/profile/overview')
      .then(res => res.json())
      .then(data => {
        const display =
          data?.name?.trim?.() ||
          data?.full_name?.trim?.() ||
          data?.cf_handle?.trim?.() ||
          '';
        if (display) setUserName(display);
      })
      .catch(() => {});

    // Rotate motivational lines every 4 seconds for faster grind feel
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcomeBanner', 'true');
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className='mb-6'
        >
          <Card className='relative overflow-hidden border-2 border-blue-500/40 bg-gradient-to-br from-gray-900 via-purple-950/40 to-blue-950/30 backdrop-blur-md shadow-lg'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse' />
            <CardContent className='relative p-6'>
              <Button
                variant='ghost'
                size='icon'
                className='absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-white'
                onClick={handleDismiss}
              >
                <X className='h-4 w-4' />
              </Button>

              <div className='flex flex-col sm:flex-row items-start gap-5'>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className='hidden sm:flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-yellow-500 shadow-lg flex-shrink-0'
                >
                  <Flame className='h-7 w-7 text-white' />
                </motion.div>

                <div className='flex-1 space-y-5'>
                  <div>
                    <h2 className='text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-red-400 via-yellow-400 to-pink-400 bg-clip-text text-transparent'>
                      {userName
                        ? `Welcome back, ${userName}. Time to grind.`
                        : 'Welcome to AlgoRise — Time to Grind.'}
                    </h2>

                    <motion.p
                      key={quoteIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className='mt-2 text-base text-gray-300 italic'
                    >
                      {quotes[quoteIndex]}
                    </motion.p>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                    <div className='flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition'>
                      <Target className='h-5 w-5 text-blue-400 mt-0.5' />
                      <div>
                        <div className='text-sm font-semibold text-white'>
                          Rating Goal
                        </div>
                        <div className='text-xs text-gray-400 mt-1'>
                          Reach your next rating milestone
                        </div>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition'>
                      <Flame className='h-5 w-5 text-red-400 mt-0.5' />
                      <div>
                        <div className='text-sm font-semibold text-white'>
                          Daily Streak
                        </div>
                        <div className='text-xs text-gray-400 mt-1'>
                          Solve at least one problem today
                        </div>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition'>
                      <Bolt className='h-5 w-5 text-yellow-400 mt-0.5' />
                      <div>
                        <div className='text-sm font-semibold text-white'>
                          Instant Practice
                        </div>
                        <div className='text-xs text-gray-400 mt-1'>
                          Jump to your next CP problem
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col sm:flex-row gap-3'>
                    <Button
                      asChild
                      className='bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700'
                    >
                      <Link href='/adaptive-sheet'>💻 Solve Next Problem</Link>
                    </Button>
                    <Button
                      asChild
                      variant='outline'
                      className='border-gray-700 hover:bg-white/10 bg-transparent text-gray-300'
                    >
                      <Link href='/paths'>📊 Your ICPC Roadmap</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}