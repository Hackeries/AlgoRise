'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  TrendingUp,
  Sparkles,
  Flame,
  CheckCircle2,
  InfoIcon,
  Zap,
  Crown,
  Star,
  Users,
  Code2,
  BookOpen,
  BarChart3,
  Shield,
  Clock,
  X,
  ChevronDown,
  ArrowRight,
  Rocket,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SubscriptionCheckoutButton } from '@/components/subscriptions/subscription-checkout-button';
import { SubscriptionPlanCode } from '@/lib/subscriptions/types';
import { cn } from '@/lib/utils';

type PricePlan = {
  code: SubscriptionPlanCode;
  name: string;
  subtitle?: string;
  amountInr?: number;
  description?: string;
  gradient?: string;
  gradientBg?: string;
  iconGradient?: string;
  level?: string;
  benefits?: string[];
  popular?: boolean;
  ctaLabel?: string;
  problemCount?: number;
  icon?: React.ReactNode;
};

const PLANS: PricePlan[] = [
  {
    code: 'entry-gate',
    name: 'Entry Gate',
    subtitle: 'Newbie → Pupil',
    amountInr: 49,
    description:
      'Master the fundamentals. Arrays, STL, Two Pointers, Math basics. Build your foundation.',
    gradient: 'from-emerald-500 to-green-600',
    gradientBg: 'from-emerald-500/10 to-green-600/10',
    iconGradient: 'from-emerald-400 to-green-500',
    benefits: [
      '80+ curated problems',
      'Editorial links & detailed tags',
      'Progress tracker',
      'Lifetime access',
    ],
    ctaLabel: 'Start the Grind',
    problemCount: 80,
    icon: <Target className="w-6 h-6" />,
  },
  {
    code: 'core-builder',
    name: 'Core Builder',
    subtitle: 'Pupil → Specialist',
    amountInr: 99,
    description:
      'Sorting, Greedy, Binary Search, Hashmaps, Stacks/Queues. Master core CF patterns.',
    gradient: 'from-cyan-500 to-blue-600',
    gradientBg: 'from-cyan-500/10 to-blue-600/10',
    iconGradient: 'from-cyan-400 to-blue-500',
    benefits: [
      '120+ CF/AtCoder mid-level problems',
      'Mini-contests & speed tracking',
      'Editorial solutions',
      'Lifetime access',
    ],
    ctaLabel: 'Unlock Level 1',
    problemCount: 120,
    icon: <Code2 className="w-6 h-6" />,
  },
  {
    code: 'algorithmic-ascend',
    name: 'Algorithmic Ascend',
    subtitle: 'Specialist → Expert',
    amountInr: 169,
    description:
      'Graphs, Shortest Paths, Intro DP, Number Theory I, Implementation. Stop random problem solving.',
    gradient: 'from-violet-500 to-purple-600',
    gradientBg: 'from-violet-500/10 to-purple-600/10',
    iconGradient: 'from-violet-400 to-purple-500',
    benefits: [
      '150+ problems with hints',
      'Endurance tracker & leaderboard',
      'Topic mastery analytics',
      'Lifetime access',
    ],
    popular: true,
    ctaLabel: 'Enter the Arena',
    problemCount: 150,
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    code: 'competitive-forge',
    name: 'Competitive Forge',
    subtitle: 'Expert → Candidate Master',
    amountInr: 259,
    description:
      'Advanced DP, Trees, Bitmasking, Combinatorics II, Segment Trees. Feel the pain, love the grind.',
    gradient: 'from-purple-500 to-pink-600',
    gradientBg: 'from-purple-500/10 to-pink-600/10',
    iconGradient: 'from-purple-400 to-pink-500',
    benefits: [
      '150+ ICPC/CF Div1 problems',
      'Topic mastery analytics',
      'Private elite forum',
      'Lifetime access',
    ],
    ctaLabel: 'Enter Div 1',
    problemCount: 150,
    icon: <Flame className="w-6 h-6" />,
  },
  {
    code: 'master-craft',
    name: 'Master Craft',
    subtitle: 'Candidate Master → Master',
    amountInr: 419,
    description:
      'Flows, DP on Graphs, Matrix Expo, Lazy Segtrees, Heavy Math. Train like ICPC World Finalists.',
    gradient: 'from-orange-500 to-red-600',
    gradientBg: 'from-orange-500/10 to-red-600/10',
    iconGradient: 'from-orange-400 to-red-500',
    benefits: [
      '200+ elite problems',
      'Live analysis & No-Editorial Mode',
      'Private elite forum',
      'Lifetime access',
    ],
    ctaLabel: 'Bleed Ratings',
    problemCount: 200,
    icon: <Crown className="w-6 h-6" />,
  },
];

