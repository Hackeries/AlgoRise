/**
 * Subscription Types and Constants for AlgoRise
 */

export type SubscriptionPlanCode =
  | 'free'
  | 'entry-gate'
  | 'core-builder'
  | 'algorithmic-ascend'
  | 'competitive-forge'
  | 'master-craft';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface SubscriptionPlan {
  code: SubscriptionPlanCode;
  name: string;
  displayName: string;
  amountInr: number;
  features: string[];
  isLifetime: boolean;
  durationDays?: number; // undefined for lifetime plans
  popular?: boolean;
}

export interface UserSubscription {
  plan: SubscriptionPlanCode;
  status: SubscriptionStatus;
  startDate?: string;
  endDate?: string;
  isLifetime: boolean;
}

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_name: string;
  plan_code: SubscriptionPlanCode;
  amount: number;
  currency: string;
  order_id: string;
  payment_id?: string;
  signature?: string;
  start_date: string;
  end_date?: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'refunded';
  payment_status: PaymentStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Plan definitions matching the pricing page
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanCode, SubscriptionPlan> =
  {
    free: {
      code: 'free',
      name: 'Free',
      displayName: 'Free Tier',
      amountInr: 0,
      features: ['Basic problem access', 'Limited analytics'],
      isLifetime: true,
    },
    'entry-gate': {
      code: 'entry-gate',
      name: 'Entry Gate',
      displayName: 'Entry Gate',
      amountInr: 49,
      features: [
        '80+ curated problems',
        'Editorial links & detailed tags',
        'Progress tracker',
        'Lifetime access',
      ],
      isLifetime: true,
    },
    'core-builder': {
      code: 'core-builder',
      name: 'Core Builder',
      displayName: 'Core Builder',
      amountInr: 99,
      features: [
        '120+ CF/AtCoder mid-level problems',
        'Mini-contests & speed tracking',
        'Editorial solutions',
        'Lifetime access',
      ],
      isLifetime: true,
    },
    'algorithmic-ascend': {
      code: 'algorithmic-ascend',
      name: 'Algorithmic Ascend',
      displayName: 'Algorithmic Ascend',
      amountInr: 169,
      features: [
        '150+ problems with hints',
        'Endurance tracker & leaderboard',
        'Topic mastery analytics',
        'Lifetime access',
      ],
      isLifetime: true,
      popular: true,
    },
    'competitive-forge': {
      code: 'competitive-forge',
      name: 'Competitive Forge',
      displayName: 'Competitive Forge',
      amountInr: 259,
      features: [
        '150+ ICPC/CF Div1 problems',
        'Topic mastery analytics',
        'Private elite forum',
        'Lifetime access',
      ],
      isLifetime: true,
    },
    'master-craft': {
      code: 'master-craft',
      name: 'Master Craft',
      displayName: 'Master Craft',
      amountInr: 419,
      features: [
        '200+ elite problems',
        'Live analysis & No-Editorial Mode',
        'Private elite forum',
        'Lifetime access',
      ],
      isLifetime: true,
    },
  };

// Plan hierarchy for upgrade checks
export const PLAN_HIERARCHY: Record<SubscriptionPlanCode, number> = {
  free: 0,
  'entry-gate': 1,
  'core-builder': 2,
  'algorithmic-ascend': 3,
  'competitive-forge': 4,
  'master-craft': 5,
};
