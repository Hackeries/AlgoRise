'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Zap,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger';
import BannerLanding from './banner-landing';

type UserStats = {
  totalSolved: number;
  currentRating: number;
  maxRating: number;
};

type RawProfileResponse = {
  stats?: any;
  result?: any[];
  user?: any;
  totalSolved?: number;
  solvedCount?: number;
  rating?: number;
  currentRating?: number;
  maxRating?: number;
  bestRating?: number;
};

const FETCH_TTL_MS = 60_000; // 1 minute cache

// ---------- utils ----------
const parseNumber = (v: unknown): number | undefined => {
  if (v == null) return undefined;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && /^[+-]?\d+$/.test(v)) return Number(v);
  return undefined;
};

const computeTotalSolvedFrom = (obj: any): number | undefined => {
  if (!obj) return undefined;

  const countProps = [
    'totalSolved',
    'solvedCount',
    'problemsSolved',
    'solved',
    'count',
  ];
  for (const k of countProps) {
    if (k in obj) {
      const v = parseNumber(obj[k]);
      if (typeof v === 'number') return v;
    }
  }

  const arrayProps = [
    'solvedProblems',
    'problems',
    'solved',
    'acceptedProblems',
    'solved_list',
  ];
  for (const k of arrayProps) {
    if (Array.isArray(obj[k])) return obj[k].length;
  }

  if (Array.isArray(obj)) return obj.length;
  return undefined;
};

const extractStats = (raw: RawProfileResponse): UserStats => {
  const statsRoot = raw?.stats ?? raw;

  let totalSolved =
    parseNumber(statsRoot?.totalSolved) ??
    parseNumber(statsRoot?.solvedCount) ??
    parseNumber(raw?.totalSolved) ??
    computeTotalSolvedFrom(statsRoot) ??
    computeTotalSolvedFrom(raw);

  let currentRating =
    parseNumber(statsRoot?.currentRating) ??
    parseNumber(statsRoot?.rating) ??
    parseNumber(raw?.rating) ??
    parseNumber(raw?.currentRating);

  let maxRating =
    parseNumber(statsRoot?.maxRating) ??
    parseNumber(statsRoot?.bestRating) ??
    parseNumber(raw?.maxRating) ??
    parseNumber(raw?.bestRating);

  if (
    (totalSolved == null || currentRating == null || maxRating == null) &&
    Array.isArray(raw?.result)
  ) {
    const first = raw.result[0];
    if (currentRating == null)
      currentRating = parseNumber(first?.rating) ?? currentRating;
    if (maxRating == null)
      maxRating = parseNumber(first?.maxRating) ?? maxRating;
  }

  if (currentRating == null)
    currentRating = parseNumber(raw?.user?.rating) ?? currentRating;
  if (maxRating == null)
    maxRating = parseNumber(raw?.user?.maxRating) ?? maxRating;

  totalSolved = typeof totalSolved === 'number' ? totalSolved : 0;
  currentRating = typeof currentRating === 'number' ? currentRating : 0;
  maxRating = typeof maxRating === 'number' ? maxRating : currentRating || 0;

  return { totalSolved, currentRating, maxRating };
};

// ---------- small components ----------
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({
  value,
  duration = 1500,
}) => {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return <span>{display.toLocaleString()}</span>;
};

