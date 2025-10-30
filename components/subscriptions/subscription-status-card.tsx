/**
 * SubscriptionStatusCard Component
 * 
 * Shows user's current subscription status with details.
 * Can be used in dashboard or profile pages.
 */

'use client';

import React from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionBadge } from './subscription-badge';
import { formatPlanName } from '@/lib/subscriptions/utils';
import { Calendar, Crown, Sparkles, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function SubscriptionStatusCard() {
  const { subscription, isLoading, isPremium, isActive } = useSubscription();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isPremium && <Crown className="h-5 w-5 text-primary" />}
            Your Subscription
          </CardTitle>
          <SubscriptionBadge plan={subscription.plan} />
        </div>
        <CardDescription>
          {isPremium
            ? `You have access to ${formatPlanName(subscription.plan)} features`
            : 'Upgrade to unlock premium features'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isPremium && (
          <>
            {subscription.startDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Started: {formatDate(subscription.startDate)}</span>
              </div>
            )}

            {subscription.isLifetime ? (
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Lifetime Access</span>
              </div>
            ) : subscription.endDate ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Expires: {formatDate(subscription.endDate)}</span>
              </div>
            ) : null}

            {!isActive && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Your subscription has expired
                </p>
              </div>
            )}
          </>
        )}

        {!isPremium && (
          <Link href="/pricing" className="block">
            <Button className="w-full" variant="default">
              <Sparkles className="mr-2 h-4 w-4" />
              Explore Plans
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
