'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Submission {
  id: string;
  problemId: string;
  verdict: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'PE';
  executionTime: number;
  memory: number;
  submittedAt: string;
  language: string;
}

interface SubmissionsListProps {
  submissions: Submission[];
}

export function SubmissionsList({ submissions }: SubmissionsListProps) {
  const verdictConfig = {
    AC: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      label: 'Accepted',
    },
    WA: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Wrong Answer',
    },
    TLE: {
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      label: 'Time Limit',
    },
    MLE: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      label: 'Memory Limit',
    },
    RE: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-600/10',
      label: 'Runtime Error',
    },
    CE: {
      icon: AlertCircle,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      label: 'Compile Error',
    },
    PE: {
      icon: XCircle,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      label: 'Presentation Error',
    },
  };

  if (submissions.length === 0) {
    return (
      <div className='flex items-center justify-center h-full text-muted-foreground'>
        <p>No submissions yet</p>
      </div>
    );
  }

  return (
    <div className='space-y-2 overflow-y-auto h-full pr-4'>
      {submissions.map(sub => {
        const config = verdictConfig[sub.verdict];
        const Icon = config.icon;

        return (
          <Card key={sub.id} className={`p-3 ${config.bg}`}>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex items-start gap-2 flex-1'>
                <Icon
                  className={`w-5 h-5 ${config.color} mt-0.5 flex-shrink-0`}
                />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <p className='font-semibold text-sm'>
                      Problem {sub.problemId}
                    </p>
                    <Badge variant='outline' className='text-xs'>
                      {sub.language.toUpperCase()}
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {new Date(sub.submittedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className='text-right text-xs text-muted-foreground'>
                <p>{sub.executionTime}ms</p>
                <p>{sub.memory}MB</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
