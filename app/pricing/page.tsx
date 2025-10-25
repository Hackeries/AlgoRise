'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  TrendingUp,
  Sparkles,
  Flame,
  CheckCircle2,
  InfoIcon,
  Skull,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type PricePlan = {
  name: string;
  subtitle?: string;
  amountInr?: number;
  description?: string;
  gradient?: string;
  level?: string;
  benefits?: string[];
  popular?: boolean;
  ctaLabel?: string;
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
    description:
      'Master the fundamentals. Arrays, STL, Two Pointers, Math basics. Build your foundation.',
    gradient: 'from-gray-400 to-green-500',
    benefits: [
      '80+ curated problems',
      'Editorial links & detailed tags',
      'Progress tracker',
      'Lifetime access',
    ],
    ctaLabel: 'Start the Grind',
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
    description:
      'Sorting, Greedy, Binary Search, Hashmaps, Stacks/Queues. Master core CF patterns.',
    gradient: 'from-green-500 to-cyan-400',
    benefits: [
      '120+ CF/AtCoder mid-level problems',
      'Mini-contests & speed tracking',
      'Editorial solutions',
      'Lifetime access',
    ],
    ctaLabel: 'Unlock Level 1',
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
    description:
      'Graphs, Shortest Paths, Intro DP, Number Theory I, Implementation. Stop random problem solving.',
    gradient: 'from-cyan-400 to-blue-500',
    benefits: [
      '150+ problems with hints',
      'Endurance tracker & leaderboard',
      'Topic mastery analytics',
      'Lifetime access',
    ],
    popular: true,
    ctaLabel: 'Enter the Arena',
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
    description:
      'Advanced DP, Trees, Bitmasking, Combinatorics II, Segment Trees. Feel the pain, love the grind.',
    gradient: 'from-blue-500 to-purple-500',
    benefits: [
      '150+ ICPC/CF Div1 problems',
      'Topic mastery analytics',
      'Private elite forum',
      'Lifetime access',
    ],
    ctaLabel: 'Enter Div 1',
  },
  {
    name: 'Master Craft',
    subtitle: 'Candidate Master → Master',
    amountInr: 419,
    description:
      'Flows, DP on Graphs, Matrix Expo, Lazy Segtrees, Heavy Math. Train like ICPC World Finalists.',
    gradient: 'from-purple-500 to-orange-500',
    benefits: [
      '200+ elite problems',
      'Live analysis & No-Editorial Mode',
      'Private elite forum',
      'Lifetime access',
    ],
    ctaLabel: 'Bleed Ratings',
  },
];

// Core pricing card
function PricingCard({
  name,
  subtitle,
  amountInr,
  description,
  benefits,
  gradient,
  popular,
  ctaLabel,
}: PricePlan) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col justify-between bg-card/70 border border-border/60 
      rounded-3xl shadow-lg p-8 min-h-[480px] overflow-hidden 
      hover:border-primary/70 hover:shadow-primary/30 transition-all`}
    >
      {popular && (
        <div className='absolute top-0 right-0 px-4 py-1 bg-primary text-white text-xs rounded-bl-2xl rounded-tr-3xl'>
          Most Popular
        </div>
      )}

      <div>
        <h3 className='text-2xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-primary to-purple-400'>
          {name}
        </h3>
        <p className='text-sm text-muted-foreground mb-4'>{subtitle}</p>
        <p className='text-muted-foreground text-sm mb-4 leading-relaxed'>
          {description}
        </p>
        <div className='text-4xl font-bold text-primary mb-4'>
          ₹{amountInr}
          <span className='text-lg font-medium text-muted-foreground'>
            /once
          </span>
        </div>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          {benefits?.map(b => (
            <li key={b} className='flex items-start gap-2'>
              <CheckCircle2 className='text-primary h-4 w-4 mt-1' />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <button
        className={`mt-8 py-3 rounded-lg text-white font-semibold w-full bg-gradient-to-r ${gradient} 
        hover:opacity-90 transition shadow-md shadow-primary/20`}
      >
        {ctaLabel}
      </button>
    </motion.div>
  );
}

export default function PricingPage() {
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/razorpay/create-order');
        const data = await res.json();
        setPaymentsEnabled(res.ok && data?.enabled);
      } catch {
        setPaymentsEnabled(false);
      }
    })();
  }, []);

  return (
    <main className='min-h-screen bg-gradient-to-br from-background via-muted/20 to-background'>
      {/* Hero */}
      <section className='text-center py-20'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6'>
            <Flame className='w-4 h-4 text-primary' />
            <span className='text-sm font-medium text-primary'>
              Elite Competitive Programming Training
            </span>
          </div>

          <h1 className='text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-orange-500 mb-4'>
            Stop Wasting Time. Start Climbing.
          </h1>
          <p className='text-lg text-muted-foreground max-w-3xl mx-auto'>
            Get battle-tested training and problem sets that push you from Pupil
            to Master. Each course includes lifetime access, analytics, and
            elite-level practice.
          </p>
        </motion.div>
      </section>

      {/* Payment Disabled Alert */}
      {paymentsEnabled === false && (
        <div className='max-w-2xl mx-auto'>
          <Alert className='border-yellow-500/50 bg-yellow-500/10'>
            <InfoIcon className='h-4 w-4 text-yellow-500' />
            <AlertDescription className='text-sm text-yellow-300'>
              Payments are currently disabled. Contact support to enable
              checkout.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Pricing Sections */}
      <section className='px-4 sm:px-6 py-20'>
        <div className='max-w-7xl mx-auto text-center mb-12'>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-3xl sm:text-4xl font-bold mb-4'
          >
            Choose Your Path
          </motion.h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Each tier is a complete roadmap with problems from CF, AtCoder, and
            LeetCode. Pick your level and begin your climb.
          </p>
        </div>

        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-stretch'>
          {PLANS.map((plan, i) => (
            <PricingCard key={i} {...plan} />
          ))}
        </div>
      </section>

      {/* Global Features */}
      <section className='px-6 py-20 bg-muted/30'>
        <div className='max-w-5xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-12'>What Every Plan Includes</h2>
          <div className='grid md:grid-cols-2 gap-8 text-left'>
            {[
              {
                icon: Zap,
                title: 'Core Features',
                items: [
                  'Curated problems from CF, AtCoder, ICPC',
                  'Editorial links & tags',
                  'Revision tracker & progress analytics',
                  'Lifetime access',
                ],
              },
              {
                icon: Skull,
                title: 'Elite Perks',
                items: [
                  'Weekly elite problems',
                  'Private discussion board',
                  'Performance tracking',
                  'Skill‑based leaderboards',
                ],
              },
            ].map(section => (
              <motion.div
                key={section.title}
                whileHover={{ scale: 1.02 }}
                className='p-8 rounded-2xl bg-card/60 border border-border/40 hover:border-primary/50 backdrop-blur-sm transition-all'
              >
                <div className='flex items-center gap-3 mb-4'>
                  <section.icon className='h-6 w-6 text-primary' />
                  <h3 className='text-xl font-semibold'>{section.title}</h3>
                </div>
                <ul className='space-y-2 text-sm text-muted-foreground'>
                  {section.items.map(item => (
                    <li key={item} className='flex items-start gap-2'>
                      <CheckCircle2 className='h-4 w-4 mt-1 text-primary' />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-border/50 py-10 text-center text-sm text-muted-foreground'>
        <p>Secured by Razorpay · 7‑day refund policy on eligible purchases</p>
        <p className='text-primary mt-1'>
          AlgoRise — Elite Competitive Programming Training
        </p>
      </footer>
    </main>
  );
}
