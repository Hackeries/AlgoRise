'use client';

import React from 'react';
import Link from 'next/link';
import {
  Brain,
  Zap,
  LineChart,
  Users,
  Shield,
  Sparkles,
  type LucideIcon,
  ArrowRight,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: 'Adaptive Learning',
    description:
      'AI analyzes your solving patterns and adjusts problem difficulty in real-time for optimal learning.',
  },
  {
    icon: Zap,
    title: 'Codeforces Integration',
    description:
      'Sync your profile, track contest performance, and get personalized practice recommendations.',
  },
  {
    icon: LineChart,
    title: 'Progress Analytics',
    description:
      'Visualize improvement with topic breakdowns, performance trends, and consistency metrics.',
  },
  {
    icon: Users,
    title: 'Group Competitions',
    description:
      'Create study groups, challenge peers, and climb leaderboards to stay motivated.',
  },
  {
    icon: Shield,
    title: 'Verified Profiles',
    description:
      'Secure handle verification for trust, personalization, and competitive authenticity.',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description:
      'Curated problem sets targeting skill gaps, contest prep, and growth velocity.',
  },
];

export default function PlatformFeatures() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-labelledby="platform-features-heading"
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
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Features</span>
          </div>

          <h2
            id="platform-features-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Everything you need to excel
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete platform for competitive programming mastery with adaptive
            learning, analytics, and community features.
          </p>
        </motion.div>

        {/* Features Grid */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.li
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <motion.div
                  whileHover={reduced ? undefined : { y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="h-full p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </motion.li>
            );
          })}
        </ul>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg">
            <Link href="/auth/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
