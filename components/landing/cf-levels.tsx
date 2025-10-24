'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const levels = [
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
    gradient: 'from-gray-500 to-gray-700',
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
    gradient: 'from-green-400 to-green-600',
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
    gradient: 'from-blue-500 to-sky-500',
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
    gradient: 'from-pink-500 to-purple-500',
  },
];

export default function CFLevels() {
  return (
    <section className='relative z-10 py-24 px-4 overflow-hidden'>
      {/* Animated background blobs */}
      <div className='absolute top-[-100px] left-[-150px] w-[350px] h-[350px] bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob' />
      <div className='absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-cyan-400/20 dark:bg-cyan-400/10 rounded-full blur-3xl animate-blob animation-delay-2000' />

      <div className='max-w-6xl mx-auto relative'>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent'>
              Codeforces Level-Up Roadmap
            </span>
          </h2>
          <p className='text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed'>
            Follow the proven roadmap from{' '}
            <span className='font-bold font-mono bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-400 dark:to-gray-300 bg-clip-text text-transparent'>
              Newbie
            </span>{' '}
            <span className='font-bold font-mono text-slate-700 dark:text-white'>
              →
            </span>{' '}
            <span className='font-bold font-mono bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent'>
              Candidate Master
            </span>
            . Master one level at a time with curated topics, key data
            structures, and essential algorithms.
          </p>
        </motion.div>

        {/* Levels Grid */}
        <div className='grid gap-8 md:grid-cols-2'>
          {levels.map((lvl, index) => (
            <motion.div
              key={lvl.to}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                type: 'spring',
                stiffness: 120,
              }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                className='bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:border-primary/50'
              >
                <CardHeader className='p-0 mb-4'>
                  <CardTitle className='flex items-center justify-between text-slate-800 dark:text-white'>
                    <span className='font-semibold'>
                      {lvl.from} →{' '}
                      <span className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-primary dark:from-white dark:to-primary'>
                        {lvl.to}
                      </span>
                    </span>
                    <Badge
                      className={`bg-gradient-to-r ${lvl.gradient} text-white shadow-md`}
                    >
                      {lvl.from} → {lvl.to}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className='p-0'>
                  <div className='flex flex-wrap gap-2'>
                    {lvl.topics.map(t => (
                      <span
                        key={t}
                        className='rounded-full px-3 py-1 bg-gray-200 dark:bg-white/10 text-slate-700 dark:text-white/80 text-sm backdrop-blur-sm hover:bg-gray-300 dark:hover:bg-white/20 transition-colors'
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className='mt-12 flex flex-col sm:flex-row gap-4 justify-center'>
          <Link href='/pricing'>
            <Button className='w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all'>
              Get Level-Up Sheets
            </Button>
          </Link>
          <Link href='/adaptive-sheet'>
            <Button
              variant='secondary'
              className='w-full sm:w-auto bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 transition-all'
            >
              Start Adaptive Practice
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
