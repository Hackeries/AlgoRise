/**
 * useSubscription Hook
 * 
 * Fetches and manages user subscription state.
 * Use this hook to check user's plan and gate features.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  SubscriptionPlanCode,
  UserSubscription,
} from '@/lib/subscriptions/types';
import {
  isSubscriptionActive,
  hasAccessToFeature,
  parseSubscriptionFromProfile,
} from '@/lib/subscriptions/utils';

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  isLoading: boolean;
  isActive: boolean;
  isPremium: boolean;
  hasAccess: (requiredPlan: SubscriptionPlanCode) => boolean;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        // Not authenticated - set to free plan
        setSubscription({
          plan: 'free',
          status: 'active',
          isLifetime: true,
        });
        return;
      }

      // Fetch profile with subscription details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, subscription_start, subscription_end')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Failed to fetch subscription:', profileError);
        setSubscription({
          plan: 'free',
          status: 'active',
          isLifetime: true,
        });
        return;
      }

      const userSubscription = parseSubscriptionFromProfile(profile);
      setSubscription(userSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription({
        plan: 'free',
        status: 'active',
        isLifetime: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isActive = subscription ? isSubscriptionActive(subscription) : false;
  const isPremium = subscription ? subscription.plan !== 'free' : false;

  const hasAccess = (requiredPlan: SubscriptionPlanCode): boolean => {
    if (!subscription) return false;
    if (!isActive) return false;
    return hasAccessToFeature(subscription.plan, requiredPlan);
  };

  return {
    subscription,
    isLoading,
    isActive,
    isPremium,
    hasAccess,
    refresh: fetchSubscription,
  };
}
