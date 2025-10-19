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

  const fetchUserStats = async (handleOverride?: string) => {
    const handle = (handleOverride ?? userHandle).trim();
    if (!handle) return;
    setUserLoading(true);
    setUserError('');
    setUserStats(null);

    try {
      const response = await fetch(
        `/api/cf/profile?handle=${encodeURIComponent(handle)}`,
        { cache: 'no-store' }
      );
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setUserStats(data.stats);
    } catch (error) {
      let msg = 'Failed to fetch user data. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('404'))
          msg = `User '${handle}' not found on Codeforces.`;
        else msg = error.message;
      }
      setUserError(msg);
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-transparent dark:via-transparent dark:to-transparent'>
      {/* Animated background blobs - enhanced for light theme */}
      <div className='absolute top-[-50px] left-[-50px] sm:top-[-80px] sm:left-[-80px] lg:top-[-100px] lg:left-[-100px] w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] lg:w-[300px] lg:h-[300px] bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-blob' />
      <div className='absolute bottom-[-40px] right-[-40px] sm:bottom-[-60px] sm:right-[-60px] lg:bottom-[-80px] lg:right-[-120px] w-[180px] h-[180px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-blob animation-delay-2000' />
      <div className='absolute top-1/3 right-1/4 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] bg-pink-500/15 dark:bg-pink-600/15 rounded-full blur-3xl animate-blob animation-delay-4000' />

      <section className='relative pt-4 sm:pt-8 lg:pt-10 pb-6 sm:pb-12 lg:pb-16 px-3 sm:px-4 lg:px-6 z-10'>
        <div className='max-w-6xl mx-auto text-center mb-4 sm:mb-8 lg:mb-10'>
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
            className='max-w-md mx-auto mt-6 sm:mt-10 lg:mt-12 mb-4 sm:mb-6 lg:mb-8 px-2'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CFVerificationTrigger
              compact
              showTitle={false}
              onVerificationComplete={data => {
                setUserHandle(data.handle);
                fetchUserStats(data.handle);
              }}
            />
          </motion.div>

          {/* Input */}
          <motion.div
            className='max-w-md mx-auto mb-6 sm:mb-10 lg:mb-12 flex flex-col sm:flex-row gap-2 px-2'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Input
              placeholder='Enter Codeforces handle'
              value={userHandle}
              onChange={e => setUserHandle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUserStats()}
              className='flex-1 h-10 sm:h-11 text-sm sm:text-base bg-white dark:bg-black border-gray-300 dark:border-gray-800'
            />
            <Button
              onClick={() => fetchUserStats()}
              disabled={userLoading}
              className='h-10 sm:h-11 w-full sm:w-auto text-sm sm:text-base bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
            >
              {userLoading ? (
                <motion.div
                  className='h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin'
                  aria-label='Loading'
                />
              ) : (
                <span>Get Stats</span>
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
                className='max-w-3xl mx-auto mb-4 sm:mb-6 lg:mb-8 px-2'
              >
                <Card className='bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 shadow-sm'>
                  <CardContent className='p-3 sm:p-4 text-center text-red-600 dark:text-red-400 font-medium text-xs sm:text-sm'>
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
                className='max-w-4xl mx-auto mb-6 sm:mb-10 lg:mb-12 px-2'
              >
                <Card className='glass-card border border-gray-300 dark:border-border/40 shadow-xl'>
                  <CardHeader className='pb-3 sm:pb-4 lg:pb-6'>
                    <CardTitle className='flex items-center gap-2 justify-center text-base sm:text-lg lg:text-xl font-semibold flex-wrap'>
                      <Trophy className='h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-yellow-500' />
                      <span className='bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent break-all'>
                        {userHandle}'s Profile
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <motion.div
                      className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'
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
                          color: 'text-blue-600 dark:text-blue-400',
                          value: userStats.totalSolved,
                        },
                        {
                          label: 'Current Rating',
                          color: 'text-green-600 dark:text-green-400',
                          value: userStats.currentRating,
                        },
                        {
                          label: 'Max Rating',
                          color: 'text-purple-600 dark:text-purple-400',
                          value: userStats.maxRating,
                        },
                      ].map(({ label, color, value }) => (
                        <motion.div
                          key={label}
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className='text-center py-2'
                        >
                          <div
                            className={`text-xl sm:text-2xl lg:text-3xl font-bold ${color}`}
                          >
                            <AnimatedCounter value={value} />
                          </div>
                          <div className='text-gray-600 dark:text-gray-400 mt-1 text-xs sm:text-sm lg:text-base'>
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
