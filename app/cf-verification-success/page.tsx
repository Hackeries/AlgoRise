'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  TrendingUp,
  Target,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useCFVerification } from '@/lib/context/cf-verification';
import { toast } from 'react-toastify';

interface UserStats {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  problemsSolved?: number;
  contestsParticipated?: number;
}

export default function VerificationSuccessPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setVerificationData } = useCFVerification();

  useEffect(() => {
    const handle = searchParams.get('handle');
    const rating = searchParams.get('rating');
    const maxRating = searchParams.get('maxRating');
    const rank = searchParams.get('rank');

    if (handle && rating && maxRating && rank) {
      // Store verification status using global context
      const verificationData = {
        handle,
        rating: parseInt(rating),
        maxRating: parseInt(maxRating),
        rank,
        verifiedAt: new Date().toISOString(),
      };
      setVerificationData(verificationData);

      // Get additional user statistics
      fetchUserStats(handle, {
        handle,
        rating: parseInt(rating),
        maxRating: parseInt(maxRating),
        rank,
      });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

const fetchUserStats = async (
  handle: string,
  basicStats: Partial<UserStats>
) => {
  try {
    const submissionsResponse = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`
    );
    const submissionsData = await submissionsResponse.json();

    let problemsSolved = 0;
    const solvedProblems = new Set();

    if (submissionsData.status === 'OK') {
      submissionsData.result.forEach((submission: any) => {
        if (submission.verdict === 'OK') {
          const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
          solvedProblems.add(problemKey);
        }
      });
      problemsSolved = solvedProblems.size;
    }

    const ratingResponse = await fetch(
      `https://codeforces.com/api/user.rating?handle=${handle}`
    );
    const ratingData = await ratingResponse.json();
    const contestsParticipated =
      ratingData.status === 'OK' ? ratingData.result.length : 0;

    setUserStats({
      ...(basicStats as UserStats),
      problemsSolved,
      contestsParticipated,
    });

    toast.success(`Verification complete! Welcome, ${handle}.`, {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'dark',
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    setUserStats(basicStats as UserStats);
    toast.error('Failed to fetch user stats. Showing basic info.', {
      position: 'bottom-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'dark',
    });
  } finally {
    setLoading(false);
  }
};


  const generateAdaptiveSheet = () => {
    if (!userStats) return;

    const minRating = Math.max(800, userStats.rating - 100);
    const maxRating = userStats.rating + 200;

    router.push(
      `/adaptive-sheet?handle=${userStats.handle}&minRating=${minRating}&maxRating=${maxRating}`
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md bg-slate-800/50 border-slate-700'>
          <CardContent className='p-6 text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-white/60'>Loading your stats...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md bg-slate-800/50 border-slate-700'>
          <CardContent className='p-6 text-center'>
            <p className='text-white/60 mb-4'>Verification data not found</p>
            <Link href='/auth/login'>
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl bg-slate-800/50 border-slate-700'>
        <CardHeader className='text-center pb-4'>
          <div className='flex justify-center mb-4'>
            <div className='bg-green-500/20 p-3 rounded-full'>
              <CheckCircle className='w-8 h-8 text-green-500' />
            </div>
          </div>
          <CardTitle className='text-2xl font-bold text-white mb-2'>
            Verification Complete!
          </CardTitle>
          <CardDescription className='text-slate-300'>
            Your Codeforces account has been successfully verified
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* User Handle */}
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-white mb-2'>
              Welcome, {userStats.handle}!
            </h3>
            <Badge variant='outline' className='text-sm'>
              {userStats.rank}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-slate-700/50 p-4 rounded-lg text-center'>
              <TrendingUp className='w-6 h-6 text-blue-500 mx-auto mb-2' />
              <div className='text-xl font-bold text-white'>
                {userStats.rating}
              </div>
              <div className='text-sm text-slate-400'>Current Rating</div>
            </div>

            <div className='bg-slate-700/50 p-4 rounded-lg text-center'>
              <Target className='w-6 h-6 text-green-500 mx-auto mb-2' />
              <div className='text-xl font-bold text-white'>
                {userStats.maxRating}
              </div>
              <div className='text-sm text-slate-400'>Max Rating</div>
            </div>

            <div className='bg-slate-700/50 p-4 rounded-lg text-center'>
              <BookOpen className='w-6 h-6 text-purple-500 mx-auto mb-2' />
              <div className='text-xl font-bold text-white'>
                {userStats.problemsSolved || 0}
              </div>
              <div className='text-sm text-slate-400'>Problems Solved</div>
            </div>

            <div className='bg-slate-700/50 p-4 rounded-lg text-center'>
              <CheckCircle className='w-6 h-6 text-orange-500 mx-auto mb-2' />
              <div className='text-xl font-bold text-white'>
                {userStats.contestsParticipated || 0}
              </div>
              <div className='text-sm text-slate-400'>Contests</div>
            </div>
          </div>

          {/* Adaptive Sheet Recommendation */}
          <div className='bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/20'>
            <h4 className='text-lg font-semibold text-white mb-2'>
              Ready to Practice?
            </h4>
            <p className='text-slate-300 mb-4'>
              Get personalized problem recommendations based on your current
              rating ({userStats.rating}). We'll suggest problems from{' '}
              {Math.max(800, userStats.rating - 100)} to{' '}
              {userStats.rating + 200} difficulty.
            </p>
            <Button
              onClick={generateAdaptiveSheet}
              className='w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            >
              Generate Adaptive Sheet
              <ArrowRight className='w-4 h-4 ml-2' />
            </Button>
          </div>

          {/* Navigation Buttons */}
          <div className='flex gap-4'>
            <Link href='/dashboard' className='flex-1'>
              <Button variant='outline' className='w-full'>
                Go to Dashboard
              </Button>
            </Link>
            <Link href='/train' className='flex-1'>
              <Button variant='outline' className='w-full'>
                Start Training
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
