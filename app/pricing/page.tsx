'use client';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  InfoIcon,
  CheckCircle2,
  Zap,
  Trophy,
  ArrowRight,
  Flame,
  Skull,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FlipPricingCard } from '@/components/landing/flip-pricing-card';
import { InteractiveToggle } from '@/components/landing/interactive-toggle';

type PricePlan = {
  name: string;
  subtitle?: string;
  amountInr?: number;
  recurring?: 'month' | 'year';
  kind: 'one_time' | 'subscription';
  description?: string;
  gradient?: string;
  level?: string;
  benefits?: string[];
  popular?: boolean;
  ctaLabel?: string;
  cfRatingColor?: string;
  icon?: React.ReactNode;
  cardContent?: {
    topics: string[];
    divProblems: Record<string, number>;
    atcoderProblems: number;
    leetcodeProblems: Record<string, number>;
  };
};

const PLANS: PricePlan[] = [
  {
    name: 'Entry Gate',
    subtitle: 'Newbie → Pupil',
    amountInr: 59,
    kind: 'one_time',
    description:
      'Master the fundamentals. Arrays, STL, Two Pointers, Math basics. Build your foundation.',
    gradient: 'from-gray-400 to-green-500',
    level: 'newbie',
    benefits: [
      '80+ curated problems',
      'Editorial links & detailed tags',
      'Progress tracker',
      'Lifetime access',
    ],
    popular: false,
    ctaLabel: 'Start the Grind',
    cfRatingColor: 'bg-gray-400',
    cardContent: {
      topics: ['Arrays', 'STL Basics', 'Two Pointers', 'Math-1', 'Strings'],
      divProblems: { 'Div2 A': 15, 'Div2 B': 8 },
      atcoderProblems: 12,
      leetcodeProblems: { Easy: 20, Medium: 5 },
    },
  },
  {
    name: 'Core Builder',
    subtitle: 'Pupil → Specialist',
    amountInr: 129,
    kind: 'one_time',
    description:
      'Sorting, Greedy, Binary Search, Hashmaps, Stacks/Queues. Master core CF patterns.',
    gradient: 'from-green-500 to-cyan-400',
    level: 'pupil',
    benefits: [
      '120+ CF/AtCoder mid-level problems',
      'Mini-contests & speed tracking',
      'Editorial solutions',
      'Lifetime access',
    ],
    popular: false,
    ctaLabel: 'Unlock Level 1',
    cfRatingColor: 'bg-green-500',
    cardContent: {
      topics: [
        'Sorting',
        'Greedy',
        'Binary Search',
        'Hashmaps',
        'Stacks/Queues',
      ],
      divProblems: { 'Div2 B': 20, 'Div2 C': 12, 'Div3 A': 8 },
      atcoderProblems: 18,
      leetcodeProblems: { Easy: 15, Medium: 25 },
    },
  },
  {
    name: 'Algorithmic Ascend',
    subtitle: 'Specialist → Expert',
    amountInr: 179,
    kind: 'one_time',
    description:
      'Graphs, Shortest Paths, Intro DP, Number Theory I, Implementation. Stop random problem solving.',
    gradient: 'from-cyan-400 to-blue-500',
    level: 'specialist',
    benefits: [
      '150+ problems with hints',
      'Endurance tracker & leaderboard',
      'Topic mastery analytics',
      'Lifetime access',
    ],
    popular: true,
    ctaLabel: 'Enter the Arena',
    cfRatingColor: 'bg-cyan-400',
    cardContent: {
      topics: ['Graphs', 'Dijkstra', 'BFS/DFS', 'Intro DP', 'Number Theory I'],
      divProblems: { 'Div2 C': 25, 'Div2 D': 15, 'Div3 B': 12 },
      atcoderProblems: 22,
      leetcodeProblems: { Medium: 35, Hard: 8 },
    },
  },
  {
    name: 'Competitive Forge',
    subtitle: 'Expert → Candidate Master',
    amountInr: 279,
    kind: 'one_time',
    description:
      'Advanced DP, Trees, Bitmasking, Combinatorics II, Segment Trees. Feel the pain, love the grind.',
    gradient: 'from-blue-500 to-purple-500',
    level: 'expert',
    benefits: [
      '150+ ICPC/CF Div1 problems',
      'Topic mastery analytics',
      'Private elite forum',
      'Lifetime access',
    ],
    popular: false,
    ctaLabel: 'Enter Div 1',
    cfRatingColor: 'bg-blue-500',
    cardContent: {
      topics: [
        'Advanced DP',
        'Trees',
        'Bitmasking',
        'Combinatorics II',
        'Segment Trees',
      ],
      divProblems: { 'Div2 D': 30, 'Div2 E': 20, 'Div3 C': 15 },
      atcoderProblems: 28,
      leetcodeProblems: { Hard: 25, Medium: 20 },
    },
  },
  {
    name: 'Master Craft',
    subtitle: 'Candidate Master → Master',
    amountInr: 449,
    kind: 'one_time',
    description:
      'Flows, DP on Graphs, Matrix Expo, Lazy Segtrees, Heavy Math. Train like ICPC World Finalists.',
    gradient: 'from-purple-500 to-orange-500',
    level: 'candidate-master',
    benefits: [
      '200+ elite problems',
      'Live analysis & No-Editorial Mode',
      'Private elite forum',
      'Lifetime access',
    ],
    popular: false,
    ctaLabel: 'Bleed Ratings',
    cfRatingColor: 'bg-purple-500',
    cardContent: {
      topics: [
        'Max Flow',
        'DP on Graphs',
        'Matrix Exponentiation',
        'Lazy Segtrees',
        'Heavy Math',
      ],
      divProblems: { 'Div2 E': 35, 'Div2 F': 25, 'Div3 D': 18 },
      atcoderProblems: 32,
      leetcodeProblems: { Hard: 40, Medium: 15 },
    },
  },
];

