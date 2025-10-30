'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Play,
  Code,
  RotateCcw,
  Share2,
  Eye,
  Calendar
} from 'lucide-react';

interface ProblemResult {
  id: string;
  name: string;
  solveTime?: number; // in seconds
  attempts: number;
  status: 'solved' | 'attempted' | 'unsolved';
  penalty: number;
  wrongAttempts: number;
}

interface BattleResultsProps {
  battleId: string;
  winner: 'user' | 'opponent' | 'draw';
  userScore: {
    problemsSolved: number;
    penalty: number;
    rating: number;
    ratingChange: number;
  };
  opponentScore: {
    problemsSolved: number;
    penalty: number;
    rating: number;
  };
  userName: string;
  opponentName: string;
  userProblems: ProblemResult[];
  opponentProblems: ProblemResult[];
  battleDuration: number;
  mode: '1v1' | '3v3';
}

export function PostBattleResults({
  battleId,
  winner,
  userScore,
  opponentScore,
  userName,
  opponentName,
  userProblems,
  opponentProblems,
  battleDuration,
  mode
}: BattleResultsProps) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('overview');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getResultColor = () => {
    if (winner === 'user') return 'from-green-900/30 to-emerald-900/30';
    if (winner === 'opponent') return 'from-red-900/30 to-orange-900/30';
    return 'from-blue-900/30 to-cyan-900/30';
  };

  const getResultIcon = () => {
    if (winner === 'user') return '🎉';
    if (winner === 'opponent') return '😢';
    return '🤝';
  };

  const getResultTitle = () => {
    if (winner === 'user') return 'Victory!';
    if (winner === 'opponent') return 'Defeat';
    return 'Draw';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header - Battle Result */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Card className={`bg-gradient-to-br ${getResultColor()} border-2 ${
            winner === 'user' 
              ? 'border-green-500/50' 
              : winner === 'opponent'
              ? 'border-red-500/50'
              : 'border-blue-500/50'
          }`}>
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-8xl mb-4"
              >
                {getResultIcon()}
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-5xl font-black mb-2 ${
                  winner === 'user'
                    ? 'text-green-400'
                    : winner === 'opponent'
                    ? 'text-red-400'
                    : 'text-blue-400'
                }`}
              >
                {getResultTitle()}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-4 mb-4"
              >
                <Badge className={`text-2xl px-6 py-2 ${
                  userScore.ratingChange > 0
                    ? 'bg-green-600'
                    : userScore.ratingChange < 0
                    ? 'bg-red-600'
                    : 'bg-blue-600'
                }`}>
                  {userScore.ratingChange > 0 ? '+' : ''}{userScore.ratingChange} Rating
                </Badge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-slate-300"
              >
                New Rating: <span className="font-bold text-blue-400">{userScore.rating}</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ICPC Scoring Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Trophy className="h-6 w-6 text-yellow-500" />
                ICPC Scoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                {/* User Score */}
                <div className="space-y-4">
                  <div className="text-center pb-3 border-b border-blue-500/30">
                    <div className="text-sm text-slate-400 mb-1">You</div>
                    <div className="text-2xl font-bold text-blue-400">{userName}</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Problems Solved</span>
                      <span className="text-2xl font-bold text-green-400">
                        {userScore.problemsSolved}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Penalty</span>
                      <span className="text-2xl font-bold text-orange-400">
                        {userScore.penalty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opponent Score */}
                <div className="space-y-4">
                  <div className="text-center pb-3 border-b border-red-500/30">
                    <div className="text-sm text-slate-400 mb-1">Opponent</div>
                    <div className="text-2xl font-bold text-red-400">{opponentName}</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Problems Solved</span>
                      <span className="text-2xl font-bold text-green-400">
                        {opponentScore.problemsSolved}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Penalty</span>
                      <span className="text-2xl font-bold text-orange-400">
                        {opponentScore.penalty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Problem Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Target className="h-6 w-6" />
                Problem Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Your Problems */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-300 mb-3">Your Performance</h3>
                      <div className="space-y-2">
                        {userProblems.map((problem) => (
                          <div
                            key={problem.id}
                            className={`p-3 rounded-lg border ${
                              problem.status === 'solved'
                                ? 'bg-green-900/20 border-green-500/30'
                                : problem.status === 'attempted'
                                ? 'bg-yellow-900/20 border-yellow-500/30'
                                : 'bg-slate-800/50 border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {problem.status === 'solved' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : problem.status === 'attempted' ? (
                                  <XCircle className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-slate-600" />
                                )}
                                <span className="font-semibold">{problem.name}</span>
                              </div>
                              {problem.solveTime && (
                                <Badge variant="outline" className="text-blue-400 border-blue-500">
                                  {formatTime(problem.solveTime)}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              {problem.wrongAttempts > 0 && (
                                <span>❌ {problem.wrongAttempts} WA</span>
                              )}
                              <span>Penalty: {problem.penalty}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Opponent Problems */}
                    <div>
                      <h3 className="text-lg font-semibold text-red-300 mb-3">Opponent Performance</h3>
                      <div className="space-y-2">
                        {opponentProblems.map((problem) => (
                          <div
                            key={problem.id}
                            className={`p-3 rounded-lg border ${
                              problem.status === 'solved'
                                ? 'bg-green-900/20 border-green-500/30'
                                : problem.status === 'attempted'
                                ? 'bg-yellow-900/20 border-yellow-500/30'
                                : 'bg-slate-800/50 border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {problem.status === 'solved' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : problem.status === 'attempted' ? (
                                  <XCircle className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-slate-600" />
                                )}
                                <span className="font-semibold">{problem.name}</span>
                              </div>
                              {problem.solveTime && (
                                <Badge variant="outline" className="text-red-400 border-red-500">
                                  {formatTime(problem.solveTime)}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              {problem.wrongAttempts > 0 && (
                                <span>❌ {problem.wrongAttempts} WA</span>
                              )}
                              <span>Penalty: {problem.penalty}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-slate-400">Battle Duration</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {formatTime(battleDuration)}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-slate-400">Accuracy</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {userProblems.length > 0
                          ? Math.round((userScore.problemsSolved / userProblems.filter(p => p.status !== 'unsolved').length) * 100)
                          : 0}%
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-slate-400">Mode</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {mode === '1v1' ? '1v1 Duel' : '3v3 Team'}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Button
            onClick={() => router.push(`/battle-arena/replays/${battleId}`)}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            <Play className="h-4 w-4 mr-2" />
            View Replay
          </Button>

          <Button
            onClick={() => router.push(`/battle-arena/replays/${battleId}?view=code`)}
            variant="outline"
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
          >
            <Code className="h-4 w-4 mr-2" />
            Review Code
          </Button>

          <Button
            onClick={() => router.push('/battle-arena')}
            variant="outline"
            className="border-green-500/30 text-green-300 hover:bg-green-500/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Battle Again
          </Button>

          <Button
            onClick={() => {
              // Share functionality
              alert('Share battle results!');
            }}
            variant="outline"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
