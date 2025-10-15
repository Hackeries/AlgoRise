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
import { Button } from '@/components/ui/button';
import { useCFVerification } from '@/lib/context/cf-verification';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface Problem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
}

export function ProblemRecommendations() {
  const { isVerified, verificationData } = useCFVerification();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    if (!verificationData) return;

    setLoading(true);
    try {
      const userRating = verificationData.rating || 1000;
      const minRating = Math.max(800, userRating - 100);
      const maxRating = userRating + 300;

      const res = await fetch('https://codeforces.com/api/problemset.problems');
      const data = await res.json();

      if (data.status === 'OK') {
        const filtered = data.result.problems
          .filter(
            (p: Problem) =>
              p.rating && p.rating >= minRating && p.rating <= maxRating
          )
          .sort(() => Math.random() - 0.5)
          .slice(0, 20); // fewer cards for better readability

        setProblems(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerified) fetchRecommendations();
  }, [isVerified, verificationData]);

  if (!isVerified) return null;

  return (
    <Card className='bg-neutral-900/90 border-gray-800'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='text-2xl text-white font-bold'>
            Recommended Problems
          </CardTitle>
          <CardDescription>
            Based on your rating{' '}
            <span className='text-blue-400'>
              {verificationData?.rating || 0}
            </span>
          </CardDescription>
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={fetchRecommendations}
          disabled={loading}
          className='text-gray-400 hover:text-white'
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='p-4 border border-gray-800 rounded-lg'>
                <Skeleton className='h-5 w-3/4 mb-2' />
                <Skeleton className='h-4 w-1/2' />
                <Skeleton className='h-3 w-full mt-2' />
              </div>
            ))}
          </div>
        ) : problems.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {problems.map((problem, idx) => (
              <motion.div
                key={`${problem.contestId}${problem.index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <a
                  href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Card className='p-4 border border-gray-800 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80'>
                    <div className='flex flex-col gap-2'>
                      <h4 className='text-white font-semibold truncate group-hover:text-blue-400'>
                        {problem.name}
                      </h4>
                      <div className='flex items-center gap-2 text-sm text-gray-400'>
                        <span>
                          {problem.contestId}
                          {problem.index}
                        </span>
                        {problem.rating && (
                          <>
                            <span>•</span>
                            <span
                              className={`font-medium ${
                                problem.rating >= 1800
                                  ? 'text-red-400'
                                  : 'text-blue-400'
                              }`}
                            >
                              {problem.rating}
                            </span>
                          </>
                        )}
                      </div>
                      <div className='flex flex-wrap gap-1 mt-2'>
                        {problem.tags.slice(0, 3).map(tag => (
                          <Badge
                            key={tag}
                            variant='outline'
                            className='text-xs bg-gray-800/20 text-gray-200'
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='absolute top-2 right-2 text-gray-400 group-hover:text-white'
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-gray-400'>
            No recommendations available
          </div>
        )}
      </CardContent>
    </Card>
  );
}