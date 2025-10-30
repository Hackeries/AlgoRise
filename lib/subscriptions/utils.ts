/**
 * Subscription Utility Functions
 */

import {
  SubscriptionPlanCode,
  UserSubscription,
  SUBSCRIPTION_PLANS,
  PLAN_HIERARCHY,
} from './types';

/**
 * Check if a subscription is currently active
 */
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (subscription.status !== 'active') {
    return false;
  }

  // Lifetime plans are always active if status is active
  if (subscription.isLifetime) {
    return true;
  }

  // Check if subscription has expired
  if (subscription.endDate) {
    const endDate = new Date(subscription.endDate);
    return endDate > new Date();
  }

  return true;
}

/**
 * Check if user has access to a specific plan or better
 */
export function hasAccessToFeature(
  userPlan: SubscriptionPlanCode,
  requiredPlan: SubscriptionPlanCode
): boolean {
  const userLevel = PLAN_HIERARCHY[userPlan] ?? 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Get plan details
 */
export function getPlanDetails(planCode: SubscriptionPlanCode) {
  return SUBSCRIPTION_PLANS[planCode];
}

/**
 * Check if plan is a premium plan (not free)
 */
export function isPremiumPlan(planCode: SubscriptionPlanCode): boolean {
  return planCode !== 'free';
}

/**
 * Calculate subscription end date for time-based plans
 */
export function calculateEndDate(
  startDate: Date,
  durationDays: number
): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
}

/**
 * Format plan name for display
 */
export function formatPlanName(planCode: SubscriptionPlanCode): string {
  return SUBSCRIPTION_PLANS[planCode]?.displayName ?? 'Unknown Plan';
}

/**
 * Get all available plans for purchase
 */
export function getAvailablePlans() {
  return Object.values(SUBSCRIPTION_PLANS).filter((plan) => plan.code !== 'free');
}

/**
 * Validate plan code
 */
export function isValidPlanCode(code: string): code is SubscriptionPlanCode {
  return code in SUBSCRIPTION_PLANS;
}

/**
 * Get upgrade suggestions for a user
 */
export function getUpgradeSuggestions(
  currentPlan: SubscriptionPlanCode
): SubscriptionPlanCode[] {
  const currentLevel = PLAN_HIERARCHY[currentPlan] ?? 0;
  return Object.keys(SUBSCRIPTION_PLANS)
    .filter((code) => {
      const planCode = code as SubscriptionPlanCode;
      return (PLAN_HIERARCHY[planCode] ?? 0) > currentLevel;
    }) as SubscriptionPlanCode[];
}

/**
 * Parse subscription from database profile
 */
export function parseSubscriptionFromProfile(profile: {
  subscription_plan?: string;
  subscription_status?: string;
  subscription_start?: string;
  subscription_end?: string;
}): UserSubscription {
  const planCode = (profile.subscription_plan ?? 'free') as SubscriptionPlanCode;
  const plan = SUBSCRIPTION_PLANS[planCode];

  return {
    plan: planCode,
    status: (profile.subscription_status as any) ?? 'active',
    startDate: profile.subscription_start,
    endDate: profile.subscription_end,
    isLifetime: plan?.isLifetime ?? false,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amountInr: number): string {
  return `₹${amountInr}`;
}

/**
 * Get plan badge color for UI
 */
export function getPlanBadgeColor(
  planCode: SubscriptionPlanCode
): string {
  const colors: Record<SubscriptionPlanCode, string> = {
    free: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    'entry-gate': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'core-builder': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    'algorithmic-ascend': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'competitive-forge': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'master-craft': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  };
  return colors[planCode] ?? colors.free;
}
