'use client';

/**
 * PART 5: ENHANCED BATTLE ROOM WITH REAL-TIME SYNCHRONIZATION
 * 
 * Integrates all real-time features:
 * - Connection status monitoring with reconnection
 * - Live opponent activity tracking
 * - Race condition prevention for submissions
 * - Typing indicators
 * - Real-time verdict broadcasting
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Code,
  Play,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  ExternalLink,
  MessageSquare,
  Radio,
} from 'lucide-react';
import CodeEditor from './code-editor';
import { SubmissionProgressIndicator } from './submission-progress';
import { SubmissionFeedback } from './submission-feedback';
import { ConnectionQualityIndicator } from './connection-status-banner';
import { BattleSyncProvider, useBattleSync, useBattleEvent, useOpponentActivity, useTypingIndicator } from './battle-sync-provider';
import { useSubmission } from '@/hooks/use-submission';
import { formatSubmissionTime } from '@/lib/battle/race-condition-prevention';

interface Problem {
  id: string;
  name: string;
  rating: number;
  status: 'unsolved' | 'solving' | 'accepted' | 'wrong-answer';
}

interface OpponentProgress {
  problemsSolved: number;
  timeElapsed: number;
  penalty: number;
  currentActivity: {
    problem: string;
    action: 'viewing' | 'submitting' | 'accepted' | 'wrong-answer';
    timestamp: number;
  } | null;
  recentSubmissions: Array<{
    problemId: string;
    verdict: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE';
    timestamp: number;
    submittedAt?: string; // Server timestamp
  }>;
}

interface BattleRoomLayoutProps {
  battleId: string;
  userId: string;
  opponentId: string;
  opponentName: string;
  userName: string;
  problems: Problem[];
  timeRemaining: number;
  mode: '1v1' | '3v3';
  teamId?: string;
}

// ============================================================================
// INNER COMPONENT (Has access to BattleSync context)
// ============================================================================

function BattleRoomContent({
  battleId,
  userId,
  opponentId,
  opponentName,
  userName,
  problems: initialProblems,
  timeRemaining: initialTime,
  mode,
  teamId,
}: BattleRoomLayoutProps) {
  const router = useRouter();
  const [selectedProblem, setSelectedProblem] = useState<Problem>(initialProblems[0]);
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; message: string; timestamp: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  const [opponentProgress, setOpponentProgress] = useState<OpponentProgress>({
    problemsSolved: 0,
    timeElapsed: 0,
    penalty: 0,
    currentActivity: null,
    recentSubmissions: [],
  });

  // ============================================================================
  // BATTLE SYNC HOOKS
  // ============================================================================

  const {
    connectionState,
    isConnected,
    opponentPresence,
    isOpponentOnline,
    events,
    submitCode,
    updateVerdict,
    broadcastProblemChange,
    sendChatMessage,
    updatePresence,
  } = useBattleSync();

  const opponentActivity = useOpponentActivity();
  const { isOpponentTyping, startTyping } = useTypingIndicator(selectedProblem.id);

  // ============================================================================
  // ENHANCED SUBMISSION HOOK (with race condition prevention)
  // ============================================================================

  const {
    submit,
    cancel,
    isSubmitting,
    progress,
    result,
  } = useSubmission({
    battleId,
    roundId: selectedProblem.id,
    onSuccess: async (submissionResult) => {
      if (submissionResult.success) {
        setProblems((prev) =>
          prev.map((p) =>
            p.id === selectedProblem.id ? { ...p, status: 'accepted' } : p
          )
        );

        // Update verdict with server timestamp (race condition prevention)
        if (submissionResult.submissionId) {
          await updateVerdict(
            submissionResult.submissionId,
            'AC',
            submissionResult.executionTime || 0,
            submissionResult.memory || 0,
            submissionResult.testCasesPassed || 0,
            submissionResult.totalTestCases || 0
          );
        }
      } else {
        setProblems((prev) =>
          prev.map((p) =>
            p.id === selectedProblem.id ? { ...p, status: 'wrong-answer' } : p
          )
        );

        if (submissionResult.submissionId) {
          await updateVerdict(
            submissionResult.submissionId,
            'WA',
            submissionResult.executionTime || 0,
            submissionResult.memory || 0,
            submissionResult.testCasesPassed || 0,
            submissionResult.totalTestCases || 0
          );
        }
      }
    },
    onError: (error) => {
      console.error('Submission error:', error);
      setProblems((prev) =>
        prev.map((p) =>
          p.id === selectedProblem.id ? { ...p, status: 'solving' } : p
        )
      );
    },
  });

  // ============================================================================
  // LISTEN FOR REAL-TIME EVENTS
  // ============================================================================

  // Opponent submitted a problem
  useBattleEvent('submission_started', (event) => {
    if (event.userId === opponentId) {
      const { problemId } = event.data;
      setOpponentProgress((prev) => ({
        ...prev,
        currentActivity: {
          problem: problemId,
          action: 'submitting',
          timestamp: Date.now(),
        },
      }));
    }
  });

  // Opponent got a verdict
  useBattleEvent('submission_verdict', (event) => {
    if (event.userId === opponentId) {
      const { verdict, problemId, submittedAt } = event.data;
      setOpponentProgress((prev) => ({
        ...prev,
        problemsSolved: verdict === 'AC' ? prev.problemsSolved + 1 : prev.problemsSolved,
        currentActivity: {
          problem: problemId,
          action: verdict === 'AC' ? 'accepted' : 'wrong-answer',
          timestamp: Date.now(),
        },
        recentSubmissions: [
          {
            problemId,
            verdict,
            timestamp: Date.now(),
            submittedAt,
          },
          ...prev.recentSubmissions.slice(0, 9), // Keep last 10
        ],
      }));
    }
  });

  // Opponent changed problem
  useBattleEvent('problem_changed', (event) => {
    if (event.userId === opponentId) {
      const { problemId } = event.data;
      setOpponentProgress((prev) => ({
        ...prev,
        currentActivity: {
          problem: problemId,
          action: 'viewing',
          timestamp: Date.now(),
        },
      }));
    }
  });

  // Team chat message (3v3 mode)
  useBattleEvent('chat_message', (event) => {
    const { message } = event.data;
    setChatMessages((prev) => [
      ...prev,
      {
        user: event.userId === userId ? 'You' : 'Teammate',
        message,
        timestamp: event.timestamp,
      },
    ]);
  });

  // Battle ended
  useBattleEvent('battle_ended', (event) => {
    console.log('Battle ended:', event.data);
    // Navigate to results page
    setTimeout(() => {
      router.push(`/battle-arena/replays/${battleId}`);
    }, 3000);
  });

  // ============================================================================
  // TIMER COUNTDOWN
  // ============================================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ============================================================================
  // HANDLE PROBLEM CHANGE
  // ============================================================================

  const handleProblemChange = useCallback(
    async (problem: Problem) => {
      setSelectedProblem(problem);
      await broadcastProblemChange(problem.id);
      await updatePresence('active', problem.id);
    },
    [broadcastProblemChange, updatePresence]
  );

  // ============================================================================
  // HANDLE SUBMISSION
  // ============================================================================

  const handleSubmit = async () => {
    // Mark problem as solving
    setProblems((prev) =>
      prev.map((p) =>
        p.id === selectedProblem.id ? { ...p, status: 'solving' } : p
      )
    );

    // Submit with server timestamp (race condition prevention)
    const submission = await submitCode(selectedProblem.id, code, language);
    console.log('Submitted at:', formatSubmissionTime(submission.submittedAt));

    // Continue with Judge0 submission
    await submit(code, language);
  };

  // ============================================================================
  // HANDLE CHAT
  // ============================================================================

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    await sendChatMessage(chatInput);
    setChatInput('');
  };

  // ============================================================================
  // HANDLE TYPING
  // ============================================================================

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      startTyping();
    },
    [startTyping]
  );

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProblemStatusColor = (status: Problem['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500 text-white';
      case 'wrong-answer':
        return 'bg-red-500 text-white';
      case 'solving':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-slate-600 text-slate-300';
    }
  };

  const getProblemStatusIcon = (status: Problem['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'wrong-answer':
        return <XCircle className="h-4 w-4" />;
      case 'solving':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleQuitBattle = () => {
    if (confirm('Are you sure you want to quit? This will count as a loss.')) {
      router.push('/battle-arena');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20">
        <div className="max-w-[2000px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Opponent vs User */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-red-400" />
                <span className="font-semibold text-red-300">{opponentName}</span>
                {isOpponentOnline ? (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                ) : (
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-2xl font-bold text-slate-500">VS</span>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-blue-300">{userName}</span>
              </div>
            </div>

            {/* Timer */}
            <motion.div
              className="flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg"
              animate={{
                borderColor:
                  timeRemaining < 300
                    ? [
                        'rgba(239, 68, 68, 0.3)',
                        'rgba(239, 68, 68, 0.6)',
                        'rgba(239, 68, 68, 0.3)',
                      ]
                    : 'rgba(249, 115, 22, 0.3)',
              }}
              transition={{ duration: 1, repeat: timeRemaining < 300 ? Infinity : 0 }}
            >
              <Clock className="h-6 w-6 text-orange-400" />
              <span className="text-3xl font-mono font-bold text-orange-300">
                {formatTime(timeRemaining)}
              </span>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ConnectionQualityIndicator connectionState={connectionState} />
              <Button
                onClick={handleQuitBattle}
                variant="outline"
                className="border-red-500/50 text-red-300 hover:bg-red-500/10"
              >
                Quit Battle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Tabs */}
      <div className="bg-slate-900/50 border-b border-blue-500/10">
        <div className="max-w-[2000px] mx-auto px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {problems.map((problem, index) => (
              <Button
                key={problem.id}
                onClick={() => handleProblemChange(problem)}
                variant={selectedProblem.id === problem.id ? 'default' : 'outline'}
                className={`flex items-center gap-2 ${
                  selectedProblem.id === problem.id
                    ? 'bg-blue-600 border-blue-500'
                    : 'border-slate-600 hover:border-blue-500/50'
                }`}
              >
                <span className="font-semibold">Problem {String.fromCharCode(65 + index)}</span>
                <div className={`px-2 py-0.5 rounded text-xs ${getProblemStatusColor(problem.status)}`}>
                  {getProblemStatusIcon(problem.status)}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[2000px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Left: Code Editor (2/3 width on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Problem Description */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-blue-300">{selectedProblem.name}</h2>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                    {selectedProblem.rating}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                  onClick={() => window.open(`https://codeforces.com/problemset/problem/...`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Full Problem
                </Button>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card className="flex-1 bg-slate-900/50 border-slate-700 overflow-hidden">
              <CardContent className="p-0 h-full relative">
                <CodeEditor language={language} value={code} onChange={handleCodeChange} />

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isOpponentTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-2 right-2 px-3 py-1 bg-slate-800/90 border border-slate-600 rounded-full flex items-center gap-2"
                    >
                      <Radio className="h-3 w-3 text-orange-400 animate-pulse" />
                      <span className="text-xs text-slate-300">{opponentName} is typing...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Submission Controls */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    disabled={isSubmitting}
                  >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isConnected}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>

                {/* Submission Progress Indicator */}
                {progress && (
                  <div className="mb-3">
                    <SubmissionProgressIndicator progress={progress} onCancel={isSubmitting ? cancel : undefined} />
                  </div>
                )}

                {/* Submission Feedback */}
                {result && !isSubmitting && <SubmissionFeedback result={result} isSubmitting={false} />}
              </CardContent>
            </Card>
          </div>

          {/* Right: Opponent Progress & Chat */}
          <div className="flex flex-col gap-4">
            {/* Opponent Status */}
            <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-red-400" />
                  <h3 className="text-lg font-bold text-red-300">Opponent Progress</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Problems Solved</span>
                    <span className="text-2xl font-bold text-red-400">{opponentProgress.problemsSolved}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Status</span>
                    <span className="text-sm font-semibold text-orange-400">
                      {opponentActivity.status}
                    </span>
                  </div>
                </div>

                {/* Current Activity */}
                {opponentProgress.currentActivity && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-red-300">Live Activity</span>
                    </div>
                    <div className="text-sm text-slate-300">
                      {opponentProgress.currentActivity.action === 'submitting' && '⬇ Submitting '}
                      {opponentProgress.currentActivity.action === 'accepted' && '✓ Solved '}
                      {opponentProgress.currentActivity.action === 'wrong-answer' && '✗ Failed '}
                      Problem {opponentProgress.currentActivity.problem}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Team Chat (3v3 mode) */}
            {mode === '3v3' && teamId && (
              <Card className="flex-1 bg-slate-900/50 border-slate-700 flex flex-col">
                <CardContent className="p-4 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Team Chat
                  </h3>
                  <ScrollArea className="flex-1 mb-3">
                    <div className="space-y-2">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className="p-2 bg-slate-800/50 rounded">
                          <div className="text-xs text-slate-400">{msg.user}</div>
                          <div className="text-sm text-slate-200">{msg.message}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                      placeholder="Message your team..."
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                    />
                    <Button size="sm" onClick={handleSendChat}>
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Submissions */}
            <Card className="flex-1 bg-slate-900/50 border-slate-700">
              <CardContent className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-bold text-blue-300 mb-4">Recent Submissions</h3>
                <ScrollArea className="flex-1">
                  <div className="space-y-2">
                    {opponentProgress.recentSubmissions.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">No submissions yet</p>
                    ) : (
                      opponentProgress.recentSubmissions.map((sub, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">Problem {sub.problemId}</span>
                            <Badge
                              className={`${
                                sub.verdict === 'AC'
                                  ? 'bg-green-500'
                                  : sub.verdict === 'WA'
                                  ? 'bg-red-500'
                                  : sub.verdict === 'TLE'
                                  ? 'bg-orange-500'
                                  : 'bg-yellow-500'
                              } text-white`}
                            >
                              {sub.verdict}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400">
                            {sub.submittedAt ? formatSubmissionTime(sub.submittedAt) : new Date(sub.timestamp).toLocaleTimeString()}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WRAPPER COMPONENT (Provides BattleSync context)
// ============================================================================

export function EnhancedBattleRoomV3(props: BattleRoomLayoutProps) {
  const router = useRouter();

  return (
    <BattleSyncProvider
      battleId={props.battleId}
      userId={props.userId}
      opponentName={props.opponentName}
      teamId={props.teamId}
      onBattleEnd={(result) => {
        console.log('Battle ended:', result);
        router.push(`/battle-arena/replays/${props.battleId}`);
      }}
      onClaimVictory={() => {
        console.log('Claiming victory due to extended disconnection');
        router.push('/battle-arena');
      }}
      onRestartBattle={() => {
        console.log('Restarting battle');
        router.push('/battle-arena/queue/' + props.mode);
      }}
    >
      <BattleRoomContent {...props} />
    </BattleSyncProvider>
  );
}
