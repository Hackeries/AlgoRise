'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Cpu,
  Activity,
} from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface Submission {
  id: string;
  problemId: string;
  verdict: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'PE';
  executionTime: number;
  memory: number;
  submittedAt: string;
  language: string;
  details?: string;
}

interface SubmissionsListProps {
  submissions: Submission[];
}

export function SubmissionsList({ submissions }: SubmissionsListProps) {
  const verdictConfig = {
    AC: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-gradient-to-r from-green-100 to-green-200',
      label: 'Accepted',
    },
    WA: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-gradient-to-r from-red-100 to-red-200',
      label: 'Wrong Answer',
    },
    TLE: {
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-gradient-to-r from-orange-100 to-orange-200',
      label: 'Time Limit Exceeded',
    },
    MLE: {
      icon: Cpu,
      color: 'text-yellow-600',
      bg: 'bg-gradient-to-r from-yellow-100 to-yellow-200',
      label: 'Memory Limit Exceeded',
    },
    RE: {
      icon: XCircle,
      color: 'text-red-700',
      bg: 'bg-gradient-to-r from-red-200 to-red-300',
      label: 'Runtime Error',
    },
    CE: {
      icon: AlertCircle,
      color: 'text-purple-600',
      bg: 'bg-gradient-to-r from-purple-100 to-purple-200',
      label: 'Compile Error',
    },
    PE: {
      icon: XCircle,
      color: 'text-pink-600',
      bg: 'bg-gradient-to-r from-pink-100 to-pink-200',
      label: 'Presentation Error',
    },
  };

  if (!submissions.length) {
    return (
      <div className='flex items-center justify-center h-full text-muted-foreground'>
        <p>No submissions yet</p>
      </div>
    );
  }

  return (
    <div className='space-y-4 overflow-y-auto h-full pr-2'>
      <AnimatePresence>
        {submissions.map(sub => {
          const config = verdictConfig[sub.verdict];
          const Icon = config.icon;

          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`p-4 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl ${config.bg} cursor-pointer`}
              >
                <div className='flex items-start justify-between gap-3'>
                  {/* Left: Verdict + Problem */}
                  <div className='flex items-start gap-3 flex-1'>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icon
                          className={`w-6 h-6 ${config.color} mt-1 flex-shrink-0`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side='top'>{config.label}</TooltipContent>
                    </Tooltip>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1 flex-wrap'>
                        <p className='font-semibold text-sm truncate'>
                          Problem {sub.problemId}
                        </p>
                        <Badge variant='outline' className='text-xs'>
                          {sub.language.toUpperCase()}
                        </Badge>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(sub.submittedAt).toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right: Execution stats */}
                  <div className='flex flex-col items-end text-xs text-muted-foreground gap-1'>
                    <div className='flex items-center gap-1'>
                      <Activity className='w-4 h-4' /> {sub.executionTime} ms
                    </div>
                    <div className='flex items-center gap-1'>
                      <Cpu className='w-4 h-4' /> {sub.memory} MB
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                {sub.details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className='mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono overflow-x-auto'
                  >
                    <pre>{sub.details}</pre>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}