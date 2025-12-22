'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Zap, Clock, Target } from 'lucide-react';
import type { MatchResult, ProblemBreakdown } from '@/types/arena';
import { TIER_BADGES, formatEloChange } from '@/types/arena';

interface ResultScreenProps {
  result: MatchResult;
  onContinue: () => void;
}

export function ResultScreen({ result, onContinue }: ResultScreenProps) {
  const isWinner = result.placement === 1;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
          isWinner ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          {isWinner ? (
            <Trophy className="h-12 w-12 text-yellow-500" />
          ) : (
            <Medal className="h-12 w-12 text-gray-500" />
          )}
        </div>
        <h1 className="text-4xl font-bold mb-2">
          {isWinner ? 'Victory!' : 'Match Complete'}
        </h1>
        <p className="text-muted-foreground">
          {isWinner ? 'Congratulations on your win!' : 'Better luck next time!'}
        </p>
      </div>

      {/* ELO Change */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Rating Change</p>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">{result.eloBefore}</span>
                <span className={`text-2xl font-bold ${
                  result.eloChange > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatEloChange(result.eloChange)}
                </span>
                <span className="text-3xl font-bold">{result.eloAfter}</span>
              </div>
            </div>
            {result.newTier && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">New Tier</p>
                <Badge className={TIER_BADGES[result.newTier]} style={{ fontSize: '1.1rem', padding: '0.5rem 1rem' }}>
                  {result.newTier.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Title Earned */}
      {result.titleEarned && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">New Title Earned!</p>
                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                  {result.titleEarned}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Problems Solved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{result.problemsSolved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg. Solve Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.floor(result.averageSolveTime / 60)}:{(result.averageSolveTime % 60).toString().padStart(2, '0')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Streak Achieved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{result.streakAchieved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Problem Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Problem Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.breakdown.map((problem, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    problem.solved ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <span className="text-white font-bold text-sm">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{problem.problemTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {problem.attempts} attempt{problem.attempts !== 1 ? 's' : ''} • 
                      {' '}{Math.floor(problem.timeSpent / 60)}m {problem.timeSpent % 60}s
                    </p>
                  </div>
                </div>
                <Badge variant={problem.solved ? 'default' : 'secondary'}>
                  {problem.solved ? 'Solved' : 'Not Solved'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button onClick={onContinue} size="lg">
          Back to Lobby
        </Button>
      </div>
    </div>
  );
}
