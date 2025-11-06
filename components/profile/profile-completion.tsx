'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCompletionProps {
  percentage: number;
  completed: string[];
  missing: string[];
  isComplete: boolean;
  showDetails?: boolean;
  className?: string;
}

/**
 * Profile completion display component
 * Shows the user's profile completion percentage with optional details
 */
export function ProfileCompletion({
  percentage,
  completed,
  missing,
  isComplete,
  showDetails = false,
  className,
}: ProfileCompletionProps) {
  const getTierColor = (pct: number): string => {
    if (pct === 100) return 'text-green-600 dark:text-green-400';
    if (pct >= 70) return 'text-blue-600 dark:text-blue-400';
    if (pct >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getProgressColor = (pct: number): string => {
    if (pct === 100) return 'bg-green-600';
    if (pct >= 70) return 'bg-blue-600';
    if (pct >= 40) return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  const getMessage = (): string => {
    if (isComplete) {
      return 'Your profile is 100% complete! 🎉';
    }
    if (percentage >= 70) {
      return `Your profile is ${percentage}% complete. You're almost there!`;
    }
    if (percentage >= 40) {
      return `Your profile is ${percentage}% complete. Add more details to unlock all features.`;
    }
    return `Your profile is ${percentage}% complete. Complete your profile to get the best experience.`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <Trophy className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={cn('font-semibold', getTierColor(percentage))}>
              Profile Completion
            </span>
          </div>
          <span className={cn('text-lg font-bold', getTierColor(percentage))}>
            {percentage}%
          </span>
        </div>
        <Progress
          value={percentage}
          className="h-3"
          indicatorClassName={getProgressColor(percentage)}
        />
        <p className="text-sm text-muted-foreground">{getMessage()}</p>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Completed Items */}
          {completed.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Completed ({completed.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {completed.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Missing Items */}
          {missing.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Missing ({missing.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {missing.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-600">○</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact profile completion display for inline use
 */
export function CompactProfileCompletion({
  percentage,
  className,
}: {
  percentage: number;
  className?: string;
}) {
  const getTierColor = (pct: number): string => {
    if (pct === 100) return 'text-green-600 dark:text-green-400';
    if (pct >= 70) return 'text-blue-600 dark:text-blue-400';
    if (pct >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getProgressColor = (pct: number): string => {
    if (pct === 100) return 'bg-green-600';
    if (pct >= 70) return 'bg-blue-600';
    if (pct >= 40) return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div className="flex-1 min-w-[100px]">
        <Progress
          value={percentage}
          className="h-2"
          indicatorClassName={getProgressColor(percentage)}
        />
      </div>
      <span className={cn('text-sm font-semibold', getTierColor(percentage))}>
        {percentage}%
      </span>
    </div>
  );
}
