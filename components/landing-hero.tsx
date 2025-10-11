'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy } from 'lucide-react';
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger';
import BannerLanding from './banner-landing';

// Animated counter using requestAnimationFrame
const AnimatedCounter = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    const duration = 1000;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
};

interface UserStats {
  totalSolved: number;
  currentRating: number;
  maxRating: number;
  tagDistribution: Record<string, number>;
}

export default function ModernLanding() {
  const [userHandle, setUserHandle] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');

  const fetchUserStats = async () => {
    if (!userHandle.trim()) return;
    setUserLoading(true);
    setUserError('');
    setUserStats(null);

    try {
      const response = await fetch(`/api/cf/profile?handle=${userHandle}`);
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setUserStats(data.stats);
    } catch (error) {
      let msg = 'Failed to fetch user data. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('404'))
          msg = `User '${userHandle}' not found on Codeforces.`;
        else msg = error.message;
      }
      setUserError(msg);
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className='min-h-screen relative overflow-hidden'>
      {/* ✨ Decorative Background Shapes */}
      <div className='absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-400 rounded-full opacity-20 blur-3xl animate-blob' />
      <div className='absolute bottom-[-80px] right-[-120px] w-[400px] h-[400px] bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000' />

      <section className='relative pt-10 pb-16 px-4 z-10'>
        <div className='max-w-6xl mx-auto text-center mb-10'>
          {/* Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <BannerLanding />
          </motion.div>

          {/* CF Verification */}
          <motion.div
            className='max-w-md mx-auto mt-12 mb-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CFVerificationTrigger
              compact
              showTitle={false}
              onVerificationComplete={data => {
                setUserHandle(data.handle);
                fetchUserStats();
              }}
            />
          </motion.div>

          {/* Input */}
          <motion.div
            className='max-w-md mx-auto mb-12 flex gap-2'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Input
              placeholder='Enter Codeforces handle'
              value={userHandle}
              onChange={e => setUserHandle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUserStats()}
              className='flex-1'
            />
            <Button onClick={fetchUserStats} disabled={userLoading}>
              {userLoading ? (
                <motion.div
                  className='h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                  aria-label='Loading'
                />
              ) : (
                'Get Stats'
              )}
            </Button>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {userError && (
              <motion.div
                key='error'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='max-w-3xl mx-auto mb-8'
              >
                <Card className='bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 shadow-sm'>
                  <CardContent className='p-4 text-center text-red-600 dark:text-red-400 font-medium'>
                    {userError}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <AnimatePresence>
            {userStats && (
              <motion.div
                key='stats'
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className='max-w-4xl mx-auto mb-12'
              >
                <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-border/30 shadow-xl'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 justify-center text-xl font-semibold'>
                      <Trophy className='h-5 w-5 text-yellow-500' />
                      <span className='bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent'>
                        {userHandle}'s Profile
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className='grid grid-cols-1 md:grid-cols-3 gap-6'
                      initial='hidden'
                      animate='visible'
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.15 } },
                      }}
                    >
                      {[
                        {
                          label: 'Problems Solved',
                          color: 'text-blue-600',
                          value: userStats.totalSolved,
                        },
                        {
                          label: 'Current Rating',
                          color: 'text-green-600',
                          value: userStats.currentRating,
                        },
                        {
                          label: 'Max Rating',
                          color: 'text-purple-600',
                          value: userStats.maxRating,
                        },
                      ].map(({ label, color, value }) => (
                        <motion.div
                          key={label}
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className='text-center'
                        >
                          <div className={`text-3xl font-bold ${color}`}>
                            <AnimatedCounter value={value} />
                          </div>
                          <div className='text-gray-600 dark:text-gray-400 mt-1'>
                            {label}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}