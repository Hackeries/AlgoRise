'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Zap,
  Trophy,
  Target,
  Crown,
  type LucideIcon,
} from 'lucide-react';

type Level = {
  from: string;
  to: string;
  topics: string[];
  // Tailwind gradient stops; e.g. "from-emerald-500 to-cyan-500"
  gradientStops: string;
  // Tailwind gradient stops for soft background; e.g. "from-emerald-500/20 to-cyan-500/20"
  bgStops: string;
  icon: LucideIcon;
  iconColor: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

const levels: Level[] = [
  {
    from: 'Newbie',
    to: 'Pupil',
    topics: [
      'Basics of C++ / STL',
      'Input & Output',
      'Math Fundamentals',
      'Arrays / Strings',
      'Two Pointers',
      'Prefix Sum',
      'Simulation',
    ],
    gradientStops: 'from-slate-500 to-emerald-500',
    bgStops: 'from-slate-500/20 to-emerald-500/20',
    icon: Target,
    iconColor: 'text-emerald-500',
  },
  {
    from: 'Pupil',
    to: 'Specialist',
    topics: [
      'Sorting & Greedy',
      'Binary Search',
      'Hash Maps / Sets',
      'Stacks & Queues',
      'Brute Force Patterns',
      'Sliding Window',
    ],
    gradientStops: 'from-emerald-500 to-cyan-500',
    bgStops: 'from-emerald-500/20 to-cyan-500/20',
    icon: Zap,
    iconColor: 'text-cyan-500',
  },
  {
    from: 'Specialist',
    to: 'Expert',
    topics: [
      'Graph Basics (BFS/DFS)',
      'Connected Components',
      'Shortest Paths (Dijkstra)',
      'Intro Dynamic Programming',
      'Prefix/Suffix Optimizations',
      'Number Theory – GCD, Primes, Mod',
    ],
    gradientStops: 'from-cyan-500 to-purple-500',
    bgStops: 'from-cyan-500/20 to-purple-500/20',
    icon: Trophy,
    iconColor: 'text-purple-500',
  },
  {
    from: 'Expert',
    to: 'Candidate Master',
    topics: [
      'Advanced Dynamic Programming',
      'Combinatorics',
      'Trees / LCA',
      'Bitmask DP',
      'Segment Trees / Fenwick Tree',
      'Mathematics II (Inverses, CRT)',
      'Complex Problems & CF Patterns',
    ],
    gradientStops: 'from-purple-500 to-orange-500',
    bgStops: 'from-purple-500/20 to-orange-500/20',
    icon: Crown,
    iconColor: 'text-orange-500',
  },
];

export default function CFLevels() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-labelledby='cf-levels-heading'
      className='relative py-20 sm:py-24 lg:py-32 overflow-hidden bg-linear-to-br from-background via-background to-muted/30'
    >
      {/* Animated gradient orbs */}
      <div
        className='absolute inset-0 overflow-hidden pointer-events-none'
        aria-hidden='true'
      >
        <motion.div
          className='absolute top-1/4 -left-1/4 w-96 h-96 bg-linear-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl'
          animate={
            reduced
              ? { opacity: 0.25, scale: 1 }
              : { opacity: [0.3, 0.2, 0.3], scale: [1, 1.2, 1] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className='absolute bottom-1/4 -right-1/4 w-96 h-96 bg-linear-to-tl from-purple-500/20 to-orange-500/20 rounded-full blur-3xl'
          animate={
            reduced
              ? { opacity: 0.25, scale: 1 }
              : { opacity: [0.2, 0.3, 0.2], scale: [1, 1.3, 1] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className='text-center mb-16 sm:mb-20'
        >
          <h2
            id='cf-levels-heading'
            className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-4'
          >
            <span className='bg-linear-to-r from-emerald-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent'>
              Codeforces Level-Up Roadmap
            </span>
          </h2>

          <p className='text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
            Follow the proven roadmap from{' '}
            <span className='font-bold font-mono text-foreground px-2 py-0.5 rounded bg-muted'>
              Newbie
            </span>{' '}
            <ArrowRight
              className='inline h-4 w-4 mx-1 align-text-bottom'
              aria-hidden='true'
            />{' '}
            <span className='font-bold font-mono bg-linear-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent px-2 py-0.5'>
              Candidate Master
            </span>
            . Master one level at a time with curated topics and algorithms.
          </p>
        </motion.div>

        {/* Levels Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:gap-8'>
          {levels.map((lvl, index) => (
            <motion.div
              key={`${lvl.from}-${lvl.to}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: EASE }}
              className='group'
            >
              <motion.div
                whileHover={reduced ? undefined : { y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: EASE }}
                className='h-full p-6 sm:p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden'
              >
                {/* Gradient background on hover */}
                <motion.div
                  className={`absolute inset-0 bg-linear-to-br ${lvl.bgStops} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
                />

                <CardHeader className='p-0 mb-6'>
                  <div className='flex items-start justify-between mb-4'>
                    {/* Icon */}
                    <motion.div
                      whileHover={
                        reduced ? undefined : { rotate: 360, scale: 1.1 }
                      }
                      transition={{ duration: 0.6, ease: EASE }}
                      className={`p-3 rounded-xl bg-linear-to-br ${lvl.bgStops} border border-primary/20`}
                    >
                      <lvl.icon
                        className={`h-6 w-6 ${lvl.iconColor}`}
                        aria-hidden='true'
                      />
                    </motion.div>

                    {/* Badge */}
                    <Badge
                      className={`bg-linear-to-r ${lvl.gradientStops} text-white shadow-lg px-3 py-1`}
                    >
                      {lvl.from} → {lvl.to}
                    </Badge>
                  </div>

                  <CardTitle className='text-xl sm:text-2xl font-bold'>
                    <span className='text-foreground'>{lvl.from}</span>
                    <ArrowRight
                      className='inline h-5 w-5 mx-2 text-muted-foreground align-text-bottom'
                      aria-hidden='true'
                    />
                    <span
                      className={`bg-linear-to-r ${lvl.gradientStops} bg-clip-text text-transparent`}
                    >
                      {lvl.to}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className='p-0'>
                  <ul
                    className='flex flex-wrap gap-2'
                    aria-label={`${lvl.from} to ${lvl.to} key topics`}
                  >
                    {lvl.topics.map((topic, idx) => (
                      <motion.li
                        key={`${lvl.to}-${topic}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.03, ease: EASE }}
                        className='rounded-full px-3 py-1.5 bg-muted/80 backdrop-blur-sm text-foreground text-xs sm:text-sm hover:bg-muted transition-colors cursor-default border border-border/50'
                      >
                        {topic}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>

                {/* Hover indicator */}
                <motion.div
                  className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'
                  whileHover={reduced ? undefined : { x: 5 }}
                >
                  <ArrowRight
                    className={`h-5 w-5 ${lvl.iconColor}`}
                    aria-hidden='true'
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          className='mt-16 flex flex-col sm:flex-row gap-4 justify-center'
        >
          <Link href='/pricing' aria-label='Get Level-Up Sheets'>
            <motion.div
              whileHover={reduced ? undefined : { scale: 1.05 }}
              whileTap={reduced ? undefined : { scale: 0.95 }}
            >
              <Button className='w-full sm:w-auto bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all px-8 py-6 text-base'>
                Get Level-Up Sheets
                <ArrowRight className='ml-2 h-5 w-5' aria-hidden='true' />
              </Button>
            </motion.div>
          </Link>
          <Link href='/adaptive-sheet' aria-label='Start Adaptive Practice'>
            <motion.div
              whileHover={reduced ? undefined : { scale: 1.05 }}
              whileTap={reduced ? undefined : { scale: 0.95 }}
            >
              <Button
                variant='outline'
                className='w-full sm:w-auto border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted transition-colors px-8 py-6 text-base'
              >
                Start Adaptive Practice
                <Zap className='ml-2 h-5 w-5' aria-hidden='true' />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
