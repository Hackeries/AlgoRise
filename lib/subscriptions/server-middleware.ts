/**
 * Server-side subscription verification middleware
 * 
 * Use this to enforce subscription checks on API routes and server components.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { SubscriptionPlanCode, PLAN_HIERARCHY } from '@/lib/subscriptions/types';

/**
 * Check if user has an active Pro subscription
 */
export async function hasActiveProSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status, subscription_end')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return false;
  }

  // Free plan never has Pro access
  if (profile.subscription_plan === 'free' || !profile.subscription_plan) {
    return false;
  }

  // Must have active status
  if (profile.subscription_status !== 'active') {
    return false;
  }

  // Check expiry (null means lifetime access)
  if (profile.subscription_end) {
    const endDate = new Date(profile.subscription_end);
    if (endDate < new Date()) {
      return false;
    }
  }

  return true;
}

/**
 * Check if user has access to a specific plan level
 */
export async function hasAccessToPlan(
  userId: string,
  requiredPlan: SubscriptionPlanCode
): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status, subscription_end')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return false;
  }

  // Check if subscription is active
  if (profile.subscription_status !== 'active') {
    return false;
  }

  // Check expiry (null means lifetime access)
  if (profile.subscription_end) {
    const endDate = new Date(profile.subscription_end);
    if (endDate < new Date()) {
      return false;
    }
  }

  // Check plan hierarchy
  const userPlanLevel = PLAN_HIERARCHY[profile.subscription_plan as SubscriptionPlanCode] || 0;
  const requiredPlanLevel = PLAN_HIERARCHY[requiredPlan] || 0;

  return userPlanLevel >= requiredPlanLevel;
}

/**
 * Middleware to require Pro subscription for an API route
 */
export async function requireProSubscription(
  request: Request
): Promise<{ authorized: boolean; userId?: string; response?: NextResponse }> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const hasPro = await hasActiveProSubscription(user.id);

  if (!hasPro) {
    return {
      authorized: false,
      userId: user.id,
      response: NextResponse.json(
        {
          error: 'Pro subscription required',
          message: 'This feature requires an active Pro subscription',
          upgrade_url: '/pricing',
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    userId: user.id,
  };
}

/**
 * Middleware to require specific plan level for an API route
 */
export async function requirePlan(
  request: Request,
  requiredPlan: SubscriptionPlanCode
): Promise<{ authorized: boolean; userId?: string; response?: NextResponse }> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const hasAccess = await hasAccessToPlan(user.id, requiredPlan);

  if (!hasAccess) {
    return {
      authorized: false,
      userId: user.id,
      response: NextResponse.json(
        {
          error: 'Insufficient subscription level',
          message: `This feature requires ${requiredPlan} subscription or higher`,
          upgrade_url: '/pricing',
          required_plan: requiredPlan,
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    userId: user.id,
  };
}

/**
 * Get user's subscription details for server-side use
 */
export async function getUserSubscriptionDetails(userId: string) {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status, subscription_start, subscription_end')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  const isActive =
    profile.subscription_status === 'active' &&
    (!profile.subscription_end || new Date(profile.subscription_end) > new Date());

  return {
    plan: profile.subscription_plan as SubscriptionPlanCode,
    status: profile.subscription_status,
    startDate: profile.subscription_start,
    endDate: profile.subscription_end,
    isActive,
    isPro: profile.subscription_plan !== 'free' && isActive,
    isLifetime: !profile.subscription_end,
  };
}
