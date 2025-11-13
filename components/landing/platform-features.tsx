'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Brain,
  Zap,
  LineChart,
  Users,
  Shield,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { Button } from '@/components/ui/button';

// ----------------------------------
// Types & Config
// ----------------------------------
type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradientStops: string;
  softStops: string;
  accent?: string;
};

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: 'Adaptive Learning Engine',
    description:
      "AI analyzes your solving patterns and adjusts difficulty in real time so you're always at the optimal challenge point.",
    gradientStops: 'from-blue-500 to-cyan-500',
    softStops: 'from-blue-500/20 to-cyan-500/20',
    accent: 'blue',
  },
  {
    icon: Zap,
    title: 'Codeforces Integration',
    description:
      'Sync your Codeforces profile, surface contest insights, and receive personalized practice recommendations.',
    gradientStops: 'from-emerald-500 to-teal-500',
    softStops: 'from-emerald-500/20 to-teal-500/20',
    accent: 'emerald',
  },
  {
    icon: LineChart,
    title: 'Progress Analytics',
    description:
      'Visualize improvement via topic breakdowns, time-series performance curves, and consistency metrics.',
    gradientStops: 'from-purple-500 to-pink-500',
    softStops: 'from-purple-500/20 to-pink-500/20',
    accent: 'purple',
  },
  {
    icon: Users,
    title: 'Group Competitions',
    description:
      'Create study circles, challenge peers, and climb collaborative leaderboards to build sustained momentum.',
    gradientStops: 'from-orange-500 to-yellow-500',
    softStops: 'from-orange-500/20 to-yellow-500/20',
    accent: 'orange',
  },
  {
    icon: Shield,
    title: 'Verified Profiles',
    description:
      'Secure handle verification unlocks trust, personalization, and authenticity in competitive contexts.',
    gradientStops: 'from-indigo-500 to-blue-500',
    softStops: 'from-indigo-500/20 to-blue-500/20',
    accent: 'indigo',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description:
      'Curated sets targeting skill gaps, contest prep windows, and growth velocity—intelligently prioritized.',
    gradientStops: 'from-yellow-500 to-amber-500',
    softStops: 'from-yellow-500/20 to-amber-500/20',
    accent: 'yellow',
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;
const appearTransition: Transition = { duration: 0.55, ease: EASE };

// ----------------------------------
// Component
// ----------------------------------
export default function PlatformFeatures() {
  const reduced = useReducedMotion();

  const featureAnimConfig = useMemo(
    () =>
      FEATURES.map((_, i) => ({
        delay: i * 0.1,
      })),
    []
  );

  return (
    <section
      aria-labelledby='platform-features-heading'
      className='relative py-20 sm:py-24 lg:py-32 overflow-hidden bg-linear-to-br from-background via-muted/30 to-background'
    >
      {/* Animated background ornaments */}
      <div
        className='absolute inset-0 overflow-hidden pointer-events-none'
        aria-hidden='true'
      >
        <motion.div
          className='absolute top-1/3 -left-1/4 w-96 h-96 bg-linear-to-br from-primary/30 to-purple-500/30 rounded-full blur-3xl'
          animate={
            reduced
              ? { opacity: 0.28, scale: 1 }
              : { opacity: [0.3, 0.2, 0.3], scale: [1, 1.2, 1] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className='absolute bottom-1/3 -right-1/4 w-96 h-96 bg-linear-to-tl from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl'
          animate={
            reduced
              ? { opacity: 0.28, scale: 1 }
              : { opacity: [0.2, 0.3, 0.2], scale: [1, 1.3, 1] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={appearTransition}
          className='text-center mb-16 sm:mb-20'
        >
          <motion.div
            initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6'
          >
            <Sparkles className='w-4 h-4 text-primary' aria-hidden='true' />
            <span className='text-sm font-medium text-primary'>
              Platform Features
            </span>
          </motion.div>

          <h2
            id='platform-features-heading'
            className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-4'
          >
            <span className='bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent'>
              Everything You Need to Master Algorithms
            </span>
          </h2>
          <p className='text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
            AlgoRise unifies adaptive learning, contest intelligence,
            competitive duels, deep analytics, and community progression—scaled
            to your growth curve.
          </p>
        </motion.div>

        {/* ✅ Changed to UL/LI for semantic correctness */}
        <ul
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'
          aria-label='Platform feature list'
        >
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.li
                key={feature.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.55,
                  ease: EASE,
                  delay: featureAnimConfig[i].delay,
                }}
                className='group relative'
                aria-label={feature.title}
              >
                <motion.div
                  whileHover={
                    reduced
                      ? undefined
                      : {
                          y: -8,
                          boxShadow:
                            '0 12px 30px -6px var(--shadow-color, rgba(0,0,0,0.4))',
                        }
                  }
                  transition={{ duration: 0.3, ease: EASE }}
                  className='h-full p-6 sm:p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden'
                  style={{
                    ['--shadow-color' as any]: 'rgba(0,0,0,0.35)',
                  }}
                >
                  {/* Hover gradient veil */}
                  <motion.div
                    aria-hidden='true'
                    className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-linear-to-br ${feature.softStops} -z-10 transition-opacity duration-400`}
                  />

                  {/* Animated perimeter */}
                  <motion.div
                    aria-hidden='true'
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-r ${feature.gradientStops} opacity-0 group-hover:opacity-20`}
                    animate={reduced ? undefined : { rotate: [0, 360] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  {/* Icon */}
                  <motion.div
                    whileHover={
                      reduced ? undefined : { rotate: 360, scale: 1.12 }
                    }
                    transition={{ duration: 0.65, ease: EASE }}
                    className={`inline-flex p-4 rounded-xl mb-5 bg-linear-to-br ${feature.gradientStops} shadow-lg shadow-black/10`}
                    aria-hidden='true'
                  >
                    <Icon className='h-7 w-7 text-white' />
                  </motion.div>

                  {/* Title */}
                  <h3 className='text-lg sm:text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors'>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className='text-sm sm:text-base text-muted-foreground leading-relaxed'>
                    {feature.description}
                  </p>
                </motion.div>
              </motion.li>
            );
          })}
        </ul>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
          className='text-center mt-16'
        >
          <p className='text-muted-foreground text-sm sm:text-base'>
            Join thousands of developers accelerating their algorithm mastery
          </p>
          <motion.div
            className='mt-6'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Link href='/auth/sign-up' aria-label='Create an AlgoRise account'>
              <Button className='px-8 py-4 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all'>
                Get Started
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}