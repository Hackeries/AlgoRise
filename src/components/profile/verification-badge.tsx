'use client';

import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  verified: boolean;
  handle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Verification badge component for Codeforces handle verification
 * Displays a badge indicating whether a CF handle is verified
 */
export function VerificationBadge({
  verified,
  handle,
  className,
  size = 'md',
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (!verified) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400',
        sizeClasses[size],
        className
      )}
    >
      <CheckCircle2 className={iconSizes[size]} />
      <span>Verified{handle ? ` • ${handle}` : ''}</span>
    </Badge>
  );
}

/**
 * Compact verification badge for inline use
 */
export function CompactVerificationBadge({
  verified,
  className,
}: {
  verified: boolean;
  className?: string;
}) {
  if (!verified) {
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400',
        className
      )}
    >
      <CheckCircle2 className="h-3 w-3" />
      Verified
    </span>
  );
}