const FEATURES = [
  { name: 'Problem Count', key: 'problemCount' },
  { name: 'Curated Problems', key: 'curated' },
  { name: 'Editorial Solutions', key: 'editorial' },
  { name: 'Progress Tracker', key: 'progress' },
  { name: 'Lifetime Access', key: 'lifetime' },
  { name: 'Topic Mastery Analytics', key: 'analytics' },
  { name: 'Speed Tracking', key: 'speed' },
  { name: 'Leaderboard Access', key: 'leaderboard' },
  { name: 'Private Forum', key: 'forum' },
  { name: 'No-Editorial Mode', key: 'noEditorial' },
];

const FEATURE_MATRIX: Record<SubscriptionPlanCode, Record<string, boolean | string>> = {
  free: {
    problemCount: '10',
    curated: false,
    editorial: false,
    progress: false,
    lifetime: true,
    analytics: false,
    speed: false,
    leaderboard: false,
    forum: false,
    noEditorial: false,
  },
  'entry-gate': {
    problemCount: '80+',
    curated: true,
    editorial: true,
    progress: true,
    lifetime: true,
    analytics: false,
    speed: false,
    leaderboard: false,
    forum: false,
    noEditorial: false,
  },
  'core-builder': {
    problemCount: '120+',
    curated: true,
    editorial: true,
    progress: true,
    lifetime: true,
    analytics: false,
    speed: true,
    leaderboard: false,
    forum: false,
    noEditorial: false,
  },
  'algorithmic-ascend': {
    problemCount: '150+',
    curated: true,
    editorial: true,
    progress: true,
    lifetime: true,
    analytics: true,
    speed: true,
    leaderboard: true,
    forum: false,
    noEditorial: false,
  },
  'competitive-forge': {
    problemCount: '150+',
    curated: true,
    editorial: true,
    progress: true,
    lifetime: true,
    analytics: true,
    speed: true,
    leaderboard: true,
    forum: true,
    noEditorial: false,
  },
  'master-craft': {
    problemCount: '200+',
    curated: true,
    editorial: true,
    progress: true,
    lifetime: true,
    analytics: true,
    speed: true,
    leaderboard: true,
    forum: true,
    noEditorial: true,
  },
};

