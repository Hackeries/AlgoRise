'use client';
import RazorpayCheckoutButton from '@/components/payments/razorpay-checkout-button';
import type React from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  InfoIcon,
  CheckCircle2,
  Zap,
  Trophy,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
};

const PLANS: PricePlan[] = [
  {
    name: 'Intro Pack',
    subtitle: 'Newbie → Pupil',
    amountInr: 29,
    kind: 'one_time',
    description:
      'Basics · I/O · Math-1 · Arrays · STL · Two Pointers · Prefix Sum',
    gradient: 'from-gray-400 to-green-500',
    level: 'newbie',
    benefits: [
      'Lifetime access to all problems',
      'Editorial links & detailed tags',
      'Built-in revision tracker',
      'Progress analytics',
    ],
    popular: false,
    ctaLabel: 'Buy Now',
    cfRatingColor: 'bg-gray-400',
  },
  {
    name: 'Level 1 Sheet',
    subtitle: 'Pupil → Specialist',
    amountInr: 79,
    kind: 'one_time',
    description:
      'Sorting/Greedy · Binary Search · Hashing · Stacks/Queues · Brute-Force Patterns',
    gradient: 'from-green-500 to-cyan-400',
    level: 'pupil',
    benefits: [
      'Lifetime access to all problems',
      'Editorial links & detailed tags',
      'Built-in revision tracker',
      'Progress analytics',
    ],
    popular: false,
    ctaLabel: 'Buy Now',
    cfRatingColor: 'bg-green-500',
  },
  {
    name: 'Level 2 Sheet',
    subtitle: 'Specialist → Expert',
    amountInr: 99,
    kind: 'one_time',
    description:
      'Graphs (BFS/DFS) · Shortest Paths · Intro DP · Number Theory-1 · Implementation',
    gradient: 'from-cyan-400 to-blue-500',
    level: 'specialist',
    benefits: [
      'Lifetime access to all problems',
      'Editorial links & detailed tags',
      'Built-in revision tracker',
      'Progress analytics',
    ],
    popular: true,
    ctaLabel: 'Buy Now',
    cfRatingColor: 'bg-cyan-400',
  },
  {
    name: 'Level 3 Sheet',
    subtitle: 'Expert → Candidate Master',
    amountInr: 199,
    kind: 'one_time',
    description:
      'Advanced DP · Combinatorics · Trees/LCA · Bitmasking · Math-2 · Segment Trees',
    gradient: 'from-blue-500 to-purple-500',
    level: 'expert',
    benefits: [
      'Lifetime access to all problems',
      'Editorial links & detailed tags',
      'Built-in revision tracker',
      'Progress analytics',
    ],
    popular: false,
    ctaLabel: 'Buy Now',
    cfRatingColor: 'bg-blue-500',
  },
  {
    name: 'Level 4 Sheet',
    subtitle: 'Candidate Master → Master',
    amountInr: 349,
    kind: 'one_time',
    description:
      'Challenge archive mixing all advanced CF patterns for final polishing.',
    gradient: 'from-purple-500 to-orange-500',
    level: 'candidate-master',
    benefits: [
      'Lifetime access to all problems',
      'Editorial links & detailed tags',
      'Built-in revision tracker',
      'Progress analytics',
    ],
    popular: false,
    ctaLabel: 'Buy Now',
    cfRatingColor: 'bg-purple-500',
  },
  {
    name: 'Weekly Subscription',
    subtitle: '20-30 curated problems every week',
    amountInr: 149,
    kind: 'subscription',
    recurring: 'month',
    description:
      'Stay consistent with fresh, handpicked problems each week — sharpen your rating steadily.',
    gradient: 'from-rose-400 to-red-500',
    level: 'subscription',
    benefits: [
      '20-30 curated problems weekly',
      'Smart streak & progress tracking',
      'Priority updates & revisions',
      'Community access',
    ],
    popular: true,
    ctaLabel: 'Subscribe Now',
    cfRatingColor: 'bg-rose-400',
  },
];

function sheetCodeFor(name: string): string | undefined {
  const key = name.toLowerCase();
  if (key.includes('intro')) return 'intro-pack';
  if (key.includes('level 1')) return 'level-1';
  if (key.includes('level 2')) return 'level-2';
  if (key.includes('level 3')) return 'level-3';
  if (key.includes('level 4')) return 'level-4';
  return undefined;
}

function bulletsForPlan(p: PricePlan): string[] {
  if (p.kind === 'subscription') {
    return [
      '20-30 curated problems weekly',
      'Smart streak & progress tracking',
      'Priority updates & revisions',
      'Community access',
    ];
  }
  return [
    'Lifetime access to all problems',
    'Editorial links & detailed tags',
    'Built-in revision tracker',
    'Progress analytics',
  ];
}

