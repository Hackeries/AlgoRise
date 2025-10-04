'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Trophy, Target, Calendar, Flame } from 'lucide-react';
import { SummaryCards } from '@/components/analytics/summary-cards';
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap';
import { RatingTrend } from '@/components/analytics/rating-trend';
import { TagAccuracy } from '@/components/analytics/tag-accuracy';
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger';
import CFVerificationDialog from '@/components/auth/cf-verification-dialog';
import { useCFVerification } from '@/lib/context/cf-verification';
import { useAuth } from '@/lib/auth/context';
import useSWR from 'swr';
import Link from 'next/link';
// import HandleComparison from '@/components/analytics/handle-comparison'; // Remove this line
import { HandleComparisonDisplay } from '@/components/analytics/handle-comparison-display';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AnalyticsPageClient() {
  const { user, loading } = useAuth();
  const { isVerified, verificationData } = useCFVerification();
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [suggestedTopics, setSuggestedTopics] = useState<any[]>([]);

  useEffect(() => {
    if (isVerified && verificationData?.handle) {
      const fetchSuggestedTopics = async () => {
        try {
          const response = await fetch(`/api/analytics/problems`);
          const data = await response.json();
          setSuggestedTopics(data || []);
        } catch (error) {
          console.error('Error fetching suggested topics:', error);
        }
      };
      fetchSuggestedTopics();
    }
  }, [isVerified, verificationData]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full p-6 space-y-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-white/70'>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center h-full p-6 space-y-6'>
        <div className='flex flex-col items-center justify-center h-64 space-y-4'>
          <h2 className='text-2xl font-bold text-white'>Please Sign In</h2>
          <p className='text-white/70 text-center max-w-md'>
            You need to sign in to view your analytics and track your
            competitive programming progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className='flex-1 p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-3xl font-bold'>Progress & Analytics</h1>
              <p className='text-muted-foreground'>
                Detailed insights for{' '}
                <Badge variant='secondary'>{verificationData?.handle}</Badge>
                {verificationData?.rating && (
                  <Badge variant='outline' className='ml-2'>
                    Rating: {verificationData.rating}
                  </Badge>
                )}
              </p>
            </div>
            {user && user.verified && (
              <div className='mt-8'>
                {/* <HandleComparison userHandle={user.handle} /> */}
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='topics'>Topics</TabsTrigger>
            <TabsTrigger value='comparison'>Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value='topics' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-5 w-5' />
                  Suggested Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {suggestedTopics.length > 0 ? (
                    suggestedTopics.map(topic => (
                      <Badge
                        key={topic.id}
                        variant='outline'
                        className='cursor-pointer'
                      >
                        {topic.topic} ({topic.difficulty})
                      </Badge>
                    ))
                  ) : (
                    <p className='text-muted-foreground'>
                      No topics to suggest at the moment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='comparison' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Trophy className='h-5 w-5' />
                  Handle Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user && user.verified ? (
                  <HandleComparisonDisplay
                    userHandle={verificationData?.handle || ''}
                  />
                ) : (
                  <p className='text-muted-foreground'>
                    Verify your Codeforces handle to compare with others.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