const FAQ_ITEMS = [
  {
    question: 'What do I get with lifetime access?',
    answer:
      'Once purchased, you have permanent access to all problems, editorials, and features in your tier. No recurring fees, no hidden charges. Your progress is saved forever.',
  },
  {
    question: 'Can I upgrade to a higher tier later?',
    answer:
      'Absolutely! You can purchase any higher tier at any time. Each tier gives you access to different problem sets and skill levels, so upgrading expands your training options.',
  },
  {
    question: 'Which plan should I choose?',
    answer:
      'Choose based on your current Codeforces rating. Entry Gate is for beginners (800-1200), Core Builder for intermediate (1200-1400), Algorithmic Ascend for specialists (1400-1600), Competitive Forge for experts (1600-1900), and Master Craft for advanced competitors (1900+).',
  },
  {
    question: 'What is the refund policy?',
    answer:
      'We offer a 7-day refund policy on eligible purchases. If you are not satisfied with the content, contact support within 7 days of purchase for a full refund.',
  },
  {
    question: 'Are the problems from real contests?',
    answer:
      'Yes! All problems are curated from Codeforces, AtCoder, and ICPC archives. They are organized by topic and difficulty to ensure structured learning.',
  },
  {
    question: 'How is this different from random problem solving?',
    answer:
      'Instead of randomly solving problems, we provide a structured roadmap. Each tier focuses on specific topics with progressive difficulty, ensuring you build skills systematically.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Arjun S.',
    rating: 'Specialist',
    avatar: 'AS',
    quote:
      'Went from Pupil to Specialist in 3 months. The structured approach saved me countless hours.',
  },
  {
    name: 'Priya M.',
    rating: 'Expert',
    avatar: 'PM',
    quote:
      'The Core Builder problems helped me master Binary Search. Now I solve D problems in contests!',
  },
  {
    name: 'Rahul K.',
    rating: 'CM',
    avatar: 'RK',
    quote:
      'Competitive Forge pushed me to CM. The private forum discussions are invaluable.',
  },
];

function PricingCard({
  code,
  name,
  subtitle,
  amountInr,
  description,
  benefits,
  gradient,
  gradientBg,
  iconGradient,
  popular,
  ctaLabel,
  problemCount,
  icon,
}: PricePlan) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="relative h-full"
    >
      <div
        className={cn(
          'relative flex flex-col h-full bg-card border rounded-2xl overflow-hidden transition-all duration-300',
          popular
            ? 'border-primary shadow-xl shadow-primary/20 ring-2 ring-primary/50'
            : 'border-border/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10'
        )}
      >
        {popular && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
        )}

        {popular && (
          <div className="absolute -top-0 right-4">
            <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white border-0 px-3 py-1 text-xs font-semibold rounded-b-lg rounded-t-none">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Most Popular
            </Badge>
          </div>
        )}

        <div className={cn('p-6 bg-gradient-to-br', gradientBg)}>
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white bg-gradient-to-br',
              iconGradient
            )}
          >
            {icon}
          </div>

          <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">₹{amountInr}</span>
            <span className="text-sm text-muted-foreground font-medium">one-time</span>
          </div>
        </div>

        <div className="flex-1 p-6 pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {description}
          </p>

          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br',
                gradient
              )}
            >
              {problemCount}+
            </div>
            <span className="text-sm font-medium text-foreground">
              Curated Problems
            </span>
          </div>

          <ul className="space-y-3">
            {benefits?.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm">
                <CheckCircle2
                  className={cn('h-5 w-5 shrink-0 bg-gradient-to-br bg-clip-text', gradient)}
                  style={{
                    color: popular ? 'hsl(var(--primary))' : undefined,
                  }}
                />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 pt-0">
          <SubscriptionCheckoutButton
            planCode={code}
            planName={name}
            amount={amountInr || 0}
            label={ctaLabel || 'Get Started'}
            className={cn(
              'w-full py-3 text-white font-semibold transition-all duration-300',
              popular
                ? 'bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/30'
                : `bg-gradient-to-r ${gradient} hover:opacity-90`
            )}
          />
        </div>
      </div>
    </motion.div>
  );
}

