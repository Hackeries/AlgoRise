'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '@/hooks/use-subscription';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SubscriptionBadge } from './subscription-badge';
import {
  formatPlanName,
  getUpgradeSuggestions,
  getPlanDetails,
} from '@/lib/subscriptions/utils';
import {
  Calendar,
  Crown,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Trophy,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  Star,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SubscriptionPlanCode } from '@/lib/subscriptions/types';

const PLAN_ICONS: Record<SubscriptionPlanCode, React.ReactNode> = {
  free: <Code2 className="w-5 h-5" />,
  'entry-gate': <Zap className="w-5 h-5" />,
  'core-builder': <TrendingUp className="w-5 h-5" />,
  'algorithmic-ascend': <Star className="w-5 h-5" />,
  'competitive-forge': <Flame className="w-5 h-5" />,
  'master-craft': <Crown className="w-5 h-5" />,
};

const PLAN_GRADIENTS: Record<SubscriptionPlanCode, string> = {
  free: 'from-gray-500 to-gray-600',
  'entry-gate': 'from-emerald-500 to-green-600',
  'core-builder': 'from-cyan-500 to-blue-600',
  'algorithmic-ascend': 'from-violet-500 to-purple-600',
  'competitive-forge': 'from-purple-500 to-pink-600',
  'master-craft': 'from-orange-500 to-red-600',
};

const PLAN_BG_GRADIENTS: Record<SubscriptionPlanCode, string> = {
  free: 'from-gray-500/10 to-gray-600/10',
  'entry-gate': 'from-emerald-500/10 to-green-600/10',
  'core-builder': 'from-cyan-500/10 to-blue-600/10',
  'algorithmic-ascend': 'from-violet-500/10 to-purple-600/10',
  'competitive-forge': 'from-purple-500/10 to-pink-600/10',
  'master-craft': 'from-orange-500/10 to-red-600/10',
};

const PLAN_PROBLEM_COUNTS: Record<SubscriptionPlanCode, number> = {
  free: 10,
  'entry-gate': 80,
  'core-builder': 120,
  'algorithmic-ascend': 150,
  'competitive-forge': 150,
  'master-craft': 200,
};

export function SubscriptionStatusCard() {
  const { subscription, isLoading, isPremium, isActive } = useSubscription();

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 mt-2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const planDetails = getPlanDetails(subscription.plan);
  const upgradeSuggestions = getUpgradeSuggestions(subscription.plan);
  const nextUpgrade = upgradeSuggestions[0];
  const nextUpgradeDetails = nextUpgrade ? getPlanDetails(nextUpgrade) : null;
  const problemCount = PLAN_PROBLEM_COUNTS[subscription.plan];
  const solvedProblems = Math.floor(problemCount * 0.35);
  const progressPercent = Math.round((solvedProblems / problemCount) * 100);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const gradient = PLAN_GRADIENTS[subscription.plan];
  const bgGradient = PLAN_BG_GRADIENTS[subscription.plan];
  const icon = PLAN_ICONS[subscription.plan];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-border/50">
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
            gradient
          )}
        />

        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br opacity-5" />

        <CardHeader className={cn('pb-4 bg-gradient-to-br', bgGradient)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg',
                  gradient
                )}
              >
                {icon}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  {formatPlanName(subscription.plan)}
                  {isPremium && isActive && (
                    <Badge
                      variant="outline"
                      className="text-xs border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {isPremium
                    ? 'Lifetime access to all tier features'
                    : 'Upgrade to unlock premium features'}
                </CardDescription>
              </div>
            </div>

            {isPremium && (
              <div className="hidden sm:block">
                <SubscriptionBadge plan={subscription.plan} />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {isPremium && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                    <Code2 className="w-3.5 h-3.5" />
                    Problems Available
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {problemCount}+
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                    <Trophy className="w-3.5 h-3.5" />
                    Solved
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {solvedProblems}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {problemCount - solvedProblems} problems remaining
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {subscription.startDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    <Calendar className="w-3.5 h-3.5" />
                    Started {formatDate(subscription.startDate)}
                  </div>
                )}

                {subscription.isLifetime && (
                  <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    Lifetime Access
                  </div>
                )}

                {!subscription.isLifetime && subscription.endDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    Expires {formatDate(subscription.endDate)}
                  </div>
                )}
              </div>

              {!isActive && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                    <Shield className="w-4 h-4" />
                    Your subscription has expired
                  </div>
                  <p className="text-xs text-destructive/80 mt-1">
                    Renew to continue accessing premium features.
                  </p>
                </div>
              )}
            </>
          )}

          {nextUpgradeDetails && isActive && (
            <div className="pt-2">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br',
                        PLAN_GRADIENTS[nextUpgrade]
                      )}
                    >
                      {PLAN_ICONS[nextUpgrade]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Upgrade to {nextUpgradeDetails.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unlock {PLAN_PROBLEM_COUNTS[nextUpgrade]}+ more problems
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    ₹{nextUpgradeDetails.amountInr}
                  </p>
                </div>
                <Link href="/pricing">
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade Now
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {!isPremium && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-3">
                  You&apos;re on the free plan with limited access. Upgrade to unlock:
                </p>
                <ul className="space-y-2">
                  {[
                    'Full problem library access',
                    'Editorial solutions',
                    'Progress analytics',
                    'Lifetime access',
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/pricing" className="block">
                <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Explore Plans
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {isPremium && isActive && (
            <div className="flex gap-3 pt-2">
              <Link href="/pricing" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  View All Plans
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Manage
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
