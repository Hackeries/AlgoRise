'use client';

import { Button } from '@/components/ui/button';
import RazorpayCheckoutButton from '@/components/payments/razorpay-checkout-button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

type PricePlan = {
  name: string;
  subtitle?: string;
  amountInr?: number;
  recurring?: 'month' | 'year';
  kind: 'one_time' | 'subscription';
  description?: string;
  gradient?: string;
};

const PLANS: PricePlan[] = [
  {
    name: 'Intro Pack',
    subtitle: 'Newbie → Pupil',
    amountInr: 29,
    kind: 'one_time',
    description:
      'Basics · I/O · Math-1 · Arrays · STL · Two Pointers · Prefix Sum',
    gradient: 'from-gray-400 to-green-500', // Gray → Green
  },
  {
    name: 'Level 1 Sheet',
    subtitle: 'Pupil → Specialist',
    amountInr: 79,
    kind: 'one_time',
    description:
      'Sorting/Greedy · Binary Search · Hashing · Stacks/Queues · Brute-Force Patterns',
    gradient: 'from-green-500 to-cyan-400', // Green → Cyan
  },
  {
    name: 'Level 2 Sheet',
    subtitle: 'Specialist → Expert',
    amountInr: 99,
    kind: 'one_time',
    description:
      'Graphs (BFS/DFS) · Shortest Paths · Intro DP · Number Theory-1 · Implementation',
    gradient: 'from-cyan-400 to-blue-500', // Cyan → Blue
  },
  {
    name: 'Level 3 Sheet',
    subtitle: 'Expert → Candidate Master',
    amountInr: 199,
    kind: 'one_time',
    description:
      'Advanced DP · Combinatorics · Trees/LCA · Bitmasking · Math-2 · Segment Trees',
    gradient: 'from-blue-500 to-purple-500', // Blue → Purple
  },
  {
    name: 'Level 4 Sheet',
    subtitle: 'Candidate Master → Master',
    amountInr: 349,
    kind: 'one_time',
    description:
      'Challenge archive mixing all advanced CF patterns for final polishing.',
    gradient: 'from-purple-500 to-orange-500', // Purple → Orange
  },
  {
    name: 'Subscription Pack',
    subtitle: 'Weekly 20–30 curated problems',
    amountInr: 149,
    kind: 'subscription',
    recurring: 'month',
    description:
      'Stay consistent with fresh, handpicked problems each week — sharpen your rating steadily.',
    gradient: 'from-rose-400 to-red-500', // Pink → Red
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

export default function PricingPage() {
  return (
    <main className='container mx-auto max-w-6xl px-6 py-20'>
      {/* Header Section */}
      <section className='text-center mb-16'>
        <h1 className='text-4xl md:text-5xl font-bold tracking-tight'>
          Codeforces Level-Up Roadmap ⚡
        </h1>
        <p className='text-muted-foreground mt-4 text-lg max-w-2xl mx-auto leading-relaxed'>
          Progress from{' '}
          <span className='font-bold font-mono text-gray-500'>Newbie</span>{' '}
          <span className='font-bold font-mono text-white'>→</span>{' '}
          <span className='font-bold font-mono text-purple-500'>
            Candidate Master
          </span>{' '}
          master one stage at a time with curated topic sheets designed for
          your growth.
        </p>
      </section>

      {/* Pricing Cards */}
      <div className='grid gap-10 md:grid-cols-2 lg:grid-cols-3'>
        {PLANS.map(p => (
          <motion.div
            key={p.name}
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          >
            <Card
              className={`relative overflow-hidden border rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}
            >
              {/* Gradient Border Glow */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr ${p.gradient} rounded-2xl blur-xl`}
              />

              {/* Left Accent Bar */}
              <div
                className={`absolute left-0 top-0 h-full w-[5px] bg-gradient-to-b ${p.gradient}`}
              />

              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-xl font-semibold'>
                    {p.name}
                  </CardTitle>
                  {p.subtitle && (
                    <Badge
                      variant='outline'
                      className={`font-medium border-0 bg-gradient-to-r ${p.gradient} text-white shadow-md`}
                    >
                      {p.subtitle}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div
                  className={`mt-2 text-3xl font-extrabold bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent`}
                >
                  {p.kind === 'subscription'
                    ? `₹${p.amountInr}/mo`
                    : `₹${p.amountInr}`}
                </div>

                {p.description && (
                  <CardDescription className='mt-4 text-sm text-muted-foreground leading-relaxed'>
                    {p.description}
                  </CardDescription>
                )}

                {p.kind === 'one_time' ? (
                  <div className='mt-6'>
                    <RazorpayCheckoutButton
                      amount={p.amountInr ?? 0}
                      sheetCode={sheetCodeFor(p.name)}
                      label='Buy Now'
                    />
                  </div>
                ) : (
                  <Button className='mt-6 w-full' disabled>
                    Subscription Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