function FeatureComparisonTable() {
  const displayPlans: (SubscriptionPlanCode | 'free')[] = [
    'free',
    'entry-gate',
    'core-builder',
    'algorithmic-ascend',
    'competitive-forge',
    'master-craft',
  ];

  const planNames: Record<string, string> = {
    free: 'Free',
    'entry-gate': 'Entry Gate',
    'core-builder': 'Core Builder',
    'algorithmic-ascend': 'Algorithmic Ascend',
    'competitive-forge': 'Competitive Forge',
    'master-craft': 'Master Craft',
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="w-[200px] font-semibold text-foreground">
              Features
            </TableHead>
            {displayPlans.map((plan) => (
              <TableHead
                key={plan}
                className={cn(
                  'text-center font-semibold min-w-[120px]',
                  plan === 'algorithmic-ascend' && 'bg-primary/5 text-primary'
                )}
              >
                {planNames[plan]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {FEATURES.map((feature, idx) => (
            <TableRow
              key={feature.key}
              className={cn(
                'hover:bg-muted/50 transition-colors',
                idx % 2 === 0 && 'bg-muted/20'
              )}
            >
              <TableCell className="font-medium text-foreground">
                {feature.name}
              </TableCell>
              {displayPlans.map((plan) => {
                const value = FEATURE_MATRIX[plan][feature.key];
                return (
                  <TableCell
                    key={plan}
                    className={cn(
                      'text-center',
                      plan === 'algorithmic-ascend' && 'bg-primary/5'
                    )}
                  >
                    {typeof value === 'boolean' ? (
                      value ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      )
                    ) : (
                      <span className="font-semibold text-foreground">{value}</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function PricingPage() {
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
    setPaymentsEnabled(!!keyId);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge
              variant="outline"
              className="mb-6 px-4 py-2 border-primary/30 bg-primary/5"
            >
              <Flame className="w-4 h-4 mr-2 text-primary" />
              <span className="text-primary font-medium">
                Elite Competitive Programming Training
              </span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Level Up Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                Competitive Programming
              </span>{' '}
              Journey
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Battle-tested problem sets and structured roadmaps to push you from Pupil
              to Master. Lifetime access, analytics, and elite-level practice.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">2,500+</p>
                  <p className="text-muted-foreground">Active Learners</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">700+</p>
                  <p className="text-muted-foreground">Curated Problems</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">1,200+</p>
                  <p className="text-muted-foreground">Rating Gained</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment Disabled Alert */}
      {paymentsEnabled === false && (
        <div className="max-w-2xl mx-auto px-4 -mt-8 mb-8">
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <InfoIcon className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm text-yellow-600 dark:text-yellow-400">
              Payments are currently disabled. Contact support to enable checkout.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Pricing Cards Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each tier is a complete roadmap with problems from Codeforces, AtCoder,
              and LeetCode. Pick your level and begin your climb.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {PLANS.map((plan) => (
              <PricingCard key={plan.code} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Compare All Plans</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what&apos;s included in each tier and find the perfect fit for your
              skill level.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm"
          >
            <FeatureComparisonTable />
          </motion.div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What Every Plan Includes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Core features that come with every AlgoRise subscription.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Curated Problems',
                description: 'Hand-picked from CF, AtCoder, ICPC archives',
              },
              {
                icon: BarChart3,
                title: 'Progress Analytics',
                description: 'Track your improvement over time',
              },
              {
                icon: Clock,
                title: 'Lifetime Access',
                description: 'One-time payment, forever access',
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Protected by Razorpay encryption',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by Competitive Programmers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who improved their ratings with AlgoRise.
            </p>

            <div className="flex items-center justify-center gap-1 mt-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              ))}
              <span className="ml-2 text-lg font-semibold">4.9/5</span>
              <span className="text-muted-foreground ml-1">from 500+ reviews</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Codeforces {testimonial.rating}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Got questions? We&apos;ve got answers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-8 sm:p-12 text-center text-white">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

            <div className="relative">
              <Rocket className="w-12 h-12 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Start Your Journey Today
              </h2>
              <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
                Stop random problem solving. Start structured training. Join 2,500+
                students climbing the ratings ladder.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
                onClick={() => {
                  document
                    .querySelector('#pricing-cards')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 text-center text-sm text-muted-foreground">
        <p>Secured by Razorpay · 7-day refund policy on eligible purchases</p>
        <p className="text-primary mt-1 font-medium">
          AlgoRise — Elite Competitive Programming Training
        </p>
      </footer>
    </main>
  );
}
