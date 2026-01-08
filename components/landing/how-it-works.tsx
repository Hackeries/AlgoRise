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
  step: number;
};

const STEPS: Step[] = [
  {
    icon: UserPlus,
    title: 'Create Account',
    description:
      'Sign up in seconds and connect your Codeforces handle for personalized experience.',
    step: 1,
  },
  {
    icon: Target,
    title: 'Start Practicing',
    description:
      'Get AI-recommended problems matching your skill level and learning goals.',
    step: 2,
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description:
      'Monitor improvement with detailed analytics, streaks, and performance insights.',
    step: 3,
  },
  {
    icon: Award,
    title: 'Compete & Grow',
    description:
      'Join contests, challenge peers, and climb leaderboards as you master algorithms.',
    step: 4,
  },
];

export default function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="py-20 sm:py-24 lg:py-32 bg-background"
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
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary">How It Works</span>
          </div>

          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Get started in minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to begin your competitive programming journey
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector line (desktop only) */}
                {index < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-border"
                    aria-hidden="true"
                  />
                )}

                <motion.div
                  whileHover={reduced ? undefined : { y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="relative text-center p-6"
                >
                  {/* Step number */}
                  <div className="relative inline-flex mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
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
          className="text-center mt-16"
        >
          <Button asChild size="lg">
            <Link href="/auth/sign-up">
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
