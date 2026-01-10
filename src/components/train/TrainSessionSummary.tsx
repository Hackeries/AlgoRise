'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Clock, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  SkipForward,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

/**
 * Session summary component showing outcomes, topic mastery, and recommendations.
 */

interface SessionMetrics {
  total_problems: number;
  solved_count: number;
  skipped_count: number;
  hints_used: number;
  accuracy: number;
  avg_time_per_problem_ms: number;
  total_time_ms: number;
  topic_stats: Record<string, { solved: number; attempted: number; hintsUsed: number }>;
}

interface SessionSummary {
  session_id: string;
  status: string;
  metrics: SessionMetrics;
  topic_mastery: Record<string, number>;
  recommendations: string[];
  next_steps: string[];
  completed_at: number;
}

interface TrainSessionSummaryProps {
  summary: SessionSummary;
  onNewSession: () => void;
  onViewAnalytics?: () => void;
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

function getMasteryColor(mastery: number): string {
  if (mastery >= 0.8) return 'bg-green-500';
  if (mastery >= 0.5) return 'bg-yellow-500';
  if (mastery >= 0.3) return 'bg-orange-500';
  return 'bg-red-500';
}

function getMasteryLabel(mastery: number): string {
  if (mastery >= 0.8) return 'Strong';
  if (mastery >= 0.5) return 'Developing';
  if (mastery >= 0.3) return 'Needs Work';
  return 'Weak';
}

export function TrainSessionSummary({
  summary,
  onNewSession,
  onViewAnalytics,
}: TrainSessionSummaryProps) {
  const { metrics, topic_mastery, recommendations, next_steps } = summary;
  const accuracyPercent = (metrics.accuracy * 100).toFixed(0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 bg-primary/20 rounded-full w-fit">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Session Complete!</CardTitle>
          <p className="text-muted-foreground">
            Great work! Here&apos;s how you did.
          </p>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Solved
            </div>
            <div className="text-3xl font-bold text-green-500">
              {metrics.solved_count}
            </div>
            <div className="text-xs text-muted-foreground">
              of {metrics.total_problems} problems
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              Accuracy
            </div>
            <div className="text-3xl font-bold text-blue-500">
              {accuracyPercent}%
            </div>
            <div className="text-xs text-muted-foreground">
              success rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              Total Time
            </div>
            <div className="text-3xl font-bold">
              {formatTime(metrics.total_time_ms)}
            </div>
            <div className="text-xs text-muted-foreground">
              avg {formatTime(metrics.avg_time_per_problem_ms)} per problem
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Hints
            </div>
            <div className="text-3xl font-bold text-yellow-500">
              {metrics.hints_used}
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.skipped_count > 0 && (
                <span className="flex items-center justify-center gap-1">
                  <SkipForward className="h-3 w-3" />
                  {metrics.skipped_count} skipped
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Mastery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Topic Mastery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(topic_mastery).map(([topic, mastery]) => (
            <div key={topic} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{topic}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getMasteryColor(mastery).replace('bg-', 'text-')}>
                    {getMasteryLabel(mastery)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {(mastery * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <Progress value={mastery * 100} className={`h-2 [&>div]:${getMasteryColor(mastery)}`} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-yellow-500 flex-shrink-0">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {next_steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary flex-shrink-0">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button size="lg" onClick={onNewSession}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Start New Session
        </Button>
        {onViewAnalytics && (
          <Button variant="outline" size="lg" onClick={onViewAnalytics}>
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        )}
      </div>
    </div>
  );
}
