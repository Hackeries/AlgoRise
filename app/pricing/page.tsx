'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  InfoIcon,
  CheckCircle2,
  Zap,
  Trophy,
  Flame,
  Skull,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
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
    amountInr: 49,
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
      divProblems: { 'Div2 A': 45, 'Div3 B': 28, 'Div3 C': 20 },
      atcoderProblems: 32,
      leetcodeProblems: { Easy: 30, Medium: 15 },
    },
  },
  {
    name: 'Core Builder',
    subtitle: 'Pupil → Specialist',
    amountInr: 99,
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
      divProblems: { 'Div2 B': 40, 'Div2 C': 42, 'Div3 D': 32 },
      atcoderProblems: 38,
      leetcodeProblems: { Easy: 35, Medium: 55 },
    },
  },
  {
    name: 'Algorithmic Ascend',
    subtitle: 'Specialist → Expert',
    amountInr: 169,
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
      divProblems: { 'Div2 C': 65, 'Div2 D': 25, 'Div3 E': 22 },
      atcoderProblems: 42,
      leetcodeProblems: { Medium: 35, Hard: 40 },
    },
  },
  {
    name: 'Competitive Forge',
    subtitle: 'Expert → Candidate Master',
    amountInr: 259,
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
      divProblems: { 'Div2 D': 60, 'Div2 E': 45, 'Div3 C': 35 },
      atcoderProblems: 48,
      leetcodeProblems: { Hard: 45, Medium: 30 },
    },
  },
  {
    name: 'Master Craft',
    subtitle: 'Candidate Master → Master',
    amountInr: 419,
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
      divProblems: { 'Div2 E': 55, 'Div2 F': 45, 'Div3 D': 38 },
      atcoderProblems: 52,
      leetcodeProblems: { Hard: 40, Medium: 35 },
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
    <main className='min-h-screen bg-gradient-to-br from-background via-muted/20 to-background'>
      {/* Animated Background Orbs */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl'
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className='absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl'
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className='relative overflow-hidden px-4 sm:px-6 py-20 md:py-32'>
        <div className='relative mx-auto max-w-6xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center'
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6'
            >
              <Flame className='h-4 w-4 text-primary' />
              <span className='text-sm font-medium text-primary'>
                Elite Competitive Programming Training
              </span>
            </motion.div>

            <h1 className='text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent'>
              Stop Wasting Time.
              <br />
              Start Climbing Ratings.
            </h1>

            <p className='text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed'>
              For coders who refuse easy wins. For coders who want CM → Master →
              ICPC glory.
              <br />
              <span className='text-primary font-semibold'>
                Most platforms give you fake dopamine. We give you problems that
                build champions.
              </span>
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='grid grid-cols-3 gap-4 md:gap-8 mb-12 max-w-3xl mx-auto'
          >
            {[
              { number: '5', label: 'Tier Levels', icon: Target },
              { number: '1800+', label: 'Problem Ratings', icon: TrendingUp },
              { number: '∞', label: 'Lifetime Access', icon: Sparkles },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className='relative p-4 sm:p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all group'
              >
                <stat.icon className='h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2' />
                <div className='text-2xl sm:text-4xl font-bold text-primary'>
                  {stat.number}
                </div>
                <div className='text-xs sm:text-sm text-muted-foreground mt-1'>
                  {stat.label}
                </div>
                <div className='absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10' />
              </motion.div>
            ))}
          </motion.div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='mb-12 p-6 sm:p-8 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl max-w-3xl mx-auto'
          >
            <p className='text-base sm:text-lg text-foreground text-center'>
              Each tier includes{' '}
              <span className='font-bold text-primary'>
                curated problem sets
              </span>{' '}
              from Codeforces, AtCoder, and LeetCode.
              <br />
              <span className='text-sm text-muted-foreground mt-2 block'>
                💡 Hover on cards to see exactly what you get.
              </span>
            </p>
          </motion.div>

          {/* Payment Status Alert */}
          {paymentsEnabled === false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='max-w-2xl mx-auto'
            >
              <Alert className='border-yellow-500/50 bg-yellow-500/10'>
                <InfoIcon className='h-4 w-4 text-yellow-500' />
                <AlertDescription className='text-sm text-yellow-200'>
                  Payments are currently disabled. Please contact support to
                  enable checkout.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className='px-4 sm:px-6 py-20'>
        <div className='mx-auto max-w-7xl'>
          <div className='text-center mb-16'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6'
            >
              <Trophy className='h-4 w-4 text-primary' />
              <span className='text-sm font-medium text-primary'>
                Choose Your Path
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4'
            >
              The Grind Levels
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='text-lg text-muted-foreground max-w-2xl mx-auto'
            >
              Pick your pain. Pick your growth. Pick your rating climb.{' '}
              <span className='text-foreground font-medium'>
                (Hover to flip and see what's inside)
              </span>
            </motion.p>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {PLANS.map((p, idx) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1,
                  ease: [0.16, 1, 0.3, 1] as any,
                }}
              >
                <FlipPricingCard
                  name={p.name}
                  subtitle={p.subtitle}
                  amountInr={p.amountInr || 0}
                  description={p.description || ''}
                  gradient={p.gradient || ''}
                  benefits={p.benefits || []}
                  popular={p.popular}
                  ctaLabel={p.ctaLabel || 'Get Started'}
                  sheetCode={sheetCodeFor(p.name)}
                  cardContent={p.cardContent}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Toggle */}
      <section className='px-4 sm:px-6 py-20 bg-muted/30'>
        <div className='mx-auto max-w-4xl'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='text-3xl sm:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3'
          >
            <Skull className='h-7 w-7 sm:h-8 sm:w-8 text-primary' />
            The Harsh Truth
            <Skull className='h-7 w-7 sm:h-8 sm:w-8 text-primary' />
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='mt-12 p-6 bg-primary/10 border border-primary/30 rounded-2xl backdrop-blur-sm'
          >
            <p className='text-center text-foreground'>
              <span className='font-bold text-primary'>Warning:</span> Not for
              casual coders. Only for those who want raw, unfiltered CP grind.
              If you're looking for easy wins, go elsewhere. If you're ready to
              climb to Master, you're in the right place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className='px-4 sm:px-6 py-20'>
        <div className='mx-auto max-w-5xl'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='text-3xl sm:text-4xl font-bold text-center mb-16'
          >
            What Every Level Includes
          </motion.h2>

          <div className='grid md:grid-cols-2 gap-8 lg:gap-12'>
            {[
              {
                icon: Zap,
                title: 'Core Features',
                items: [
                  'Curated problems from CF, AtCoder, ICPC',
                  'Editorial links & detailed tags',
                  'Built-in revision tracker',
                  'Progress analytics & streak tracking',
                ],
                delay: 0,
              },
              {
                icon: Trophy,
                title: 'Elite Perks',
                items: [
                  'Weekly elite problem sets',
                  'Private forum for elite coders',
                  'Lifetime access & revisions',
                  'No-Editorial Mode for raw skill building',
                ],
                delay: 0.2,
              },
            ].map(section => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: section.delay === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: section.delay }}
                className='space-y-4 p-6 sm:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all'
              >
                <div className='flex items-center gap-3'>
                  <div className='p-3 rounded-xl bg-primary/10'>
                    <section.icon className='h-6 w-6 text-primary' />
                  </div>
                  <h3 className='text-xl font-bold'>{section.title}</h3>
                </div>
                <ul className='space-y-3'>
                  {section.items.map(item => (
                    <li key={item} className='flex items-start gap-3'>
                      <CheckCircle2 className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
                      <span className='text-muted-foreground'>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-border/50 px-4 sm:px-6 py-12 text-center'>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='max-w-2xl mx-auto space-y-4'
        >
          <p className='text-sm text-muted-foreground'>
            Secured by Razorpay. 7-day refund guarantee on eligible purchases.
          </p>
          <p className='text-xs text-primary font-medium'>
            AlgoRise — Elite Competitive Programming Training. Built for
            champions.
          </p>
        </motion.div>
      </footer>
    </main>
  );
}