function cfColorForPlan(name: string) {
  const key = name.toLowerCase();
  if (key.includes('intro')) return 'bg-gray-400';
  if (key.includes('level 1')) return 'bg-green-500';
  if (key.includes('level 2')) return 'bg-cyan-400';
  if (key.includes('level 3')) return 'bg-blue-500';
  if (key.includes('level 4')) return 'bg-purple-500';
  if (key.includes('subscription')) return 'bg-rose-400';
  return 'bg-gray-400';
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
          <div className='absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl' />
        </div>

        <div className='relative mx-auto max-w-4xl text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className='mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'>
              <Sparkles className='h-3 w-3 mr-2' />
              Unlock Your Potential
            </Badge>
            <h1 className='text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
              Level Up Your CP Skills
            </h1>
            <p className='text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed'>
              Master competitive programming with curated problem sheets and
              weekly challenges. Progress from Newbie to Master with our
              structured learning paths.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='grid grid-cols-3 gap-4 md:gap-8 mb-12'
          >
            <div className='text-center'>
              <div className='text-3xl md:text-4xl font-black text-blue-400'>
                500+
              </div>
              <div className='text-sm text-slate-400'>Problems</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl md:text-4xl font-black text-purple-400'>
                10K+
              </div>
              <div className='text-sm text-slate-400'>Students</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl md:text-4xl font-black text-pink-400'>
                95%
              </div>
              <div className='text-sm text-slate-400'>Success Rate</div>
            </div>
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

      {/* Pricing Cards */}
      <section className='px-6 py-20'>
        <div className='mx-auto max-w-7xl'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl md:text-5xl font-black mb-4'>
              Simple, Transparent Pricing
            </h2>
            <p className='text-lg text-slate-400'>
              Choose the plan that fits your learning journey
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {PLANS.map((p, idx) => {
              const isPopular = p.popular;
              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    className={`relative overflow-hidden border transition-all duration-300 h-full flex flex-col ${
                      isPopular
                        ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-purple-500/10 ring-2 ring-blue-500/20'
                        : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50'
                    }`}
                  >
                    {/* Gradient Accent */}
                    <div
                      className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${p.gradient}`}
                      aria-hidden='true'
                    />

                    {isPopular && (
                      <div className='absolute top-4 right-4'>
                        <Badge className='bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
                          <Trophy className='h-3 w-3 mr-1' />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className='text-2xl font-bold'>
                        {p.name}
                      </CardTitle>
                      {p.subtitle && (
                        <Badge
                          variant='outline'
                          className='w-fit border-slate-600 bg-slate-700/50 text-slate-300'
                        >
                          {p.subtitle}
                        </Badge>
                      )}
                      <div className='mt-4'>
                        <div className='text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                          {p.kind === 'subscription'
                            ? `₹${p.amountInr}/mo`
                            : `₹${p.amountInr}`}
                        </div>
                        {p.kind === 'subscription' && (
                          <p className='text-sm text-slate-400 mt-1'>
                            Cancel anytime
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className='flex flex-col flex-1'>
                      {p.description && (
                        <CardDescription className='text-slate-300 mb-6 text-sm leading-relaxed'>
                          {p.description}
                        </CardDescription>
                      )}

                      {/* Benefits */}
                      <ul className='space-y-3 mb-8 flex-1'>
                        {bulletsForPlan(p).map(benefit => (
                          <li key={benefit} className='flex items-start gap-3'>
                            <CheckCircle2 className='h-5 w-5 text-green-400 flex-shrink-0 mt-0.5' />
                            <span className='text-sm text-slate-300'>
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      {paymentsEnabled ? (
                        <div className='relative z-10'>
                          <RazorpayCheckoutButton
                            amount={p.amountInr ?? 0}
                            sheetCode={sheetCodeFor(p.name)}
                            label={p.ctaLabel || 'Get Started'}
                          />
                        </div>
                      ) : (
                        <Button disabled className='w-full'>
                          Checkout Disabled
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className='px-6 py-20 bg-slate-800/30'>
        <div className='mx-auto max-w-4xl'>
          <h2 className='text-4xl font-black text-center mb-12'>
            What's Included
          </h2>

          <div className='grid md:grid-cols-2 gap-8'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className='space-y-4'
            >
              <h3 className='text-xl font-bold flex items-center gap-2'>
                <Zap className='h-5 w-5 text-yellow-400' />
                One-Time Sheets
              </h3>
              <ul className='space-y-2 text-slate-300'>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Lifetime access
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Curated problems by difficulty
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Editorial solutions
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Progress tracking
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
                <TrendingUp className='h-5 w-5 text-blue-400' />
                Weekly Subscription
              </h3>
              <ul className='space-y-2 text-slate-300'>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  20-30 problems weekly
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Streak tracking
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Community support
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-400' />
                  Cancel anytime
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='px-6 py-20'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mx-auto max-w-2xl text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-12'
        >
          <h2 className='text-3xl md:text-4xl font-black mb-4'>
            Ready to Start Your Journey?
          </h2>
          <p className='text-lg text-slate-300 mb-8'>
            Join thousands of students who are mastering competitive programming
            with AlgoRise.
          </p>
          <Button
            asChild
            size='lg'
            className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold'
          >
            <Link href='/paths'>
              Explore Learning Paths
              <ArrowRight className='h-5 w-5 ml-2' />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className='border-t border-slate-700/50 px-6 py-8 text-center text-sm text-slate-400'>
        <p>
          Secured by Razorpay. 7-day refund guarantee on eligible purchases.
        </p>
      </footer>
    </main>
  );
}