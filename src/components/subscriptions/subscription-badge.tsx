/**
 * SubscriptionBadge Component
 * 
 * Displays a badge showing the user's current subscription plan.
 */

import { Badge } from '@/components/ui/badge';
import { SubscriptionPlanCode } from '@/lib/subscriptions/types';
import { formatPlanName, getPlanBadgeColor } from '@/lib/subscriptions/utils';
import { Crown } from 'lucide-react';

interface SubscriptionBadgeProps {
  plan: SubscriptionPlanCode;
  showIcon?: boolean;
  className?: string;
}

export function SubscriptionBadge({
  plan,
  showIcon = true,
  className = '',
}: SubscriptionBadgeProps) {
  const planName = formatPlanName(plan);
  const badgeColor = getPlanBadgeColor(plan);

  return (
    <Badge className={`${badgeColor} ${className}`} variant="secondary">
      {showIcon && plan !== 'free' && <Crown className="mr-1 h-3 w-3" />}
      {planName}
    </Badge>
  );
}
