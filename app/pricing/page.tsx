'use client';
import RazorpayCheckoutButton from '@/components/payments/razorpay-checkout-button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

type PricePlan = {
  name: string;
  subtitle?: string;
  amountInr?: number;
  recurring?: 'month' | 'year';
  kind: 'one_time' | 'subscription';
  description?: string;
  gradient?: string;

  // New fields
  level?: string; // CF level / rating
  benefits?: string[]; // list of short bullets
  popular?: boolean; // whether most popular
  ctaLabel?: string; // button text
  cfRatingColor?: string; // CF rating color for UI
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
      'Lifetime access',
      'Editorial links & tags',
      'Built-in revision tracker',
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
      'Lifetime access',
      'Editorial links & tags',
      'Built-in revision tracker',
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
      'Lifetime access',
      'Editorial links & tags',
      'Built-in revision tracker',
    ],
    popular: true, // mark as most popular
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
      'Lifetime access',
      'Editorial links & tags',
      'Built-in revision tracker',
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
      'Lifetime access',
      'Editorial links & tags',
      'Built-in revision tracker',
    ],
    popular: false,
    ctaLabel: 'Buy Now',
    cfRatingColor: 'bg-purple-500',
  },
  {
    name: 'Subscription Pack',
    subtitle: 'Weekly 20–30 curated problems',
    amountInr: 149,
    kind: 'subscription',
    recurring: 'month',
    description:
      'Stay consistent with fresh, handpicked problems each week — sharpen your rating steadily.',
    gradient: 'from-rose-400 to-red-500',
    level: 'subscription',
    benefits: [
      '20–30 curated problems weekly',
      'Smart streak + progress tracking',
      'Priority updates and revisions',
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
      '20–30 curated problems weekly',
      'Smart streak + progress tracking',
      'Priority updates and revisions',
    ];
  }
  return [
    'Lifetime access to the sheet',
    'Editorial links & tags',
    'Built‑in revision tracker',
  ];
}

// CF rating color for each plan
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
    <main className='container mx-auto max-w-6xl px-6 py-20'>
      {/* Header Section */}
      <section className='text-center mb-16'>
        <h1 className='text-4xl md:text-5xl font-bold tracking-tight'>
          Codeforces Level-Up Roadmap ⚡
        </h1>
        <p className='text-muted-foreground mt-4 text-lg max-w-2xl mx-auto leading-relaxed'>
          Progress from <span className='font-bold font-mono'>Newbie</span>
          {' → '}
          <span className='font-bold font-mono'>Candidate Master</span> one
          stage at a time with curated topic sheets.
        </p>

        {/* Inline curation overview */}
        <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left'>
          <div className='rounded-lg border p-4'>
            <h3 className='font-semibold mb-2'>How we curate</h3>
            <p className='text-sm text-muted-foreground'>
              We analyze thousands of CF problems, cluster by pattern and
              difficulty, then hand-pick balanced sets for each level.
            </p>
          </div>
          <div className='rounded-lg border p-4'>
            <h3 className='font-semibold mb-2'>What you practice</h3>
            <p className='text-sm text-muted-foreground'>
              From basics (I/O, arrays, math) up to advanced topics (DP, graphs,
              number theory, segment trees, LCA, bitmasking).
            </p>
          </div>
          <div className='rounded-lg border p-4'>
            <h3 className='font-semibold mb-2'>Weekly subscription</h3>
            <p className='text-sm text-muted-foreground'>
              20–30 fresh problems every week so you keep momentum and steadily
              raise rating.
            </p>
          </div>
        </div>

        {/* Global Alert if payments are disabled */}
        {paymentsEnabled === false && (
          <Alert className='mt-6 max-w-2xl mx-auto border-yellow-500/50 bg-yellow-500/10'>
            <InfoIcon className='h-4 w-4 text-yellow-500' />
            <AlertDescription className='text-sm text-yellow-200'>
              Payments are currently disabled. Please contact support to enable
              checkout and purchase problem sheets.
            </AlertDescription>
          </Alert>
        )}
      </section>

      {/* Pricing Cards */}
      <div className='grid gap-10 md:grid-cols-2 lg:grid-cols-3'>
        {PLANS.map(p => {
          const isPopular =
            p.kind === 'subscription' || /level 2/i.test(p.name);
          return (
            <motion.div
              key={p.name}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            >
              <Card className='group relative overflow-hidden border rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full'>
                {/* Gradient Glow */}
                <div
                  className={`pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr ${p.gradient} rounded-2xl blur-xl`}
                  aria-hidden='true'
                />
                <div
                  className={`pointer-events-none absolute left-0 top-0 -z-10 h-full w-[5px] bg-gradient-to-b ${p.gradient}`}
                  aria-hidden='true'
                />

                <CardHeader className='flex flex-col gap-1'>
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
                  {isPopular && (
                    <Badge className='absolute top-4 right-4 bg-primary text-primary-foreground'>
                      Most Popular
                    </Badge>
                  )}

                  
                </CardHeader>

                <CardContent className='flex flex-col flex-1'>
                  <div
                    className={`mt-2 text-3xl font-extrabold bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent relative z-10`}
                    style={{ textShadow: '0 0 2px rgba(0,0,0,0.6)' }}
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

                  {/* Short benefit bullets */}
                  <ul className='mt-4 space-y-2 text-sm flex-1'>
                    {bulletsForPlan(p).map(b => (
                      <li key={b} className='flex items-center gap-2'>
                        <CheckCircle2
                          className='h-4 w-4 text-primary'
                          aria-hidden='true'
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Buy / Subscribe Button */}
                  {paymentsEnabled ? (
                    p.kind === 'one_time' ? (
                      <div className='mt-6 relative z-10'>
                        <RazorpayCheckoutButton
                          amount={p.amountInr ?? 0}
                          sheetCode={sheetCodeFor(p.name)}
                          label='Buy Now'
                        />
                      </div>
                    ) : (
                      <div className='mt-6 relative z-10'>
                        <RazorpayCheckoutButton
                          amount={
                            (p.amountInr ?? 0) > 0
                              ? (p.amountInr as number)
                              : 149
                          }
                          sheetCode={'subscription-monthly'}
                          label='Subscribe Now'
                        />
                        <p className='mt-2 text-xs text-muted-foreground'>
                          Cancel anytime. No hidden fees.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className='mt-6 text-center'>
                      <p className='text-sm text-muted-foreground'>
                        Checkout is currently disabled.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Trust footer */}
      <div className='mt-12 text-center text-sm text-muted-foreground'>
        Secured by Razorpay. 7‑day refund guarantee on eligible purchases.
      </div>
    </main>
  );
}