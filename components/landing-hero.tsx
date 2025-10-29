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
  tagDistribution?: Record<string, number>;
}

export default function ModernLanding() {
  const [userHandle, setUserHandle] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');

  /**
   * Robust helper that tries to extract numeric values from many likely shapes.
   */
  const parseNumber = (v: any): number | undefined => {
    if (v == null) return undefined;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && /^\d+$/.test(v)) return Number(v);
    return undefined;
  };

  const computeTotalSolvedFrom = (obj: any): number | undefined => {
    // Common shapes: array of problems, sets, counts
    if (!obj) return undefined;
    // If it's a count property anywhere:
    const possibleCountKeys = [
      'totalSolved',
      'solvedCount',
      'problemsSolved',
      'solved',
      'count',
    ];
    for (const k of possibleCountKeys) {
      if (k in obj) {
        const v = parseNumber(obj[k]);
        if (typeof v === 'number') return v;
      }
    }

    // If there is an array of solved problems
    const possibleArrayKeys = [
      'solvedProblems',
      'problems',
      'solved',
      'acceptedProblems',
      'solved_list',
    ];
    for (const k of possibleArrayKeys) {
      if (Array.isArray(obj[k])) return obj[k].length;
    }

    // If top-level is an array of problems
    if (Array.isArray(obj)) return obj.length;

    return undefined;
  };

  const fetchUserStats = async (handleOverride?: string) => {
    const handle = (handleOverride ?? userHandle ?? '').trim();
    if (!handle) {
      setUserError('Please enter a Codeforces handle.');
      return;
    }

    setUserLoading(true);
    setUserError('');
    setUserStats(null);

    try {
      const response = await fetch(
        `/api/cf/profile?handle=${encodeURIComponent(handle)}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`User '${handle}' not found (404).`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      }

      const data = await response.json();

      /*
        Possible expected shapes:
        - { stats: { totalSolved, currentRating, maxRating } }
        - { stats: { solvedCount, rating, maxRating } }
        - { totalSolved, rating, maxRating }
        - { solvedProblems: [...], rating: N, bestRating: N }
        - Or some other custom shape returned by your backend proxy

        We'll try many fallbacks in sequence.
      */

      // 1) Prefer data.stats if present
      const statsRoot = data?.stats ?? data;

      // Try to extract totalSolved robustly:
      let totalSolved =
        parseNumber(statsRoot?.totalSolved) ??
        parseNumber(statsRoot?.solvedCount) ??
        parseNumber(data?.totalSolved) ??
        computeTotalSolvedFrom(statsRoot) ??
        computeTotalSolvedFrom(data);

      // Try to extract currentRating (several possible keys)
      let currentRating =
        parseNumber(statsRoot?.currentRating) ??
        parseNumber(statsRoot?.rating) ??
        parseNumber(data?.rating) ??
        parseNumber(data?.currentRating) ??
        parseNumber(statsRoot?.rank /* sometimes rating stored elsewhere */);

      // Try to extract maxRating
      let maxRating =
        parseNumber(statsRoot?.maxRating) ??
        parseNumber(statsRoot?.bestRating) ??
        parseNumber(data?.maxRating) ??
        parseNumber(data?.bestRating);

      // If anything still undefined, try Codeforces-style nested result:
      // e.g., data.result?.[0]?.rating etc.
      if (totalSolved == null && Array.isArray(data?.result)) {
        // try to infer problems solved from result array length if it indicates solved problems
        totalSolved = computeTotalSolvedFrom(data.result);
      }

      if (currentRating == null) {
        // look into result[0] or data.user
        currentRating =
          parseNumber(data?.result?.[0]?.rating) ??
          parseNumber(data?.user?.rating) ??
          currentRating;
      }

      if (maxRating == null) {
        maxRating =
          parseNumber(data?.result?.[0]?.maxRating) ??
          parseNumber(data?.user?.maxRating) ??
          maxRating;
      }

      // Provide safe defaults
      totalSolved = typeof totalSolved === 'number' ? totalSolved : 0;
      currentRating = typeof currentRating === 'number' ? currentRating : 0;
      maxRating =
        typeof maxRating === 'number' ? maxRating : currentRating || 0;

      setUserStats({
        totalSolved,
        currentRating,
        maxRating,
        tagDistribution: statsRoot?.tagDistribution ?? data?.tagDistribution,
      });
    } catch (err) {
      console.error('fetchUserStats error:', err);
      if (err instanceof Error) {
        setUserError(err.message);
      } else {
        setUserError("Couldn't fetch stats — unexpected error.");
      }
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30'>
      {/* --- Background Gradient + Animated Orbs (matching CFLevels) --- */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20'
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.35, 0.25],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className='absolute bottom-1/4 -right-1/4 w-[550px] h-[550px] rounded-full blur-3xl bg-gradient-to-tl from-purple-500/20 to-orange-500/20'
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className='absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-2xl bg-gradient-to-br from-cyan-500/15 to-purple-500/15 -translate-x-1/2 -translate-y-1/2'
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* --- Content --- */}
      <section className='relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 z-10'>
        <div className='max-w-6xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-center mb-12'
          >
            <BannerLanding />
            <div className='flex items-center justify-center gap-2 mt-6 text-muted-foreground/80'>
              <Zap className='h-4 w-4 text-emerald-500' />
              <span className='text-sm font-medium'>
                Track your competitive programming journey
              </span>
            </div>
          </motion.div>

          {/* --- CF Verification --- */}
          <div className='max-w-2xl mx-auto mb-8'>
            <CFVerificationTrigger
              compact
              showTitle={false}
              onVerificationComplete={data => {
                // ensure handle is trimmed and pass explicitly
                const handle = (data?.handle ?? '').trim();
                if (handle) {
                  setUserHandle(handle);
                  fetchUserStats(handle);
                }
              }}
            />
          </div>

          {/* --- Search Input --- */}
          <div className='max-w-2xl mx-auto mb-12'>
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
                  className='h-14 pl-12 text-base bg-transparent border-border/40 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/40 transition-all'
                />
              </div>
              <Button
                onClick={() => fetchUserStats()}
                disabled={userLoading || !userHandle.trim()}
                size='lg'
                className='h-14 px-8 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-emerald-500/20 transition-all'
              >
                {userLoading ? 'Fetching...' : 'Get Stats'}
              </Button>
            </div>
          </div>

          {/* --- Error --- */}
          {userError && (
            <div className='max-w-2xl mx-auto mb-8 bg-red-500/5 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg'>
              {userError}
            </div>
          )}

          {/* --- Stats Display --- */}
          <AnimatePresence mode='wait'>
            {userStats && (
              <motion.div
                key='stats'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className='max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6'
              >
                {[
                  {
                    label: 'Problems Solved',
                    value: userStats.totalSolved,
                    icon: Target,
                    gradient: 'from-emerald-500 to-cyan-500',
                  },
                  {
                    label: 'Current Rating',
                    value: userStats.currentRating,
                    icon: TrendingUp,
                    gradient: 'from-cyan-500 to-purple-500',
                  },
                  {
                    label: 'Max Rating',
                    value: userStats.maxRating,
                    icon: Award,
                    gradient: 'from-purple-500 to-orange-500',
                  },
                ].map(({ label, value, icon: Icon, gradient }) => (
                  <motion.div
                    key={label}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className='p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/40 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all'
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}
                      >
                        <Icon className='h-6 w-6 text-white' />
                      </div>
                      <div
                        className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                      >
                        <AnimatedCounter value={value} />
                      </div>
                    </div>
                    <p className='text-sm text-muted-foreground font-semibold uppercase tracking-wide'>
                      {label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
