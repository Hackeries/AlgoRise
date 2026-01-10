'use client';

import { Button } from '@/components/ui/button';
import { ProblemStage } from './problem/ProblemStage';
import { LogsConsole, type LogEntry } from './logs/LogsConsole';
import { MetricsStrip } from './metrics/MetricsStrip';
import { AdaptiveSidebar } from './adaptive/AdaptiveSidebar';
import { Pause, Play, Flag, Loader2 } from 'lucide-react';

/**
 * Live training panel with problem stage, logs, metrics, and controls.
 */

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  hints_available?: number;
}

interface SessionMetrics {
  totalProblems: number;
  solvedCount: number;
  skippedCount: number;
  hintsUsed: number;
  accuracy: number;
  avgTimePerProblemMs: number;
  totalTimeMs: number;
}

interface TopicStat {
  solved: number;
  attempted: number;
  hintsUsed: number;
}

interface TrainSessionPanelProps {
  sessionId: string;
  status: 'active' | 'paused';
  currentProblem: Problem | null;
  currentProblemIndex: number;
  metrics: SessionMetrics;
  topicStats: Record<string, TopicStat>;
  sessionTopics: string[];
  recommendations: string[];
  logs: LogEntry[];
  hintsEnabled: boolean;
  language: string;
  currentHint: string | null;
  onHint: () => void;
  onSkip: () => void;
  onSubmit: (code: string) => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  isLoading?: boolean;
}

export function TrainSessionPanel({
  status,
  currentProblem,
  currentProblemIndex,
  metrics,
  topicStats,
  sessionTopics,
  recommendations,
  logs,
  hintsEnabled,
  language,
  currentHint,
  onHint,
  onSkip,
  onSubmit,
  onPause,
  onResume,
  onFinish,
  isLoading = false,
}: TrainSessionPanelProps) {
  const isPaused = status === 'paused';

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Problem {currentProblemIndex + 1} of {metrics.totalProblems}
          </span>
          {isPaused && (
            <span className="text-sm text-yellow-500 animate-pulse">
              (Paused)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPaused ? (
            <Button variant="outline" size="sm" onClick={onResume} disabled={isLoading}>
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onPause} disabled={isLoading}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={onFinish}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Flag className="h-4 w-4 mr-1" />
            )}
            Finish
          </Button>
        </div>
      </div>

      {/* Metrics Strip */}
      <MetricsStrip metrics={metrics} currentProblemIndex={currentProblemIndex} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Problem Stage - Main Area */}
        <div className="lg:col-span-3 min-h-[500px]">
          <ProblemStage
            problem={currentProblem}
            hintsEnabled={hintsEnabled}
            hintsUsed={metrics.hintsUsed}
            language={language}
            onHint={onHint}
            onSkip={onSkip}
            onSubmit={onSubmit}
            isLoading={isLoading || isPaused}
            currentHint={currentHint}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdaptiveSidebar
            recommendations={recommendations}
            topicStats={topicStats}
            sessionTopics={sessionTopics}
          />
        </div>
      </div>

      {/* Logs Console */}
      <LogsConsole logs={logs} maxHeight="200px" />
    </div>
  );
}
