'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCFVerification } from '@/lib/context/cf-verification';
import {
  Clock,
  ExternalLink,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Problem {
  id: string;
  contestId: number;
  index: string;
  name: string;
  rating: number;
}

interface Contest {
  id: string;
  name: string;
  description: string;
  start_time: string;
  duration_minutes: number;
  problems: Problem[];
  status: 'upcoming' | 'live' | 'ended';
  timeRemaining: number;
  max_participants?: number;
  shareUrl: string;
}

type VerdictSimple =
  | 'UNATTEMPTED'
  | 'AC'
  | 'WA'
  | 'TLE'
  | 'RE'
  | 'CE'
  | 'MLE'
  | 'OTHER';
const verdictFromCF = (v?: string): VerdictSimple => {
  switch (v) {
    case 'OK':
      return 'AC';
    case 'WRONG_ANSWER':
      return 'WA';
    case 'TIME_LIMIT_EXCEEDED':
      return 'TLE';
    case 'MEMORY_LIMIT_EXCEEDED':
      return 'MLE';
    case 'RUNTIME_ERROR':
      return 'RE';
    case 'COMPILATION_ERROR':
      return 'CE';
    default:
      return v ? 'OTHER' : 'UNATTEMPTED';
  }
};

export default function ContestParticipationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { verificationData } = useCFVerification();
  const handle = verificationData?.handle;

  const [localTimeRemaining, setLocalTimeRemaining] = useState<number>(0);

  const {
    data: cfData,
    mutate: refreshCF,
    isValidating: cfRefreshing,
  } = useSWR(
    handle
      ? `https://codeforces.com/api/user.status?handle=${encodeURIComponent(
          handle
        )}&from=1&count=100`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data, error, mutate, isLoading } = useSWR<{ contest: Contest }>(
    params.id ? `/api/contests/${params.id}` : null,
    fetcher,
    { refreshInterval: 1000 } // Update every second for real-time timer
  );

  const contest = data?.contest;

  useEffect(() => {
    if (contest?.timeRemaining) {
      setLocalTimeRemaining(contest.timeRemaining);
    }
  }, [contest?.timeRemaining]);

  useEffect(() => {
    if (contest?.status === 'ended' || localTimeRemaining <= 0) {
      // Wait a moment to ensure fullscreen is exited gracefully
      setTimeout(() => {
        router.push(`/contests/${params.id}`);
      }, 500);
    }
  }, [contest?.status, localTimeRemaining, params.id, router]);

  const problemVerdicts = useMemo(() => {
    const map = new Map<string, { verdict: VerdictSimple; ts: number }>();
    const list =
      cfData && cfData.status === 'OK' && Array.isArray(cfData.result)
        ? (cfData.result as any[])
        : [];
    list.forEach(sub => {
      const p = sub?.problem;
      if (!p?.contestId || !p?.index) return;
      const key = `${p.contestId}${p.index}`;
      const ts = sub?.creationTimeSeconds || 0;
      const v: VerdictSimple = verdictFromCF(sub?.verdict);
      const current = map.get(key);
      if (!current || ts > current.ts) {
        map.set(key, { verdict: v, ts });
      }
    });
    return map;
  }, [cfData]);

  useEffect(() => {
    if (!contest || !contest.problems || contest.status !== 'live') return;
    if (problemVerdicts.size === 0) return;

    const saveSubmissions = async () => {
      for (const problem of contest.problems) {
        const key = `${problem.contestId}${problem.index}`;
        const verdict = problemVerdicts.get(key);

        if (verdict && verdict.verdict !== 'UNATTEMPTED') {
          const status = verdict.verdict === 'AC' ? 'solved' : 'failed';

          // Save to database
          try {
            await fetch(`/api/contests/${params.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                problemId: problem.id,
                status,
                penalty: 0, // Can be calculated based on time if needed
              }),
            });
          } catch (err) {
            console.error('Failed to save submission:', err);
          }
        }
      }
    };

    saveSubmissions();
  }, [problemVerdicts, contest, params.id]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen();
    } catch {
      // Exit fullscreen failed - ignore
    }
  };

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen not supported or denied - ignore
      }
    };

    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        router.push('/contests');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [router]);

  if (error) {
    return (
      <div className='min-h-screen bg-red-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-800'>Contest Not Found</h1>
          <p className='text-red-600 mb-4'>
            {error?.message || 'Failed to load contest'}
          </p>
          <Button onClick={() => router.push('/contests')} className='mt-4'>
            Back to Contests
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !contest) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <div className='text-center text-white'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mb-4'></div>
          <p>Loading contest...</p>
        </div>
      </div>
    );
  }

  if (contest.status === 'ended') {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center text-white px-6'>
        <div className='text-center max-w-md'>
          <Trophy className='mx-auto h-16 w-16 text-yellow-500 mb-4' />
          <h1 className='text-2xl font-bold mb-2'>Contest Ended</h1>
          <p className='text-white/70 mb-6'>
            This contest has finished. You can go back to the contests list or
            view the leaderboard and details.
          </p>
          <div className='flex gap-3 justify-center'>
            <Button
              onClick={() => router.push('/contests')}
              className='flex-1 sm:flex-none'
            >
              Back to Contests
            </Button>
            <Button
              onClick={() => router.push(`/contests/${contest.id}`)}
              variant='outline'
              className='flex-1 sm:flex-none'
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (contest.status === 'upcoming') {
    return (
      <div className='min-h-screen bg-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <Clock className='mx-auto h-16 w-16 text-blue-600 mb-4' />
          <h1 className='text-2xl font-bold text-blue-800'>
            Contest Starting Soon
          </h1>
          <p className='text-blue-600 mt-2'>
            Starts at: {new Date(contest.start_time).toLocaleString()}
          </p>
          <Button onClick={() => router.push('/contests')} className='mt-4'>
            Back to Contests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      {/* Header */}
      <div className='bg-gray-800 border-b border-gray-700 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <h1 className='text-xl font-bold'>{contest.name}</h1>
            <Badge
              variant={contest.status === 'live' ? 'default' : 'secondary'}
            >
              {contest.status.toUpperCase()}
            </Badge>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => refreshCF()}
              disabled={!handle || cfRefreshing}
              className='text-white border-gray-600 hover:bg-gray-700 bg-transparent'
              title={
                handle
                  ? `Refresh Codeforces status for ${handle}`
                  : 'Connect your Codeforces handle first'
              }
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${cfRefreshing ? 'animate-spin' : ''}`}
              />
              {cfRefreshing ? 'Refreshing...' : 'Refresh CF Status'}
            </Button>

            {contest.status === 'live' && (
              <div className='flex items-center gap-2 text-green-400'>
                <Clock className='h-4 w-4' />
                <span className='font-mono text-lg'>
                  {formatTime(localTimeRemaining)}
                </span>
              </div>
            )}

            <Button
              variant='outline'
              size='sm'
              onClick={exitFullscreen}
              className='text-white border-gray-600 hover:bg-gray-700 bg-transparent'
            >
              <Maximize2 className='h-4 w-4 mr-2' />
              Exit Fullscreen
            </Button>
          </div>
        </div>
      </div>

      <div className='flex h-[calc(100vh-80px)] overflow-hidden'>
        {/* Problems List */}
        <div className='w-1/2 min-w-0 border-r border-gray-700 p-6 overflow-y-auto'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold'>Problems</h2>
            {!handle && (
              <Badge
                variant='destructive'
                title='Verify your CF handle on Profile to enable status checks'
              >
                Connect Codeforces to enable checks
              </Badge>
            )}
          </div>

          {!contest.problems || contest.problems.length === 0 ? (
            <div className='flex flex-col items-center justify-center text-center h-full text-gray-400'>
              <AlertCircle className='h-8 w-8 mb-2 text-gray-500' />
              <p className='mb-2'>No problems are available yet.</p>
              <p className='text-sm text-gray-500 mb-4'>
                The host may not have added problems or the contest hasn&apos;t
                fully started. Please check back soon.
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => router.push('/contests')}
                >
                  Back to Contests
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              {contest.problems.map(problem => {
                const key = `${problem.contestId}${problem.index}`;
                const status =
                  problemVerdicts.get(key)?.verdict ?? 'UNATTEMPTED';
                const isSolved = status === 'AC';
                const attempted = status !== 'UNATTEMPTED';

                return (
                  <Card
                    key={problem.id}
                    className={`bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors ${
                      isSolved
                        ? 'border-green-500'
                        : attempted
                        ? 'border-red-500'
                        : ''
                    }`}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between gap-3 min-w-0'>
                        <div className='flex items-center gap-3 min-w-0 flex-1'>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              isSolved
                                ? 'bg-green-600'
                                : attempted
                                ? 'bg-red-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            {problem.index}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='font-medium truncate'>
                              {problem.name}
                            </div>
                            <div className='text-xs text-white/60 truncate'>
                              {status === 'UNATTEMPTED'
                                ? 'Unattempted'
                                : `Latest: ${status}`}
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center gap-2 flex-shrink-0'>
                          {isSolved && (
                            <CheckCircle className='h-5 w-5 text-green-500' />
                          )}
                          {attempted && !isSolved && (
                            <XCircle className='h-5 w-5 text-red-500' />
                          )}

                          {/* Open problem directly */}
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={e => {
                              e.stopPropagation();
                              window.open(
                                `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
                                '_blank'
                              );
                            }}
                            title='Open on Codeforces'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </Button>

                          {/* Refresh only this problem */}
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={e => {
                              e.stopPropagation();
                              refreshCF();
                            }}
                            disabled={!handle || cfRefreshing}
                            title={
                              handle
                                ? 'Refresh latest submission'
                                : 'Verify Codeforces handle first'
                            }
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${
                                cfRefreshing ? 'animate-spin' : ''
                              }`}
                            />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Submissions Panel */}
        <div className='w-1/2 min-w-0 p-6 overflow-y-auto'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold'>
              Recent Submissions (Codeforces)
            </h2>
            {handle && (
              <div className='text-xs text-white/60'>Handle: {handle}</div>
            )}
          </div>
          <div className='space-y-3'>
            {(() => {
              const all =
                cfData && cfData.status === 'OK' && Array.isArray(cfData.result)
                  ? (cfData.result as any[])
                  : [];
              const ids = new Set(
                contest.problems.map(p => `${p.contestId}${p.index}`)
              );
              const filtered = all.filter(s => {
                const p = s?.problem;
                return (
                  p?.contestId &&
                  p?.index &&
                  ids.has(`${p.contestId}${p.index}`)
                );
              });
              if (filtered.length === 0) {
                return (
                  <div className='text-gray-400 text-center py-8'>
                    No submissions yet. Solve on Codeforces and hit Refresh.
                  </div>
                );
              }
              return filtered.slice(0, 50).map((s, idx) => {
                const v = verdictFromCF(s?.verdict);
                return (
                  <Card
                    key={`${s?.id}-${idx}`}
                    className='bg-gray-800 border-gray-700'
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between gap-3 min-w-0'>
                        <div className='flex items-center gap-3 min-w-0 flex-1'>
                          <Badge
                            variant={v === 'AC' ? 'default' : 'destructive'}
                            className='flex-shrink-0'
                          >
                            {v}
                          </Badge>
                          <span className='truncate'>
                            {s?.problem?.index}. {s?.problem?.name}
                          </span>
                        </div>
                        <div className='text-sm text-gray-400 flex-shrink-0'>
                          {s?.creationTimeSeconds
                            ? new Date(
                                s.creationTimeSeconds * 1000
                              ).toLocaleTimeString()
                            : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}