function sheetCodeFor(name: string): string | undefined {
  const key = name.toLowerCase();
  if (key.includes('entry')) return 'entry-gate';
  if (key.includes('core')) return 'core-builder';
  if (key.includes('algorithmic')) return 'algorithmic-ascend';
  if (key.includes('competitive')) return 'competitive-forge';
  if (key.includes('master')) return 'master-craft';
  return undefined;
}

function bulletsForPlan(p: PricePlan): string[] {
  return p.benefits || [];
}

export default function PricingPage() {
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/razorpay/create-order', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        setPaymentsEnabled(res.ok && data?.enabled);
      } catch {
        if (active) setPaymentsEnabled(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
      {/* Hero Section */}
      <section className='relative overflow-hidden px-6 py-20 md:py-32'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-40 -right-40 h-80 w-80 rounded-full bg-red-500/10 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl' />
        </div>

        <div className='relative mx-auto max-w-4xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className='mb-4 bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 flex w-fit mx-auto'>
              <Flame className='h-3 w-3 mr-2' />
              No Sugar. No Fake Confidence. Just Grind.
            </Badge>
            <h1 className='text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent text-center'>
              Stop Wasting Time.
              <br />
              Start Bleeding Ratings.
            </h1>
            <p className='text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed text-center'>
              For coders who refuse easy wins. For coders who want CM → Master →
              ICPC glory.
              <br />
              <span className='text-red-300 font-bold'>
                Most platforms give you fake dopamine. We give you problems that
                hurt.
              </span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='grid grid-cols-3 gap-4 md:gap-8 mb-12'
          >
            <motion.div className='text-center' whileHover={{ scale: 1.05 }}>
              <motion.div className='text-3xl md:text-4xl font-black text-red-400'>
                5
              </motion.div>
              <div className='text-sm text-slate-400'>Tier Levels</div>
            </motion.div>
            <motion.div className='text-center' whileHover={{ scale: 1.05 }}>
              <div className='text-3xl md:text-4xl font-black text-orange-400'>
                1800+
              </div>
              <div className='text-sm text-slate-400'>Problem Ratings</div>
            </motion.div>
            <motion.div className='text-center' whileHover={{ scale: 1.05 }}>
              <motion.div className='text-3xl md:text-4xl font-black text-yellow-400'>
                ∞
              </motion.div>
              <div className='text-sm text-slate-400'>Lifetime Access</div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='mb-12 p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center'
          >
            <p className='text-lg text-slate-200'>
              Each tier includes{' '}
              <span className='font-bold text-orange-400'>
                curated problem sets
              </span>{' '}
              from Codeforces, AtCoder, and LeetCode.
              <br />
              <span className='text-sm text-slate-400 mt-2 block'>
                Hover on cards to see exactly what you get.
              </span>
            </p>
          </motion.div>

          {paymentsEnabled === false && (
            <Alert className='max-w-2xl mx-auto border-yellow-500/50 bg-yellow-500/10 mb-8'>
              <InfoIcon className='h-4 w-4 text-yellow-500' />
              <AlertDescription className='text-sm text-yellow-200'>
                Payments are currently disabled. Please contact support to
                enable checkout.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </section>

      {/* Pricing Cards with Flip Animation */}
      <section className='px-6 py-20'>
        <div className='mx-auto max-w-7xl'>
          <div className='text-center mb-16'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl md:text-5xl font-black mb-4'
            >
              The Grind Levels
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='text-lg text-slate-400'
            >
              Pick your pain. Pick your growth. Pick your rating climb.{' '}
              <span className='text-slate-300'>
                (Hover to flip and see what's inside)
              </span>
            </motion.p>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {PLANS.map(p => (
              <FlipPricingCard
                key={p.name}
                name={p.name}
                subtitle={p.subtitle}
                amountInr={p.amountInr || 0}
                description={p.description || ''}
                gradient={p.gradient || ''}
                benefits={bulletsForPlan(p)}
                popular={p.popular}
                ctaLabel={p.ctaLabel || 'Get Started'}
                sheetCode={sheetCodeFor(p.name)}
                cardContent={p.cardContent}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Toggle Section */}
      <section className='px-6 py-20 bg-slate-800/30'>
        <div className='mx-auto max-w-4xl'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-4xl font-black text-center mb-12 flex items-center justify-center gap-3'
          >
            <Skull className='h-8 w-8 text-red-400' />
            The Harsh Truth
            <Skull className='h-8 w-8 text-red-400' />
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <InteractiveToggle
              leftOption={{
                title: 'What Others Give You',
                items: [
                  'Easy wins & fake dopamine',
                  'Problems rated 800-1200',
                  'No real competitive edge',
                  'Casual learning paths',
                  'Inflated success metrics',
                ],
                color: 'red',
              }}
              rightOption={{
                title: 'What AlgoRise Gives You',
                items: [
                  'Problems that hurt (1800+)',
                  'Elite problem sets only',
                  'Real rating climbing',
                  'ICPC-level training',
                  'Honest progress tracking',
                ],
                color: 'green',
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='mt-12 p-6 bg-red-500/10 border border-red-500/30 rounded-lg'
          >
            <p className='text-center text-slate-200'>
              <span className='font-bold text-red-300'>Warning:</span> Not for
              casual coders. Only for those who want raw, unfiltered CP grind.
              If you're looking for easy wins, go elsewhere. If you're ready to
              bleed ratings and climb to Master, you're in the right place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className='px-6 py-20'>
        <div className='mx-auto max-w-4xl'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-4xl font-black text-center mb-12'
          >
            What Every Level Includes
          </motion.h2>

          <div className='grid md:grid-cols-2 gap-8'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className='space-y-4'
            >
              <h3 className='text-xl font-bold flex items-center gap-2'>
                <Zap className='h-5 w-5 text-yellow-400' />
                Core Features
              </h3>
              <ul className='space-y-2 text-slate-300'>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Curated problems from CF, AtCoder, ICPC
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Editorial links & detailed tags
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Built-in revision tracker
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Progress analytics & streak tracking
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className='space-y-4'
            >
              <h3 className='text-xl font-bold flex items-center gap-2'>
                <Trophy className='h-5 w-5 text-red-400' />
                Elite Perks
              </h3>
              <ul className='space-y-2 text-slate-300'>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Weekly elite problem sets
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Private forum for elite coders
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Lifetime access & revisions
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  No-Editorial Mode for raw skill building
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className='border-t border-slate-700/50 px-6 py-8 text-center text-sm text-slate-400'>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>
            Secured by Razorpay. 7-day refund guarantee on eligible purchases.
            <br />
            <span className='text-red-300 text-xs'>
              AlgoRise — Brutal Competitive Programming Sheets. Not for
              casual coders.
            </span>
          </p>
        </motion.div>
      </footer>
    </main>
  );
}