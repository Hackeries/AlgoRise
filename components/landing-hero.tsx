'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
  ArrowRight,
  Code2,
  Sparkles,
  Users,
  BookOpen,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger';
import Link from 'next/link';

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

const FETCH_TTL_MS = 60_000;

const parseNumber = (v: unknown): number | undefined => {
  if (v == null) return undefined;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && /^[+-]?\d+$/.test(v)) return Number(v);
  return undefined;
};

const computeTotalSolvedFrom = (obj: any): number | undefined => {
  if (!obj) return undefined;

  const countProps = ['totalSolved', 'solvedCount', 'problemsSolved', 'solved', 'count'];
  for (const k of countProps) {
    if (k in obj) {
      const v = parseNumber(obj[k]);
      if (typeof v === 'number') return v;
    }
  }

  const arrayProps = ['solvedProblems', 'problems', 'solved', 'acceptedProblems', 'solved_list'];
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
    if (currentRating == null) currentRating = parseNumber(first?.rating) ?? currentRating;
    if (maxRating == null) maxRating = parseNumber(first?.maxRating) ?? maxRating;
  }

  if (currentRating == null) currentRating = parseNumber(raw?.user?.rating) ?? currentRating;
  if (maxRating == null) maxRating = parseNumber(raw?.user?.maxRating) ?? maxRating;

  totalSolved = typeof totalSolved === 'number' ? totalSolved : 0;
  currentRating = typeof currentRating === 'number' ? currentRating : 0;
  maxRating = typeof maxRating === 'number' ? maxRating : currentRating || 0;

  return { totalSolved, currentRating, maxRating };
};

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

const PLATFORM_STATS = [
  { label: 'Active Users', value: '20K+', icon: Users },
  { label: 'Practice Problems', value: '20K+', icon: BookOpen },
  { label: 'Learning Paths', value: '50+', icon: Target },
];

const FEATURES_LIST = [
  'Adaptive problem recommendations',
  'Real-time contest analytics',
  'Personalized learning paths',
  'Progress tracking & insights',
];

export default function LandingHero() {
  const reduced = useReducedMotion();
  const [handleInput, setHandleInput] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const sanitizeHandle = useCallback((raw: string) => raw.trim().replace(/\s+/g, ''), []);

  const fetchUserStats = useCallback(
    async (override?: string) => {
      const h = sanitizeHandle(override ?? handleInput);
      if (!h) {
        setErrorMsg('Please enter a Codeforces handle.');
        return;
      }

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
          const parsed = JSON.parse(cached) as { ts: number; payload: RawProfileResponse };
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
        const res = await fetch(`/api/cf/profile?handle=${encodeURIComponent(h)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) {
          if (res.status === 404) throw new Error(`User '${h}' not found.`);
          throw new Error(`Failed to fetch (HTTP ${res.status})`);
        }
        const data: RawProfileResponse = await res.json();
        const extracted = extractStats(data);
        setStats(extracted);
        sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), payload: data }));
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
      { key: 'totalSolved', label: 'Problems Solved', value: stats?.totalSolved ?? 0, Icon: Target },
      { key: 'currentRating', label: 'Current Rating', value: stats?.currentRating ?? 0, Icon: TrendingUp },
      { key: 'maxRating', label: 'Max Rating', value: stats?.maxRating ?? 0, Icon: Award },
    ],
    [stats]
  );

  const hasStats = !!stats && !loading && !errorMsg;

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"
        aria-hidden="true"
      />

      {/* Content */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Level up your CP skills
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Master{' '}
                <span className="text-gradient-brand">
                  Competitive Programming
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                Practice that adapts to your level. Compete in real-time contests.
                Track your progress with AI-powered analytics.
              </p>

              {/* Feature list */}
              <ul className="space-y-3 mb-8">
                {FEATURES_LIST.map((feature, idx) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button asChild size="lg" className="h-12 px-8 text-base font-medium">
                  <Link href="/train">
                    Start Training Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
                  <Link href="/paths">Explore Learning Paths</Link>
                </Button>
              </div>

              {/* Platform Stats */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border">
                {PLATFORM_STATS.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - CF Handle Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-lg">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Code2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Sync Your Progress</h2>
                    <p className="text-sm text-muted-foreground">
                      Connect your Codeforces profile
                    </p>
                  </div>
                </div>

                {/* CF Verification */}
                <div className="mb-4">
                  <CFVerificationTrigger
                    compact
                    showTitle={false}
                    onVerificationComplete={onVerified}
                  />
                </div>

                {/* Handle Input */}
                <div className="flex gap-2" role="search">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      placeholder="Enter Codeforces handle"
                      value={handleInput}
                      onChange={e => setHandleInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') fetchUserStats();
                      }}
                      aria-label="Codeforces handle"
                      className="h-11 pl-10 text-sm"
                      autoComplete="off"
                    />
                  </div>
                  <Button
                    onClick={() => fetchUserStats()}
                    disabled={loading || !handleInput.trim()}
                    className="h-11 px-6"
                  >
                    {loading ? 'Loading...' : 'Sync'}
                  </Button>
                </div>

                {/* Error */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    role="alert"
                    className="mt-4 flex items-center gap-2 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* User Stats */}
                {hasStats && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 grid grid-cols-3 gap-4"
                  >
                    {statItems.map(({ key, label, value, Icon }) => (
                      <div
                        key={key}
                        className="p-4 rounded-xl bg-muted/50 border border-border text-center"
                      >
                        <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="text-xl font-bold">
                          <AnimatedCounter value={value} />
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{label}</p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" aria-hidden="true" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" aria-hidden="true" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
