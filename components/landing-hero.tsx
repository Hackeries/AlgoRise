'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
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
  Users,
  Zap,
  BarChart3,
  Loader2,
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

const AnimatedCounter: React.FC<{ value: number; duration?: number; suffix?: string }> = ({
  value,
  duration = 1500,
  suffix = '',
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

  return (
    <span>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
};

const TypewriterText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const reduced = useReducedMotion();
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (reduced) {
      setDisplayText(text);
      setShowCursor(false);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text, reduced]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <span className="inline-block w-[3px] h-[1em] bg-primary ml-1 animate-pulse" />
      )}
    </span>
  );
};

const CODE_SNIPPET = `#include <bits/stdc++.h>
using namespace std;

int solve(vector<int>& a, int k) {
    int n = a.size();
    vector<int> dp(n + 1, 0);
    
    for (int i = 1; i <= n; i++) {
        dp[i] = dp[i-1];
        for (int j = 0; j < i; j++) {
            if (a[i-1] - a[j] <= k) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
    }
    return dp[n];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int n, k;
    cin >> n >> k;
    // Accepted ✓
`;

const FloatingCodeAnimation: React.FC = () => {
  const reduced = useReducedMotion();
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = CODE_SNIPPET.split('\n');

  useEffect(() => {
    if (reduced) {
      setVisibleLines(lines.length);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      if (current < lines.length) {
        setVisibleLines(++current);
      } else {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [lines.length, reduced]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="absolute -right-4 top-1/2 -translate-y-1/2 w-80 hidden xl:block"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl" />
        <div className="relative bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-4 font-mono text-xs overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-700/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-zinc-500 text-[10px]">solution.cpp</span>
          </div>
          <div className="h-64 overflow-hidden">
            {lines.slice(0, visibleLines).map((line, i) => (
              <div key={i} className="flex">
                <span className="w-6 text-zinc-600 select-none">{i + 1}</span>
                <span
                  className={
                    line.includes('//') ? 'text-green-400' :
                    line.includes('#include') || line.includes('using') ? 'text-purple-400' :
                    line.includes('int ') || line.includes('vector') ? 'text-blue-400' :
                    line.includes('return') || line.includes('for') || line.includes('if') ? 'text-pink-400' :
                    'text-zinc-300'
                  }
                >
                  {line || ' '}
                </span>
              </div>
            ))}
          </div>
          <motion.div
            className="absolute bottom-4 right-4 flex items-center gap-1.5 text-green-400 text-[10px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: visibleLines >= lines.length ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Runtime: 46ms
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const GridPattern: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div
      className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }}
    />
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
  </div>
);

const PLATFORM_STATS = [
  { label: 'Active Users', value: 15847, icon: Users },
  { label: 'Problems Solved Today', value: 23450, icon: Zap },
  { label: 'User Satisfaction', value: 98.7, icon: BarChart3, suffix: '%', isDecimal: true },
];

const FEATURES_LIST = [
  'Syncs directly with your Codeforces submissions',
  'Difficulty-sorted problem ladders (800 → 2400)',
  'Weak topic detection from contest history',
  'Spaced repetition for unsolved problems',
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
    <div className="relative overflow-hidden bg-background min-h-[90vh] flex items-center">
      <GridPattern />

      <section className="relative z-10 w-full py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <motion.div
                initial={reduced ? {} : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  For Codeforces competitors
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                <TypewriterText text="Stop Random Grinding." className="block" />
                <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Start Strategic Practice.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                AlgoRise syncs with your Codeforces profile to build a personalized training ladder. 
                From 800 to 2400, every problem has a purpose.
              </p>

              <ul className="space-y-3 mb-10">
                {FEATURES_LIST.map((feature, idx) => (
                  <motion.li
                    key={feature}
                    initial={reduced ? {} : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduced ? 0 : 0.3 + idx * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button asChild size="lg" className="h-12 px-8 text-base font-medium bg-indigo-600 hover:bg-indigo-700">
                  <Link href="/train">
                    Start Training Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
                  <Link href="/paths">View Problem Ladders</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-border/50">
                {PLATFORM_STATS.map(({ label, value, icon: Icon, suffix, isDecimal }) => (
                  <motion.div
                    key={label}
                    initial={reduced ? {} : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduced ? 0 : 0.6, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-muted/80">
                      <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold tabular-nums">
                        {isDecimal ? (
                          <>{value}{suffix}</>
                        ) : (
                          <AnimatedCounter value={value} suffix={suffix} />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduced ? 0 : 0.2 }}
              className="relative"
            >
              <FloatingCodeAnimation />

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-60" />
                
                <div className="relative p-6 sm:p-8 rounded-2xl bg-background/80 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <Code2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">Connect Your Profile</h2>
                        <p className="text-sm text-muted-foreground">
                          Import your Codeforces history instantly
                        </p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <CFVerificationTrigger
                        compact
                        showTitle={false}
                        onVerificationComplete={onVerified}
                      />
                    </div>

                    <div className="relative flex items-center gap-4 mb-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground px-2">or preview stats</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="flex gap-2" role="search">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          placeholder="tourist, jiangly, Benq..."
                          value={handleInput}
                          onChange={e => setHandleInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') fetchUserStats();
                          }}
                          aria-label="Codeforces handle"
                          className="h-11 pl-10 text-sm bg-muted/50 border-muted-foreground/20 focus:border-indigo-500 transition-colors"
                          autoComplete="off"
                        />
                      </div>
                      <Button
                        onClick={() => fetchUserStats()}
                        disabled={loading || !handleInput.trim()}
                        className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Lookup'
                        )}
                      </Button>
                    </div>

                    <AnimatePresence mode="wait">
                      {errorMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          role="alert"
                          className="mt-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
                        >
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>{errorMsg}</span>
                        </motion.div>
                      )}

                      {hasStats && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 12 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6"
                        >
                          <div className="grid grid-cols-3 gap-3">
                            {statItems.map(({ key, label, value, Icon }) => (
                              <div
                                key={key}
                                className="relative group p-4 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50 text-center overflow-hidden transition-all hover:border-indigo-500/30"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all" />
                                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-2 relative" />
                                <p className="text-xl font-bold tabular-nums relative">
                                  <AnimatedCounter value={value} />
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1 relative">{label}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-center text-muted-foreground mt-4">
                            Ready to build your personalized training plan?
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
