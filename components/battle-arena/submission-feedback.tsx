'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertTriangle, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export type SubmissionVerdict = 
  | 'AC'  // Accepted
  | 'WA'  // Wrong Answer
  | 'TLE' // Time Limit Exceeded
  | 'MLE' // Memory Limit Exceeded
  | 'RE'  // Runtime Error
  | 'CE'  // Compilation Error
  | 'PENDING'
  | 'RUNNING';

export interface SubmissionResult {
  verdict: SubmissionVerdict;
  message?: string;
  testCase?: number;
  executionTime?: number;
  memoryUsed?: number;
  points?: number;
  hint?: string;
  expectedOutput?: string;
  actualOutput?: string;
  compileError?: string;
  runtimeError?: string;
}

interface SubmissionFeedbackProps {
  result: SubmissionResult | null;
  isSubmitting: boolean;
}

export function SubmissionFeedback({ result, isSubmitting }: SubmissionFeedbackProps) {
  const getVerdictConfig = (verdict: SubmissionVerdict) => {
    switch (verdict) {
      case 'AC':
        return {
          icon: CheckCircle,
          title: 'Accepted!',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      case 'WA':
        return {
          icon: XCircle,
          title: 'Wrong Answer',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
        };
      case 'TLE':
        return {
          icon: Clock,
          title: 'Time Limit Exceeded',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
        };
      case 'MLE':
        return {
          icon: AlertTriangle,
          title: 'Memory Limit Exceeded',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
        };
      case 'RE':
        return {
          icon: AlertTriangle,
          title: 'Runtime Error',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        };
      case 'CE':
        return {
          icon: Code,
          title: 'Compilation Error',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        };
      case 'PENDING':
      case 'RUNNING':
        return {
          icon: Clock,
          title: 'Running...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Unknown',
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/30',
        };
    }
  };

  const getHintMessage = (verdict: SubmissionVerdict) => {
    switch (verdict) {
      case 'WA':
        return 'Check edge cases, boundary conditions, and sample test cases carefully.';
      case 'TLE':
        return 'Consider optimizing your algorithm or using a more efficient data structure.';
      case 'MLE':
        return 'Try to reduce memory usage or use a more memory-efficient approach.';
      case 'RE':
        return 'Check for array out of bounds, null pointers, or stack overflow.';
      case 'CE':
        return 'Review syntax errors, missing imports, or type mismatches.';
      default:
        return '';
    }
  };

  if (isSubmitting) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Clock className="h-5 w-5 text-blue-400" />
              </motion.div>
              <div>
                <div className="font-semibold text-blue-400">Submitting...</div>
                <div className="text-sm text-blue-300/70">
                  Your solution is being judged
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!result) return null;

  const [showExpectedOutput, setShowExpectedOutput] = useState(false);
  const config = getVerdictConfig(result.verdict);
  const Icon = config.icon;
  const hint = result.hint || getHintMessage(result.verdict);

  // Show expected output toggle for WA verdicts
  const hasOutputComparison = result.verdict === 'WA' && result.expectedOutput && result.actualOutput;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Card className={`${config.bgColor} border ${config.borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              >
                <Icon className={`h-6 w-6 ${config.color} flex-shrink-0`} />
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-xl font-bold ${config.color}`}>
                      {config.title}
                    </h3>
                    {result.verdict === 'AC' && result.points && (
                      <Badge className="bg-green-600 text-white animate-pulse">
                        +{result.points} points
                      </Badge>
                    )}
                  </div>
                </motion.div>

                {/* Message */}
                {result.message && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-sm ${config.color} opacity-90 mb-2`}
                  >
                    {result.message}
                  </motion.div>
                )}

                {/* Test Case Info */}
                {result.testCase && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-sm text-slate-400 mb-2"
                  >
                    Failed on test case #{result.testCase}
                  </motion.div>
                )}

                {/* Execution Stats */}
                {(result.executionTime || result.memoryUsed) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 text-xs text-slate-400 mb-2"
                  >
                    {result.executionTime && (
                      <span>⏱️ {result.executionTime}ms</span>
                    )}
                    {result.memoryUsed && (
                      <span>💾 {result.memoryUsed}KB</span>
                    )}
                  </motion.div>
                )}

                {/* Compilation Error Details */}
                {result.verdict === 'CE' && result.compileError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-3 p-3 rounded-lg bg-slate-800 border border-slate-700"
                  >
                    <div className="text-xs font-semibold text-yellow-300 mb-1">
                      Compilation Output:
                    </div>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                      {result.compileError}
                    </pre>
                  </motion.div>
                )}

                {/* Runtime Error Details */}
                {result.verdict === 'RE' && result.runtimeError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-3 p-3 rounded-lg bg-slate-800 border border-slate-700"
                  >
                    <div className="text-xs font-semibold text-yellow-300 mb-1">
                      Runtime Error:
                    </div>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                      {result.runtimeError}
                    </pre>
                  </motion.div>
                )}

                {/* Expected vs Actual Output (WA only) */}
                {hasOutputComparison && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-3"
                  >
                    <Button
                      onClick={() => setShowExpectedOutput(!showExpectedOutput)}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-800 mb-2"
                    >
                      {showExpectedOutput ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Hide Output Comparison
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show Expected Output
                        </>
                      )}
                    </Button>

                    <AnimatePresence>
                      {showExpectedOutput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                            <div className="text-xs font-semibold text-green-300 mb-1">
                              Expected Output:
                            </div>
                            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                              {result.expectedOutput}
                            </pre>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                            <div className="text-xs font-semibold text-red-300 mb-1">
                              Your Output:
                            </div>
                            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                              {result.actualOutput}
                            </pre>
                          </div>

                          <div className="text-xs text-slate-500 italic">
                            💡 Compare the outputs carefully to spot differences
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Hint */}
                {hint && result.verdict !== 'AC' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className={`mt-3 p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}
                  >
                    <div className="text-xs font-semibold text-slate-300 mb-1">
                      💡 Hint:
                    </div>
                    <div className="text-xs text-slate-400">
                      {hint}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Real-time opponent activity indicator
interface OpponentActivityProps {
  activity: {
    type: 'viewing' | 'submitting' | 'accepted' | 'wrong-answer';
    problem: string;
    timestamp: number;
  };
  opponentName: string;
}

export function OpponentActivity({ activity, opponentName }: OpponentActivityProps) {
  const getActivityConfig = (type: typeof activity.type) => {
    switch (type) {
      case 'viewing':
        return {
          icon: '👀',
          text: 'viewing',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
        };
      case 'submitting':
        return {
          icon: '⬇',
          text: 'submitting',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
        };
      case 'accepted':
        return {
          icon: '✓',
          text: 'solved',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
        };
      case 'wrong-answer':
        return {
          icon: '✗',
          text: 'failed',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
        };
    }
  };

  const config = getActivityConfig(activity.type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      className={`p-3 rounded-lg ${config.bgColor} border border-slate-700`}
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="text-lg">{config.icon}</span>
        </motion.div>
        <div className="flex-1">
          <div className="text-xs text-slate-400">
            {opponentName} is {config.text}
          </div>
          <div className={`text-sm font-semibold ${config.color}`}>
            Problem {activity.problem}
          </div>
        </div>
        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
      </div>
    </motion.div>
  );
}