const StatCard: React.FC<{
  label: string;
  value: number;
  Icon: React.ElementType;
  gradient: string;
}> = ({ label, value, Icon, gradient }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    className='group relative p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/40 shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all overflow-hidden'
  >
    {/* Gradient overlay on hover */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradient}`} />
    
    <div className='relative z-10 flex items-center justify-between mb-4'>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
        <Icon className='h-6 w-6 text-white' aria-hidden='true' />
      </div>
      <div
        className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
      >
        <AnimatedCounter value={value} />
      </div>
    </div>
    <p className='relative z-10 text-sm text-muted-foreground font-semibold uppercase tracking-wide'>
      {label}
    </p>
  </motion.div>
);

// ---------- main ----------
export default function LandingHero() {
  const reduced = useReducedMotion();
  const [handleInput, setHandleInput] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const sanitizeHandle = useCallback(
    (raw: string) => raw.trim().replace(/\s+/g, ''),
    []
  );

  const fetchUserStats = useCallback(
    async (override?: string) => {
      const h = sanitizeHandle(override ?? handleInput);
      if (!h) {
        setErrorMsg('Please enter a Codeforces handle.');
        return;
      }

      // Abort previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setErrorMsg('');
      setStats(null);

      const cacheKey = `cf:profile:${h}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as {
            ts: number;
            payload: RawProfileResponse;
          };
          if (Date.now() - parsed.ts < FETCH_TTL_MS) {
            setStats(extractStats(parsed.payload));
            setLoading(false);
            return;
          }
        } catch {
          // ignore cache parse errors
        }
      }

      try {
        const res = await fetch(
          `/api/cf/profile?handle=${encodeURIComponent(h)}`,
          {
            cache: 'no-store',
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          if (res.status === 404) throw new Error(`User '${h}' not found.`);
          throw new Error(`Failed to fetch (HTTP ${res.status})`);
        }
        const data: RawProfileResponse = await res.json();
        const extracted = extractStats(data);
        setStats(extracted);
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ ts: Date.now(), payload: data })
        );
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setErrorMsg(err?.message ?? 'Unexpected error while fetching stats.');
      } finally {
        setLoading(false);
      }
    },
    [handleInput, sanitizeHandle]
  );

  const onVerified = useCallback(
    (data: { handle?: string } | null) => {
      const h = sanitizeHandle(data?.handle ?? '');
      if (h) {
        setHandleInput(h);
        fetchUserStats(h);
      }
    },
    [fetchUserStats, sanitizeHandle]
  );

  const statItems = useMemo(
    () => [
      {
        key: 'totalSolved',
        label: 'Problems Solved',
        value: stats?.totalSolved ?? 0,
        Icon: Target,
        gradient: 'from-emerald-500 to-cyan-500',
      },
      {
        key: 'currentRating',
        label: 'Current Rating',
        value: stats?.currentRating ?? 0,
        Icon: TrendingUp,
        gradient: 'from-cyan-500 to-purple-500',
      },
      {
        key: 'maxRating',
        label: 'Max Rating',
        value: stats?.maxRating ?? 0,
        Icon: Award,
        gradient: 'from-purple-500 to-orange-500',
      },
    ],
    [stats]
  );

  const hasStats = !!stats && !loading && !errorMsg;

  return (
    <div className='relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30'>
      {/* Background orbs (reduced-motion friendly) */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20'
          animate={
            reduced
              ? { opacity: 0.25, scale: 1 }
              : { opacity: [0.25, 0.35, 0.25], scale: [1, 1.15, 1] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden='true'
        />
        <motion.div
          className='absolute bottom-1/4 -right-1/4 w-[550px] h-[550px] rounded-full blur-3xl bg-gradient-to-br from-purple-500/20 to-orange-500/20'
          animate={
            reduced
              ? { opacity: 0.25 }
              : { opacity: [0.2, 0.3, 0.2], scale: [1, 1.25, 1] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden='true'
        />
        <motion.div
          className='absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-2xl bg-gradient-to-br from-cyan-500/15 to-purple-500/15 -translate-x-1/2 -translate-y-1/2'
          animate={
            reduced
              ? { scale: 1 }
              : { rotate: [0, 180, 360], scale: [1, 1.1, 1] }
          }
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          aria-hidden='true'
        />
      </div>

      {/* Content */}
      <section className='relative z-10 pt-16 pb-24 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-6xl mx-auto'>
          {/* Hero heading */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-10'
          >
            <Suspense fallback={<div className='h-24' />}>
              <BannerLanding />
            </Suspense>
            <div className='mt-6 flex items-center justify-center gap-2 text-muted-foreground/80'>
              <Zap className='h-4 w-4 text-emerald-500' aria-hidden='true' />
              <span className='text-sm font-medium'>
                Track your competitive programming journey
              </span>
            </div>
          </motion.div>

          {/* CF Verification */}
          <div className='max-w-2xl mx-auto mb-8'>
            <CFVerificationTrigger
              compact
              showTitle={false}
              onVerificationComplete={onVerified}
            />
          </div>

          {/* Handle input + CTA */}
          <div className='max-w-2xl mx-auto mb-12' role='search'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='relative flex-1'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none'>
                  <Search
                    className='h-5 w-5 text-muted-foreground/60'
                    aria-hidden='true'
                  />
                </div>
                <Input
                  placeholder='Enter Codeforces handle...'
                  value={handleInput}
                  onChange={e => setHandleInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') fetchUserStats();
                  }}
                  aria-label='Codeforces handle'
                  className='h-14 pl-12 text-base bg-transparent border-border/40 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/40 transition-all'
                  autoComplete='off'
                  inputMode='text'
                />
              </div>
              <Button
                onClick={() => fetchUserStats()}
                disabled={loading || !handleInput.trim()}
                size='lg'
                className='h-14 px-8 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform hover:scale-105'
                aria-label='Fetch Codeforces stats'
              >
                {loading ? 'Fetching...' : 'Get Stats'}
              </Button>
            </div>
            <p className='text-xs mt-2 text-muted-foreground'>
              Press Enter or click Get Stats. Recent results are cached for 1
              minute.
            </p>
          </div>

          {/* Errors */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              role='alert'
              aria-live='assertive'
              className='max-w-2xl mx-auto mb-8 bg-red-500/5 border border-red-500/30 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2'
            >
              <AlertCircle className='h-5 w-5 mt-0.5' aria-hidden='true' />
              <span className='text-sm font-medium'>{errorMsg}</span>
            </motion.div>
          )}

          {/* Stats */}
          {hasStats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              aria-live='polite'
              className='max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6'
            >
              {statItems.map(({ key, label, value, Icon, gradient }) => (
                <StatCard
                  key={key}
                  label={label}
                  value={value}
                  Icon={Icon}
                  gradient={gradient}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
