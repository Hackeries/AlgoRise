'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Target,
  Flame,
  BarChart3,
  User,
  TrendingUp,
} from 'lucide-react';
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger';
import { useCFVerification } from '@/lib/context/cf-verification';
import { useAuth } from '@/lib/auth/context';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const CPAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/cp-analytics-dashboard').then(m => m.CPAnalyticsDashboard),
  { ssr: false, loading: () => <div className='h-[600px] animate-pulse rounded-xl border border-border/50 bg-muted/20' /> }
);

export default function AnalyticsPageClient() {
  const { user, loading } = useAuth();
  const { isVerified, verificationData } = useCFVerification();

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full p-6'>
        <div className='flex flex-col items-center justify-center h-64 space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
          <p className='text-muted-foreground'>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className='flex-1 p-6'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex flex-col items-center justify-center min-h-[500px] space-y-8'>
            <div className='text-center'>
              <BarChart3 className='h-16 w-16 mx-auto text-primary/60 mb-4' />
              <h1 className='text-2xl sm:text-3xl font-bold mb-3'>Analytics</h1>
              <p className='text-muted-foreground text-sm max-w-md'>
                Track your competitive programming journey
              </p>
            </div>

            <div className='flex gap-4'>
              <Button
                asChild
                size='lg'
                className='bg-primary hover:bg-primary/90'
              >
                <Link href='/auth/login'>Sign In</Link>
              </Button>
              <Button asChild size='lg' variant='outline'>
                <Link href='/auth/sign-up'>Create Account</Link>
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8'>
              <Card className='border-l-4 border-l-yellow-500'>
                <CardContent className='p-6'>
                  <Trophy className='h-10 w-10 text-yellow-500 mb-4' />
                  <h4 className='font-semibold mb-2 text-lg'>
                    Contest Performance
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    Track your rating progression and contest participation
                    history
                  </p>
                </CardContent>
              </Card>
              <Card className='border-l-4 border-l-green-500'>
                <CardContent className='p-6'>
                  <Target className='h-10 w-10 text-green-500 mb-4' />
                  <h4 className='font-semibold mb-2 text-lg'>
                    Problem Solving Stats
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    Analyze your strengths and weaknesses across different
                    topics
                  </p>
                </CardContent>
              </Card>
              <Card className='border-l-4 border-l-red-500'>
                <CardContent className='p-6'>
                  <Flame className='h-10 w-10 text-red-500 mb-4' />
                  <h4 className='font-semibold mb-2 text-lg'>
                    Activity Tracking
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    Monitor your daily practice habits and maintain streaks
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isVerified) {
    return (
      <main className='flex-1 p-6'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center py-12'>
            <div className='mb-6'>
              <BarChart3 className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
              <h1 className='text-2xl sm:text-3xl font-bold mb-3'>Analytics</h1>
              <p className='text-muted-foreground text-sm mb-6 max-w-md mx-auto'>
                Connect Codeforces for personalized analytics
              </p>
            </div>

            <div className='bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 mb-8 border border-primary/20'>
              <User className='h-16 w-16 mx-auto text-primary mb-4' />
              <h3 className='text-xl font-semibold mb-3'>
                Verify Codeforces Profile
              </h3>
              <p className='text-muted-foreground mb-8 max-w-md mx-auto'>
                Link your Codeforces account to unlock personalized analytics,
                progress tracking, and detailed insights about your competitive
                programming journey.
              </p>
              <CFVerificationTrigger showTitle={false} compact={true} />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <Card className='border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow'>
                <CardContent className='p-6'>
                  <Trophy className='h-10 w-10 text-yellow-500 mb-4' />
                  <h4 className='font-semibold mb-2 text-lg'>
                    Contest Performance
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    Track your rating progression and contest participation
                    history
                  </p>
                </CardContent>
              </Card>
              <Card className='border-l-4 border-l-green-500 hover:shadow-lg transition-shadow'>
                <CardContent className='p-6'>
                  <Target className='h-10 w-10 text-green-500 mb-4' />
                  <h4 className='font-semibold mb-2 text-lg'>
                    Problem Solving Stats
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    Analyze your strengths and weaknesses across different
                    topics
                  </p>
                </CardContent>
              </Card>
              <Card className='border-l-4 border-l-red-500 hover:shadow-lg transition-shadow'>
                <CardContent className='p-6'>
                  <Flame className='h-10 w-10 text-red-500 mb-4' />
                  <h4 className='font-semibold mb-2 text-lg'>
                    Activity Tracking
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    Monitor your daily practice habits and maintain streaks
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='flex-1 p-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Enhanced Hero Section */}
        <div className='relative overflow-hidden rounded-2xl glass-intense p-8 sm:p-10 mb-8 hover-lift'>
          <div className='absolute inset-0 -z-10'>
            <div className='absolute top-0 right-0 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[100px] animate-pulse' />
            <div className='absolute bottom-0 left-0 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[100px] animate-pulse' style={{ animationDelay: '1s' }} />
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <h1 className='text-4xl sm:text-5xl font-bold tracking-tight flex items-center gap-3'>
                <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30'>
                  <TrendingUp className='h-8 w-8 text-blue-500' />
                </div>
                <span className='gradient-text'>Progress & Analytics</span>
              </h1>
              <p className='text-muted-foreground mt-3 text-lg flex items-center gap-2'>
                <span className='font-semibold text-foreground'>Detailed insights for</span>
                <Badge variant='secondary' className='text-base px-3 py-1'>
                  {verificationData?.handle}
                </Badge>
              </p>
            </div>
            <Button asChild variant='outline' size='lg'>
              <Link href='/profile/overview'>View Profile</Link>
            </Button>
          </div>
        </div>

        {verificationData?.handle && (
          <div className='space-y-6'>
            <CPAnalyticsDashboard handle={verificationData.handle} />
          </div>
        )}
      </div>
    </main>
  );
}
