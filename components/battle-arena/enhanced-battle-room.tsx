'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Trophy,
  User,
  ExternalLink
} from 'lucide-react';
import CodeEditor from './code-editor';

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
  }>;
}

interface BattleRoomLayoutProps {
  battleId: string;
  userId: string;
  opponentName: string;
  userName: string;
  problems: Problem[];
  timeRemaining: number;
  mode: '1v1' | '3v3';
}

export function EnhancedBattleRoom({
  battleId,
  userId,
  opponentName,
  userName,
  problems: initialProblems,
  timeRemaining: initialTime,
  mode
}: BattleRoomLayoutProps) {
  const router = useRouter();
  const [selectedProblem, setSelectedProblem] = useState<Problem>(initialProblems[0]);
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    verdict: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE' | null;
    message: string;
    testCase?: number;
  } | null>(null);
  
  const [opponentProgress, setOpponentProgress] = useState<OpponentProgress>({
    problemsSolved: 0,
    timeElapsed: 0,
    penalty: 0,
    currentActivity: null,
    recentSubmissions: []
  });

  // Timer countdown
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

  const getVerdictColor = (verdict: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE' | null) => {
    switch (verdict) {
      case 'AC':
        return 'text-green-400 border-green-500 bg-green-500/10';
      case 'WA':
        return 'text-red-400 border-red-500 bg-red-500/10';
      case 'TLE':
        return 'text-orange-400 border-orange-500 bg-orange-500/10';
      case 'RE':
      case 'CE':
        return 'text-yellow-400 border-yellow-500 bg-yellow-500/10';
      default:
        return '';
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    // Simulate submission (replace with actual API call)
    setTimeout(() => {
      const verdicts: Array<'AC' | 'WA' | 'TLE' | 'RE' | 'CE'> = ['AC', 'WA', 'TLE', 'RE', 'CE'];
      const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
      
      setSubmissionResult({
        verdict: randomVerdict,
        message: randomVerdict === 'AC' 
          ? 'Accepted! +50 points' 
          : randomVerdict === 'WA'
          ? 'Wrong Answer on test case 5. Check edge cases.'
          : randomVerdict === 'TLE'
          ? 'Time Limit Exceeded. Optimize your solution.'
          : randomVerdict === 'CE'
          ? 'Compilation Error: Missing semicolon at line 15'
          : 'Runtime Error: Segmentation fault',
        testCase: randomVerdict === 'WA' ? 5 : undefined
      });

      if (randomVerdict === 'AC') {
        setProblems((prev) =>
          prev.map((p) =>
            p.id === selectedProblem.id ? { ...p, status: 'accepted' } : p
          )
        );
      } else {
        setProblems((prev) =>
          prev.map((p) =>
            p.id === selectedProblem.id ? { ...p, status: 'wrong-answer' } : p
          )
        );
      }

      setIsSubmitting(false);
    }, 2000);
  };

  const handleRunTests = () => {
    // Simulate running test cases
    alert('Running test cases...');
  };

  const handleQuitBattle = () => {
    if (confirm('Are you sure you want to quit? This will count as a loss.')) {
      router.push('/battle-arena');
    }
  };

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
                borderColor: timeRemaining < 300 ? ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.6)', 'rgba(239, 68, 68, 0.3)'] : 'rgba(249, 115, 22, 0.3)'
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
                onClick={() => setSelectedProblem(problem)}
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
                  <h2 className="text-xl font-bold text-blue-300">
                    {selectedProblem.name}
                  </h2>
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
              <CardContent className="p-0 h-full">
                <CodeEditor
                  battleId={battleId}
                  roundId={selectedProblem.id}
                  onSubmit={handleSubmit}
                  showSubmitButton={true}
                />
              </CardContent>
            </Card>

            {/* Submission Controls */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>

                  <Button
                    onClick={handleRunTests}
                    variant="outline"
                    className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Tests
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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

                  <Button
                    variant="outline"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    Change Problem
                  </Button>
                </div>

                {/* Submission Result */}
                <AnimatePresence>
                  {submissionResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-3 p-4 border rounded-lg ${getVerdictColor(submissionResult.verdict)}`}
                    >
                      <div className="flex items-start gap-3">
                        {submissionResult.verdict === 'AC' ? (
                          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold text-lg mb-1">
                            {submissionResult.verdict}
                          </div>
                          <div className="text-sm opacity-90">
                            {submissionResult.message}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Right: Opponent Progress & Stats (1/3 width on desktop) */}
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
                    <span className="text-2xl font-bold text-red-400">
                      {opponentProgress.problemsSolved}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Time Elapsed</span>
                    <span className="text-lg font-semibold text-orange-400">
                      {formatTime(opponentProgress.timeElapsed)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Penalty</span>
                    <span className="text-lg font-semibold text-yellow-400">
                      {opponentProgress.penalty}
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

            {/* Recent Submissions Feed */}
            <Card className="flex-1 bg-slate-900/50 border-slate-700">
              <CardContent className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-bold text-blue-300 mb-4">Your Submission History</h3>
                <ScrollArea className="flex-1">
                  <div className="space-y-2">
                    {opponentProgress.recentSubmissions.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">
                        No submissions yet
                      </p>
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
                            <Badge className={`${
                              sub.verdict === 'AC' ? 'bg-green-500' :
                              sub.verdict === 'WA' ? 'bg-red-500' :
                              sub.verdict === 'TLE' ? 'bg-orange-500' :
                              'bg-yellow-500'
                            } text-white`}>
                              {sub.verdict}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(sub.timestamp).toLocaleTimeString()}
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
