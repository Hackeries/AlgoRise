'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Clock, Lightbulb, TrendingUp, CheckCircle2, SkipForward } from 'lucide-react';

/**
 * Metrics strip showing accuracy, avg time, hints used.
 * 
 * TODO: Extend with charts using recharts
 */

interface SessionMetrics {
  totalProblems: number;
  solvedCount: number;
  skippedCount: number;
  hintsUsed: number;
  accuracy: number;
  avgTimePerProblemMs: number;
  totalTimeMs: number;
}

interface MetricsStripProps {
  metrics: SessionMetrics;
  currentProblemIndex: number;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

function formatAvgTime(ms: number): string {
  if (ms === 0) return '-';
  const seconds = Math.round(ms / 1000);
  return `${seconds}s`;
}

export function MetricsStrip({ metrics, currentProblemIndex }: MetricsStripProps) {
  const progressPercent = (currentProblemIndex / metrics.totalProblems) * 100;
  const accuracyPercent = metrics.accuracy * 100;

  return (
    <Card>
      <CardContent className="py-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {/* Progress */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Progress
              </span>
              <span className="text-xs font-medium">
                {currentProblemIndex}/{metrics.totalProblems}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Accuracy */}
          <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              Accuracy
            </div>
            <div className="text-lg font-bold text-green-500">
              {accuracyPercent.toFixed(0)}%
            </div>
          </div>

          {/* Solved */}
          <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              Solved
            </div>
            <div className="text-lg font-bold text-blue-500">
              {metrics.solvedCount}
            </div>
          </div>

          {/* Avg Time */}
          <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Avg Time
            </div>
            <div className="text-lg font-bold">
              {formatAvgTime(metrics.avgTimePerProblemMs)}
            </div>
          </div>

          {/* Hints Used */}
          <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              Hints
            </div>
            <div className="text-lg font-bold text-yellow-500">
              {metrics.hintsUsed}
            </div>
          </div>
        </div>

        {/* Total Session Time */}
        <div className="mt-3 text-center text-xs text-muted-foreground">
          Session Time: {formatTime(metrics.totalTimeMs || Date.now() - (Date.now() - metrics.totalTimeMs))}
        </div>
      </CardContent>
    </Card>
  );
}
