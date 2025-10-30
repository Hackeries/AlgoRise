/**
 * Subscription Module - Barrel Export
 * 
 * Centralized exports for all subscription-related functionality.
 */

// Types
export type {
  SubscriptionPlanCode,
  SubscriptionStatus,
  PaymentStatus,
  SubscriptionPlan,
  UserSubscription,
  SubscriptionRecord,
} from './types';

export { SUBSCRIPTION_PLANS, PLAN_HIERARCHY } from './types';

// Utils
export {
  isSubscriptionActive,
  hasAccessToFeature,
  getPlanDetails,
  isPremiumPlan,
  calculateEndDate,
  formatPlanName,
  getAvailablePlans,
  isValidPlanCode,
  getUpgradeSuggestions,
  parseSubscriptionFromProfile,
  formatCurrency,
  getPlanBadgeColor,
} from './utils';

// Service (for server-side use)
export {
  getUserSubscription,
  createSubscription,
  activateSubscription,
  getSubscriptionByOrderId,
  getUserSubscriptionHistory,
  cancelSubscription,
  recordPaymentEvent,
  markEventProcessed,
} from './service';
