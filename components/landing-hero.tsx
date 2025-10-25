'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Trophy,
  TrendingUp,
  Target,
  Award,
  Search,
  AlertCircle,
  Sparkles,
  Code2,
  Zap,
} from 'lucide-react';
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger';
import BannerLanding from './banner-landing';

const AnimatedCounter = ({
  value,
  duration = 1500,
}: {
  value: number;
  duration?: number;
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setUserStats(data.stats);
    } catch (error) {
      let msg = 'Failed to fetch user data. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          msg = `User '${handle}' not found on Codeforces.`;
        } else {
          msg = error.message;
        }
      }
      setUserError(msg);
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] relative overflow-hidden'>
      {/* Modern gradient mesh background */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/20' />

      {/* Animated gradient orbs - modern and subtle */}
      <div className='absolute inset-0 overflow-hidden'>
        <motion.div
          className='absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10'
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className='absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10'
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className='absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-15 dark:opacity-8'
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          animate={{
            scale: [1, 1.25, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Noise texture overlay for depth */}
      <div
        className='absolute inset-0 opacity-[0.015] dark:opacity-[0.02] mix-blend-overlay pointer-events-none'
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      <section className='relative pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 z-10'>
        <div className='max-w-6xl mx-auto'>
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className='text-center mb-12 sm:mb-16'
          >
            <BannerLanding />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className='flex items-center justify-center gap-2 mt-6 text-muted-foreground/80'
            >
              <Zap className='h-4 w-4 text-primary' />
              <span className='text-sm font-medium'>
                Track your competitive programming journey
              </span>
            </motion.div>
          </motion.div>

          {/* CF Verification - Modern Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className='max-w-2xl mx-auto mb-8'
          >
            <div className='modern-card group'>
              <CFVerificationTrigger
                compact
                showTitle={false}
                onVerificationComplete={data => {
                  setUserHandle(data.handle);
                  fetchUserStats(data.handle);
                }}
              />
            </div>
          </motion.div>

          {/* Search Input - Sleek Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className='max-w-2xl mx-auto mb-12'
          >
            <div className='modern-card group'>
              <div className='flex flex-col sm:flex-row gap-3'>
                <div className='relative flex-1'>
                  <div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none'>
                    <Search className='h-5 w-5 text-muted-foreground/60' />
                  </div>
                  <Input
                    placeholder='Enter Codeforces handle...'
                    value={userHandle}
                    onChange={e => setUserHandle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchUserStats()}
                    className='h-14 pl-12 text-base bg-transparent border-border/40 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/50'
                  />
                </div>
                <Button
                  onClick={() => fetchUserStats()}
                  disabled={userLoading || !userHandle.trim()}
                  size='lg'
                  className='h-14 px-8 rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-40 disabled:shadow-none'
                >
                  {userLoading ? (
                    <>
                      <motion.div
                        className='h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-2'
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Code2 className='h-5 w-5 mr-2' />
                      <span>Get Stats</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Error Alert */}
          <AnimatePresence mode='wait'>
            {userError && (
              <motion.div
                key='error'
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className='max-w-2xl mx-auto mb-8'
              >
                <div className='modern-card border-red-500/20 bg-red-500/5'>
                  <div className='flex items-start gap-3 text-red-600 dark:text-red-400'>
                    <AlertCircle className='h-5 w-5 flex-shrink-0 mt-0.5' />
                    <p className='text-sm font-medium leading-relaxed'>
                      {userError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Display */}
          <AnimatePresence mode='wait'>
            {userStats && (
              <motion.div
                key='stats'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 80 }}
                className='max-w-5xl mx-auto space-y-6'
              >
                {/* Profile Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className='modern-card-featured'
                >
                  <div className='flex items-center justify-center gap-4'>
                    <motion.div
                      animate={{
                        rotate: [0, 5, 0, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Trophy className='h-10 w-10 text-yellow-500 drop-shadow-lg' />
                    </motion.div>
                    <div className='text-center'>
                      <h2 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent'>
                        {userHandle}
                      </h2>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Codeforces Statistics
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Stats Cards Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
                  {[
                    {
                      label: 'Problems Solved',
                      value: userStats.totalSolved,
                      icon: Target,
                      color: 'blue',
                      gradient: 'from-blue-500 to-cyan-500',
                      delay: 0.2,
                    },
                    {
                      label: 'Current Rating',
                      value: userStats.currentRating,
                      icon: TrendingUp,
                      color: 'green',
                      gradient: 'from-green-500 to-emerald-500',
                      delay: 0.3,
                    },
                    {
                      label: 'Max Rating',
                      value: userStats.maxRating,
                      icon: Award,
                      color: 'purple',
                      gradient: 'from-purple-500 to-pink-500',
                      delay: 0.4,
                    },
                  ].map(({ label, value, icon: Icon, gradient, delay }) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay, duration: 0.5, type: 'spring' }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className='modern-card-stat group cursor-default'
                    >
                      <div className='flex items-start justify-between mb-6'>
                        <div
                          className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className='h-6 w-6 text-white' />
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: delay + 0.3,
                            type: 'spring',
                            stiffness: 200,
                          }}
                          className={`text-4xl sm:text-5xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}
                        >
                          <AnimatedCounter value={value} />
                        </motion.div>
                      </div>
                      <p className='text-sm font-semibold text-muted-foreground/70 uppercase tracking-wide'>
                        {label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
