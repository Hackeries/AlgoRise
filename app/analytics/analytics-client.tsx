'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy,
  Target,
  Flame,
  BarChart3,
  User,
  TrendingUp,
  TrendingDown,
  Zap,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Code2,
  Brain,
  Calendar,
  Star,
  Shield,
  ChevronRight,
  Play,
  Lock,
  Users,
  LineChart,
} from 'lucide-react';
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger';
import { useCFVerification } from '@/lib/context/cf-verification';
import { useAuth } from '@/lib/auth/context';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const CPAnalyticsDashboard = dynamic(
  () =>
    import('@/components/analytics/cp-analytics-dashboard').then(
      m => m.CPAnalyticsDashboard
    ),
  {
    ssr: false,
    loading: () => <AnalyticsDashboardSkeleton />,
  }
);

function AnimatedCounter({
  value,
  duration = 2000,
  suffix = '',
  prefix = '',
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const countRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      countRef.current = Math.floor(easeOut * value);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    return () => {
      startTimeRef.current = null;
    };
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function AnalyticsDashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className='glass-card'>
            <CardContent className='p-6'>
              <Skeleton className='h-4 w-24 mb-3' />
              <Skeleton className='h-8 w-16 mb-2' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Skeleton className='h-[400px] rounded-xl' />
        </div>
        <div>
          <Skeleton className='h-[400px] rounded-xl' />
        </div>
      </div>
    </div>
  );
}

