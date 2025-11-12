'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  Target,
  TrendingUp,
  Award,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
  // Tailwind gradient stops; e.g. "from-blue-500 to-cyan-500"
  gradientStops: string;
  // Softer background gradient; e.g. "from-blue-500/20 to-cyan-500/20"
  bgStops: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

const steps: Step[] = [
  {
    icon: UserPlus,
    title: 'Sign Up & Verify',
    description:
      'Create your account and connect your Codeforces handle to get started with personalized learning.',
    gradientStops: 'from-blue-500 to-cyan-500',
    bgStops: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Target,
    title: 'Adaptive Practice',
    description:
      'Our AI analyzes your skill level and recommends problems that match your current abilities.',
    gradientStops: 'from-purple-500 to-pink-500',
    bgStops: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description:
      'Monitor your improvement with detailed analytics, streaks, and performance insights.',
    gradientStops: 'from-orange-500 to-red-500',
    bgStops: 'from-orange-500/20 to-red-500/20',
  },
  {
    icon: Award,
    title: 'Compete & Excel',
    description:
      'Join contests, compete with peers, and climb the leaderboards as you master algorithms.',
    gradientStops: 'from-yellow-500 to-orange-500',
    bgStops: 'from-yellow-500/20 to-orange-500/20',
  },
];

export default function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-labelledby='how-it-works-heading'
      className='relative py-20 sm:py-24 lg:py-32 overflow-hidden bg-linear-to-br from-background via-background to-muted/30'
    >
      {/* Animated gradient orbs */}
      <div
        className='absolute inset-0 overflow-hidden pointer-events-none'
        aria-hidden='true'
      >
        <motion.div
          className='absolute top-1/4 -left-1/4 w-96 h-96 bg-linear-to-br from-primary/30 to-purple-500/30 rounded-full blur-3xl'
          animate={
            reduced
              ? { opacity: 0.25, scale: 1 }
              : { opacity: [0.3, 0.2, 0.3], scale: [1, 1.2, 1] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className='absolute bottom-1/4 -right-1/4 w-96 h-96 bg-linear-to-tl from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl'
          animate={
            reduced
              ? { opacity: 0.25, scale: 1 }
              : { opacity: [0.2, 0.3, 0.2], scale: [1, 1.3, 1] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className='text-center mb-16 sm:mb-20'
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6'
          >
            <div className='w-2 h-2 rounded-full bg-primary animate-pulse' />
            <span className='text-sm font-medium text-primary'>
              How It Works
            </span>
          </motion.div>

          <h2
            id='how-it-works-heading'
            className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-4'
          >
            <span className='bg-linear-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent'>
              Your Path to Mastery
            </span>
          </h2>
          <p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            Get started in minutes and begin your journey to competitive
            programming excellence
          </p>
        </motion.div>

        {/* Steps Grid (ordered for semantics) */}
        <ol className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4'>
          {steps.map((step, index) => (
            <li key={step.title} className='relative'>
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: EASE }}
                className='relative group h-full'
              >
                {/* Connecting Arrow - Desktop Only */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, ease: EASE }}
                    className='hidden lg:flex absolute top-20 -right-4 z-10 items-center justify-center w-8 h-8 rounded-full bg-linear-to-r from-primary/20 to-transparent'
                    aria-hidden='true'
                  >
                    <ArrowRight className='h-4 w-4 text-primary' />
                  </motion.div>
                )}

                <motion.div
                  whileHover={reduced ? undefined : { y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className='relative h-full p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300'
                >
                  {/* Step Number Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    className={`absolute -top-3 -right-3 w-12 h-12 rounded-full bg-linear-to-br ${step.gradientStops} flex items-center justify-center shadow-lg shadow-primary/30`}
                    aria-hidden='true'
                  >
                    <span className='text-white font-bold text-lg'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    whileHover={
                      reduced ? undefined : { rotate: 360, scale: 1.1 }
                    }
                    transition={{ duration: 0.6, ease: EASE }}
                    className={`inline-flex p-4 rounded-xl mb-4 bg-linear-to-br ${step.bgStops} border border-primary/20`}
                    aria-hidden='true'
                  >
                    <step.icon className='h-7 w-7 text-primary' />
                  </motion.div>

                  {/* Content */}
                  <h3 className='text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors'>
                    {step.title}
                  </h3>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {step.description}
                  </p>

                  {/* Hover Glow Effect */}
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-linear-to-br ${step.bgStops} blur-xl -z-10 transition-opacity duration-300`}
                    aria-hidden='true'
                  />
                </motion.div>
              </motion.article>
            </li>
          ))}
        </ol>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
          className='text-center mt-16'
        >
          <Link href='/auth/sign-up' aria-label='Create your AlgoRise account'>
            <motion.div
              whileHover={reduced ? undefined : { scale: 1.05 }}
              whileTap={reduced ? undefined : { scale: 0.95 }}
            >
              <Button className='inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all'>
                Get Started Now
                <ArrowRight className='h-5 w-5' aria-hidden='true' />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
