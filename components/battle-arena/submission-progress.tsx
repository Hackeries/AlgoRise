'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { SubmissionProgress } from '@/hooks/use-submission';

interface SubmissionProgressIndicatorProps {
  progress: SubmissionProgress | null;
  onCancel?: () => void;
}

export function SubmissionProgressIndicator({ 
  progress, 
  onCancel 
}: SubmissionProgressIndicatorProps) {
  if (!progress) return null;

  const getStageConfig = (stage: SubmissionProgress['stage']) => {
    switch (stage) {
      case 'validating':
        return {
          icon: Loader2,
          iconClass: 'text-blue-400 animate-spin',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
        };
      case 'compiling':
        return {
          icon: Loader2,
          iconClass: 'text-yellow-400 animate-spin',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
        };
      case 'running':
        return {
          icon: Loader2,
          iconClass: 'text-purple-400 animate-spin',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          textColor: 'text-purple-400',
        };
      case 'complete':
        return {
          icon: CheckCircle2,
          iconClass: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
        };
      case 'error':
        return {
          icon: XCircle,
          iconClass: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
        };
    }
  };

  const config = getStageConfig(progress.stage);
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Card className={`${config.bgColor} border ${config.borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Animated Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: progress.stage === 'complete' ? 360 : 0 }}
                transition={{ 
                  scale: { type: 'spring', stiffness: 200 },
                  rotate: { duration: 0.5 }
                }}
                className="flex-shrink-0"
              >
                <Icon className={`h-6 w-6 ${config.iconClass}`} />
              </motion.div>

              {/* Content */}
              <div className="flex-1 space-y-3">
                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className={`font-semibold ${config.textColor}`}>
                    {progress.message}
                  </p>
                </motion.div>

                {/* Test Progress (for running stage) */}
                {progress.stage === 'running' && progress.currentTest && progress.totalTests && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Test Case {progress.currentTest} / {progress.totalTests}
                      </span>
                      <span className={config.textColor}>
                        {Math.round((progress.currentTest / progress.totalTests) * 100)}%
                      </span>
                    </div>
                    
                    {/* Animated test case indicators */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: progress.totalTests }).map((_, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0.8, opacity: 0.3 }}
                          animate={{
                            scale: idx < progress.currentTest! ? 1 : 0.8,
                            opacity: idx < progress.currentTest! ? 1 : 0.3,
                            backgroundColor: idx < progress.currentTest! 
                              ? 'rgb(168, 85, 247)' // purple-500
                              : 'rgb(71, 85, 105)' // slate-600
                          }}
                          transition={{ delay: idx * 0.05 }}
                          className="h-2 flex-1 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Progress Bar */}
                {progress.progress !== undefined && progress.stage !== 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Progress 
                      value={progress.progress} 
                      className="h-2"
                    />
                  </motion.div>
                )}

                {/* Cancel Button */}
                {onCancel && progress.stage !== 'complete' && progress.stage !== 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={onCancel}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Cancel Submission
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Stage-specific additional info */}
            {progress.stage === 'compiling' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-3 text-xs text-slate-400 ml-10"
              >
                💡 Tip: Compilation errors? Check for syntax mistakes or missing imports.
              </motion.div>
            )}

            {progress.stage === 'running' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-3 text-xs text-slate-400 ml-10"
              >
                🔍 Your solution is being tested against multiple test cases...
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
