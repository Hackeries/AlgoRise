'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
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
  icon: LucideIcon;
  color: string;
  bgColor: string;
};

const levels: Level[] = [
  {
    from: 'Newbie',
    to: 'Pupil',
    topics: [
      'Basics of C++ / STL',
      'Math Fundamentals',
      'Arrays / Strings',
      'Two Pointers',
      'Prefix Sum',
    ],
    icon: Target,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    from: 'Pupil',
    to: 'Specialist',
    topics: [
      'Sorting & Greedy',
      'Binary Search',
      'Hash Maps / Sets',
      'Stacks & Queues',
      'Sliding Window',
    ],
    icon: Zap,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    from: 'Specialist',
    to: 'Expert',
    topics: [
      'Graph Basics (BFS/DFS)',
      'Shortest Paths',
      'Intro Dynamic Programming',
      'Number Theory',
      'Prefix/Suffix Optimizations',
    ],
    icon: Trophy,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    from: 'Expert',
    to: 'Candidate Master',
    topics: [
      'Advanced DP',
      'Combinatorics',
      'Trees / LCA',
      'Segment Trees',
      'Complex CF Patterns',
    ],
    icon: Crown,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
];

export default function CFLevels() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-labelledby="cf-levels-heading"
      className="py-20 sm:py-24 lg:py-32 bg-muted/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Roadmap</span>
          </div>

          <h2
            id="cf-levels-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Level-up your Codeforces rating
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow our structured roadmap from Newbie to Candidate Master with
            curated topics for each level.
          </p>
        </motion.div>

        {/* Levels Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {levels.map((lvl, index) => {
            const Icon = lvl.icon;
            return (
              <motion.div
                key={`${lvl.from}-${lvl.to}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={reduced ? undefined : { y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="h-full p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${lvl.bgColor}`}>
                      <Icon className={`h-6 w-6 ${lvl.color}`} />
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {lvl.from} → {lvl.to}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-4">
                    <span className="text-muted-foreground">{lvl.from}</span>
                    <ArrowRight className="inline h-4 w-4 mx-2 text-muted-foreground" />
                    <span className={lvl.color}>{lvl.to}</span>
                  </h3>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2">
                    {lvl.topics.map(topic => (
                      <span
                        key={topic}
                        className="px-2.5 py-1 rounded-md bg-muted text-sm text-muted-foreground"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg">
            <Link href="/paths">
              View Learning Paths
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/adaptive-sheet">
              Start Practice
              <Zap className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