function FloatingOrb({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`absolute rounded-full blur-3xl animate-pulse opacity-30 ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function NotLoggedInState() {
  return (
    <main className='flex-1 relative overflow-hidden'>
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5' />
        <FloatingOrb className='top-20 left-10 w-72 h-72 bg-primary' delay={0} />
        <FloatingOrb
          className='top-40 right-20 w-96 h-96 bg-accent'
          delay={1}
        />
        <FloatingOrb
          className='bottom-20 left-1/3 w-80 h-80 bg-blue-500'
          delay={2}
        />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]' />
      </div>

      <div className='max-w-6xl mx-auto px-6 py-12'>
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6'>
            <Sparkles className='h-4 w-4 text-primary' />
            <span className='text-sm font-medium text-primary'>
              AI-Powered Analytics
            </span>
          </div>

          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6'>
            <span className='gradient-text'>Track Your Progress</span>
            <br />
            <span className='text-foreground'>Like Never Before</span>
          </h1>

          <p className='text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8'>
            Get deep insights into your competitive programming journey with
            personalized analytics, progress tracking, and AI-driven
            recommendations.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-12'>
            <Button
              asChild
              size='lg'
              className='group relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6 shadow-lg shadow-primary/25'
            >
              <Link href='/auth/sign-up'>
                Get Started Free
                <ArrowRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='text-lg px-8 py-6 border-2'
            >
              <Link href='/auth/login'>
                <Play className='mr-2 h-5 w-5' />
                Sign In
              </Link>
            </Button>
          </div>

          <div className='flex items-center justify-center gap-8 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span>Free forever</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span>No credit card</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span>Setup in 2 min</span>
            </div>
          </div>
        </div>

        <div className='relative mb-20'>
          <div className='absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none' />
          <div className='glass-intense rounded-2xl border border-border/50 p-2 shadow-2xl'>
            <div className='bg-muted/30 rounded-xl p-6 relative overflow-hidden'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-3 h-3 rounded-full bg-red-500' />
                <div className='w-3 h-3 rounded-full bg-yellow-500' />
                <div className='w-3 h-3 rounded-full bg-green-500' />
                <span className='ml-4 text-xs text-muted-foreground'>
                  Analytics Dashboard Preview
                </span>
              </div>

              <div className='grid grid-cols-4 gap-4 mb-6'>
                {[
                  {
                    label: 'Rating',
                    value: '1847',
                    change: '+127',
                    color: 'text-cyan-500',
                  },
                  {
                    label: 'Problems',
                    value: '342',
                    change: '+23',
                    color: 'text-green-500',
                  },
                  {
                    label: 'Contests',
                    value: '45',
                    change: '+3',
                    color: 'text-purple-500',
                  },
                  {
                    label: 'Streak',
                    value: '12',
                    suffix: ' days',
                    color: 'text-orange-500',
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className='bg-background/50 rounded-lg p-4 border border-border/50'
                  >
                    <div className='text-xs text-muted-foreground mb-1'>
                      {stat.label}
                    </div>
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                      {stat.suffix}
                    </div>
                    {stat.change && (
                      <div className='text-xs text-green-500 flex items-center gap-1'>
                        <TrendingUp className='h-3 w-3' />
                        {stat.change}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div className='col-span-2 bg-background/50 rounded-lg p-4 border border-border/50 h-48'>
                  <div className='text-sm font-medium mb-4'>
                    Rating Progress
                  </div>
                  <div className='flex items-end justify-between h-32 px-4'>
                    {[40, 55, 45, 60, 75, 65, 80, 85, 70, 90, 95, 100].map(
                      (h, i) => (
                        <div
                          key={i}
                          className='w-4 bg-gradient-to-t from-primary to-accent rounded-t opacity-70'
                          style={{ height: `${h}%` }}
                        />
                      )
                    )}
                  </div>
                </div>
                <div className='bg-background/50 rounded-lg p-4 border border-border/50 h-48'>
                  <div className='text-sm font-medium mb-4'>Top Topics</div>
                  <div className='space-y-3'>
                    {[
                      { name: 'DP', pct: 85 },
                      { name: 'Graphs', pct: 72 },
                      { name: 'Math', pct: 68 },
                      { name: 'Greedy', pct: 90 },
                    ].map((topic, i) => (
                      <div key={i}>
                        <div className='flex justify-between text-xs mb-1'>
                          <span>{topic.name}</span>
                          <span className='text-muted-foreground'>
                            {topic.pct}%
                          </span>
                        </div>
                        <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-primary rounded-full'
                            style={{ width: `${topic.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className='absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm'>
                <div className='text-center'>
                  <Lock className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                  <p className='text-lg font-medium mb-2'>
                    Sign in to unlock your analytics
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Connect your Codeforces account to see your personalized
                    dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-20'>
          {[
            {
              icon: Trophy,
              title: 'Contest Performance',
              description:
                'Track rating changes, contest history, and performance trends over time',
              color: 'from-yellow-500 to-amber-500',
              borderColor: 'border-l-yellow-500',
            },
            {
              icon: Target,
              title: 'Problem Analytics',
              description:
                'Analyze solved problems by topic, difficulty, and identify weak areas',
              color: 'from-green-500 to-emerald-500',
              borderColor: 'border-l-green-500',
            },
            {
              icon: Brain,
              title: 'AI Recommendations',
              description:
                'Get personalized problem suggestions based on your skill gaps',
              color: 'from-purple-500 to-violet-500',
              borderColor: 'border-l-purple-500',
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className={`glass-card ${feature.borderColor} border-l-4 hover-lift group cursor-default`}
            >
              <CardContent className='p-6'>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} inline-flex mb-4 shadow-lg transition-transform group-hover:scale-110`}
                >
                  <feature.icon className='h-7 w-7 text-white' />
                </div>
                <h4 className='font-semibold mb-2 text-lg'>{feature.title}</h4>
                <p className='text-sm text-muted-foreground'>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='text-center mb-12'>
          <h2 className='text-2xl sm:text-3xl font-bold mb-4'>
            Join Thousands of Competitive Programmers
          </h2>
          <p className='text-muted-foreground mb-8'>
            Track your progress alongside a growing community
          </p>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mb-12'>
          {[
            { value: 10000, suffix: '+', label: 'Problems Tracked', icon: Code2 },
            { value: 5000, suffix: '+', label: 'Active Users', icon: Users },
            { value: 1500, suffix: '+', label: 'Contests Analyzed', icon: Trophy },
            { value: 50000, suffix: '+', label: 'Insights Generated', icon: LineChart },
          ].map((stat, i) => (
            <Card key={i} className='glass-card hover-lift text-center'>
              <CardContent className='p-6'>
                <stat.icon className='h-8 w-8 mx-auto mb-3 text-primary' />
                <div className='text-3xl font-bold gradient-text mb-1'>
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={2500}
                  />
                </div>
                <div className='text-sm text-muted-foreground'>
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='text-center'>
          <Button
            asChild
            size='lg'
            className='bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-12 py-6 shadow-lg shadow-primary/25'
          >
            <Link href='/auth/sign-up'>
              Start Tracking Your Progress
              <ChevronRight className='ml-2 h-5 w-5' />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function CFNotVerifiedState() {
  return (
    <main className='flex-1 relative overflow-hidden'>
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5' />
        <FloatingOrb className='top-20 right-20 w-64 h-64 bg-primary' delay={0} />
        <FloatingOrb
          className='bottom-40 left-20 w-80 h-80 bg-accent'
          delay={1.5}
        />
      </div>

      <div className='max-w-4xl mx-auto px-6 py-12'>
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='flex items-center'>
              <div className='w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold'>
                <CheckCircle2 className='h-5 w-5' />
              </div>
              <div className='w-16 h-1 bg-green-500' />
            </div>
            <div className='flex items-center'>
              <div className='w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold animate-pulse'>
                2
              </div>
              <div className='w-16 h-1 bg-muted' />
            </div>
            <div className='flex items-center'>
              <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold'>
                3
              </div>
            </div>
          </div>
          <div className='flex gap-4 text-sm'>
            <span className='text-green-500 font-medium'>Account Created</span>
            <span className='text-primary font-medium'>
              Verify Codeforces ←
            </span>
            <span className='text-muted-foreground'>View Analytics</span>
          </div>
        </div>

        <div className='text-center mb-10'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6'>
            <Shield className='h-4 w-4 text-primary' />
            <span className='text-sm font-medium text-primary'>
              One More Step
            </span>
          </div>

          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4'>
            <span className='gradient-text'>Connect Your Codeforces</span>
          </h1>

          <p className='text-lg text-muted-foreground max-w-xl mx-auto'>
            Link your Codeforces account to unlock personalized analytics and
            insights tailored to your competitive programming journey.
          </p>
        </div>

        <Card className='glass-intense border-2 border-primary/30 mb-10 overflow-hidden'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10' />
          <CardContent className='p-8 text-center relative'>
            <div className='p-5 rounded-2xl bg-gradient-to-br from-primary to-accent inline-flex mb-6 shadow-xl'>
              <User className='h-14 w-14 text-white' />
            </div>
            <h3 className='text-2xl font-bold mb-3'>
              Verify Your Codeforces Profile
            </h3>
            <p className='text-muted-foreground mb-8 max-w-md mx-auto'>
              This quick verification ensures we can fetch your accurate stats
              and provide personalized recommendations.
            </p>
            <CFVerificationTrigger showTitle={false} compact={true} />
          </CardContent>
        </Card>

        <div className='mb-10'>
          <h3 className='text-xl font-semibold text-center mb-6'>
            What You&apos;ll Unlock
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {[
              {
                icon: TrendingUp,
                title: 'Rating Insights',
                description:
                  'Track your rating progress with detailed analytics',
              },
              {
                icon: Target,
                title: 'Topic Analysis',
                description: 'See which topics you excel at and where to improve',
              },
              {
                icon: Zap,
                title: 'Smart Recommendations',
                description:
                  'Get AI-powered problem suggestions based on your level',
              },
              {
                icon: Calendar,
                title: 'Activity Tracking',
                description:
                  'Monitor your daily practice and maintain streaks',
              },
            ].map((benefit, i) => (
              <Card key={i} className='glass-card hover-lift group'>
                <CardContent className='p-5 flex items-start gap-4'>
                  <div className='p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors'>
                    <benefit.icon className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <h4 className='font-semibold mb-1'>{benefit.title}</h4>
                    <p className='text-sm text-muted-foreground'>
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className='glass-card border-dashed'>
          <CardContent className='p-6'>
            <h4 className='font-semibold mb-4 flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-primary' />
              How Verification Works
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {[
                {
                  step: '1',
                  title: 'Enter Your Handle',
                  description: 'Provide your Codeforces username',
                },
                {
                  step: '2',
                  title: 'Update First Name',
                  description:
                    'Temporarily add a verification code to your CF profile',
                },
                {
                  step: '3',
                  title: 'Verify & Done',
                  description:
                    'Click verify and your analytics will be ready instantly',
                },
              ].map((step, i) => (
                <div key={i} className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0'>
                    {step.step}
                  </div>
                  <div>
                    <h5 className='font-medium mb-1'>{step.title}</h5>
                    <p className='text-sm text-muted-foreground'>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function getRatingColor(rating: number): string {
  if (rating >= 2400) return 'text-red-500';
  if (rating >= 2100) return 'text-orange-500';
  if (rating >= 1900) return 'text-violet-500';
  if (rating >= 1600) return 'text-blue-500';
  if (rating >= 1400) return 'text-cyan-500';
  if (rating >= 1200) return 'text-green-500';
  return 'text-gray-500';
}

function getRatingBadgeColor(rating: number): string {
  if (rating >= 2400) return 'bg-red-500/10 text-red-500 border-red-500/30';
  if (rating >= 2100)
    return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
  if (rating >= 1900)
    return 'bg-violet-500/10 text-violet-500 border-violet-500/30';
  if (rating >= 1600) return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
  if (rating >= 1400) return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30';
  if (rating >= 1200)
    return 'bg-green-500/10 text-green-500 border-green-500/30';
  return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
}

function getRankTitle(rating: number): string {
  if (rating >= 3000) return 'Legendary Grandmaster';
  if (rating >= 2600) return 'International Grandmaster';
  if (rating >= 2400) return 'Grandmaster';
  if (rating >= 2100) return 'Master';
  if (rating >= 1900) return 'Candidate Master';
  if (rating >= 1600) return 'Expert';
  if (rating >= 1400) return 'Specialist';
  if (rating >= 1200) return 'Pupil';
  return 'Newbie';
}

function VerifiedAnalyticsState({
  handle,
  rating,
}: {
  handle: string;
  rating?: number;
}) {
  const displayRating = rating || 1500;
  const rankTitle = getRankTitle(displayRating);

  return (
    <main className='flex-1 p-6 relative min-h-screen'>
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20' />
        <FloatingOrb
          className='top-10 right-10 w-96 h-96 bg-primary/20'
          delay={0}
        />
        <FloatingOrb
          className='bottom-20 left-10 w-72 h-72 bg-accent/20'
          delay={1}
        />
      </div>

      <div className='max-w-7xl mx-auto'>
        <div className='relative overflow-hidden rounded-2xl glass-intense p-6 sm:p-8 mb-8'>
          <div className='absolute inset-0 -z-10'>
            <div className='absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[100px]' />
            <div className='absolute bottom-0 left-0 w-1/2 h-1/2 bg-accent/10 rounded-full blur-[100px]' />
          </div>

          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30'>
                <BarChart3 className='h-8 w-8 text-primary' />
              </div>
              <div>
                <h1 className='text-2xl sm:text-3xl font-bold flex items-center gap-3'>
                  <span className='gradient-text'>Analytics Dashboard</span>
                </h1>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='text-muted-foreground'>Tracking</span>
                  <Badge
                    variant='outline'
                    className={`font-mono font-semibold ${getRatingBadgeColor(displayRating)}`}
                  >
                    {handle}
                  </Badge>
                  <span className='text-muted-foreground'>•</span>
                  <span className={`font-medium ${getRatingColor(displayRating)}`}>
                    {rankTitle}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Button asChild variant='outline' size='sm'>
                <Link
                  href={`https://codeforces.com/profile/${handle}`}
                  target='_blank'
                >
                  View on Codeforces
                </Link>
              </Button>
              <Button asChild size='sm'>
                <Link href='/profile/overview'>My Profile</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          {[
            {
              label: 'Current Rating',
              value: displayRating,
              icon: TrendingUp,
              trend: '+45',
              trendUp: true,
              color: 'from-cyan-500 to-blue-500',
              iconBg: 'bg-cyan-500/10',
              iconColor: 'text-cyan-500',
            },
            {
              label: 'Problems Solved',
              value: '—',
              icon: Target,
              subtitle: 'Loading...',
              color: 'from-green-500 to-emerald-500',
              iconBg: 'bg-green-500/10',
              iconColor: 'text-green-500',
            },
            {
              label: 'Contests',
              value: '—',
              icon: Trophy,
              subtitle: 'Loading...',
              color: 'from-yellow-500 to-amber-500',
              iconBg: 'bg-yellow-500/10',
              iconColor: 'text-yellow-500',
            },
            {
              label: 'Current Streak',
              value: '—',
              icon: Flame,
              subtitle: 'Loading...',
              color: 'from-orange-500 to-red-500',
              iconBg: 'bg-orange-500/10',
              iconColor: 'text-orange-500',
            },
          ].map((stat, i) => (
            <Card key={i} className='glass-card hover-lift group'>
              <CardContent className='p-5'>
                <div className='flex items-start justify-between mb-3'>
                  <div
                    className={`p-2.5 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  {stat.trend && (
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {stat.trendUp ? (
                        <TrendingUp className='h-3.5 w-3.5' />
                      ) : (
                        <TrendingDown className='h-3.5 w-3.5' />
                      )}
                      {stat.trend}
                    </div>
                  )}
                </div>
                <div className='text-2xl font-bold mb-1'>
                  {typeof stat.value === 'number' ? (
                    <span className={getRatingColor(stat.value)}>
                      {stat.value}
                    </span>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {stat.label}
                </div>
                {stat.subtitle && (
                  <div className='text-xs text-muted-foreground/60 mt-1'>
                    {stat.subtitle}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className='glass-card mb-8'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Sparkles className='h-5 w-5 text-primary' />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {[
                {
                  icon: Brain,
                  title: 'Focus Area',
                  description:
                    'Your analytics will show which topics need more practice',
                  color: 'text-purple-500',
                  bg: 'bg-purple-500/10',
                },
                {
                  icon: Award,
                  title: 'Strengths',
                  description:
                    'Discover your strongest problem-solving categories',
                  color: 'text-amber-500',
                  bg: 'bg-amber-500/10',
                },
                {
                  icon: Star,
                  title: 'Next Goal',
                  description: `Reach ${getRankTitle(Math.ceil(displayRating / 100) * 100 + 100)} with targeted practice`,
                  color: 'text-blue-500',
                  bg: 'bg-blue-500/10',
                },
              ].map((insight, i) => (
                <div
                  key={i}
                  className='flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50'
                >
                  <div className={`p-2 rounded-lg ${insight.bg}`}>
                    <insight.icon className={`h-4 w-4 ${insight.color}`} />
                  </div>
                  <div>
                    <h4 className='font-medium text-sm mb-1'>{insight.title}</h4>
                    <p className='text-xs text-muted-foreground'>
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className='space-y-6'>
          <CPAnalyticsDashboard handle={handle} />
        </div>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <main className='flex-1 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-6'>
          <div className='relative'>
            <div className='w-16 h-16 border-4 border-primary/20 rounded-full' />
            <div className='absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin' />
          </div>
          <div className='text-center'>
            <h2 className='text-xl font-semibold mb-2'>Loading Analytics</h2>
            <p className='text-muted-foreground'>
              Preparing your personalized dashboard...
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-primary rounded-full animate-bounce' />
            <div
              className='w-2 h-2 bg-primary rounded-full animate-bounce'
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className='w-2 h-2 bg-primary rounded-full animate-bounce'
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AnalyticsPageClient() {
  const { user, loading } = useAuth();
  const { isVerified, verificationData } = useCFVerification();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return <NotLoggedInState />;
  }

  if (!isVerified) {
    return <CFNotVerifiedState />;
  }

  return (
    <VerifiedAnalyticsState
      handle={verificationData?.handle || ''}
      rating={verificationData?.rating}
    />
  );
}
