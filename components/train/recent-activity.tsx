'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCFVerification } from '@/lib/context/cf-verification';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
interface Submission {
  id: number;
  contestId: number;
  problem: {
    contestId: number;
    index: string;
    name: string;
    rating?: number;
  };
  verdict: string;
  creationTimeSeconds: number;
  timeConsumedMillis: number;
}

export function RecentActivity() {
  const { isVerified, verificationData } = useCFVerification();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSubmissions = async () => {
      if (!verificationData) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://codeforces.com/api/user.status?handle=${verificationData.handle}&from=1&count=10`
        );
        const data = await res.json();
        if (data.status === 'OK') {
          setSubmissions(data.result);
        }
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isVerified) {
      fetchRecentSubmissions();
    }
  }, [isVerified, verificationData]);

  const getVerdictProps = (verdict: string) => {
    switch (true) {
      case verdict === 'OK':
        return {
          label: 'Accepted',
          color: 'bg-green-600/20 text-green-400',
          icon: <CheckCircle2 className='h-4 w-4' />,
        };
      case verdict.includes('WRONG'):
        return {
          label: 'Wrong Answer',
          color: 'bg-red-600/20 text-red-400',
          icon: <XCircle className='h-4 w-4' />,
        };
      default:
        return {
          label: verdict,
          color: 'bg-yellow-600/20 text-yellow-400',
          icon: <AlertTriangle className='h-4 w-4' />,
        };
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  if (!isVerified) return null;

  return (
    <Card className='bg-neutral-900/80 border-gray-800'>
      <CardHeader>
        <CardTitle className='text-xl'>Recent Activity</CardTitle>
        <CardDescription>
          Track your latest submissions and progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-4 p-3 border border-gray-800 rounded-lg'
              >
                <Skeleton className='h-8 w-8 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
              </div>
            ))}
          </div>
        ) : submissions.length > 0 ? (
          <div className='space-y-3'>
            {submissions.map(submission => {
              const verdict = getVerdictProps(submission.verdict);
              return (
                <div
                  key={submission.id}
                  className='flex items-center justify-between p-3 bg-gray-800/20 rounded-lg hover:bg-gray-800/40 transition-all group'
                >
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <div
                      className={`p-2 rounded-lg ${verdict.color} flex items-center justify-center`}
                    >
                      {verdict.icon}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-white font-medium text-sm truncate'>
                        {submission.problem.name}
                      </h4>
                      <div className='flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1'>
                        <span>
                          {submission.problem.contestId}
                          {submission.problem.index}
                        </span>
                        {submission.problem.rating && (
                          <>
                            <span>•</span>
                            <span className='text-blue-400'>
                              {submission.problem.rating}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded ${verdict.color} text-xs font-medium`}
                        >
                          {verdict.label}
                        </span>
                      </div>
                      <div className='flex items-center gap-1 text-xs text-gray-500 mt-1'>
                        <Clock className='h-3 w-3' />
                        <span>
                          {formatTime(submission.creationTimeSeconds)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    asChild
                    className='flex-shrink-0'
                  >
                    <a
                      href={`https://codeforces.com/problemset/problem/${submission.problem.contestId}/${submission.problem.index}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'
                    >
                      <ExternalLink className='h-4 w-4 text-gray-400 group-hover:text-white transition-colors' />
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='text-center py-8 text-gray-400'>
            No recent submissions
          </div>
        )}
      </CardContent>
    </Card>
  );
}
