/**
 * SubscriptionGate Component
 * 
 * Wraps content that requires a specific subscription level.
 * Shows an upgrade prompt if user doesn't have access.
 */

'use client';

import React from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { SubscriptionPlanCode } from '@/lib/subscriptions/types';
import { formatPlanName } from '@/lib/subscriptions/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionGateProps {
  requiredPlan: SubscriptionPlanCode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function SubscriptionGate({
  requiredPlan,
  children,
  fallback,
  showUpgradePrompt = true,
}: SubscriptionGateProps) {
  const { hasAccess, isLoading, isActive } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // User has access
  if (hasAccess(requiredPlan)) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgradePrompt) {
    return (
      <div className="p-8">
        <Alert className="border-primary/50 bg-primary/5">
          <Lock className="h-4 w-4" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              This feature requires a {formatPlanName(requiredPlan)} subscription or higher.
            </p>
            <Link href="/pricing">
              <Button variant="default" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade Now
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
