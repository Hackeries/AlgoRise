/**
 * Subscription Service - Database operations for subscription management
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  SubscriptionPlanCode,
  SubscriptionRecord,
  UserSubscription,
} from './types';
import { parseSubscriptionFromProfile } from './utils';

/**
 * Get user's current subscription from profile
 */
export async function getUserSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<UserSubscription | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, subscription_start, subscription_end')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      console.error('Failed to fetch user subscription:', error);
      return null;
    }

    return parseSubscriptionFromProfile(profile);
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Create a new subscription record
 */
export async function createSubscription(
  supabase: SupabaseClient,
  data: {
    userId: string;
    planCode: SubscriptionPlanCode;
    planName: string;
    amount: number;
    currency: string;
    orderId: string;
    startDate: Date;
    endDate?: Date;
    metadata?: Record<string, any>;
  }
): Promise<{ subscription: SubscriptionRecord | null; error: Error | null }> {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: data.userId,
        plan_code: data.planCode,
        plan_name: data.planName,
        amount: Math.round(data.amount * 100), // Convert to paise
        currency: data.currency,
        order_id: data.orderId,
        start_date: data.startDate.toISOString(),
        end_date: data.endDate?.toISOString() || null,
        status: 'pending',
        payment_status: 'pending',
        metadata: data.metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create subscription:', error);
      return { subscription: null, error: new Error(error.message) };
    }

    return { subscription: subscription as SubscriptionRecord, error: null };
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return { subscription: null, error };
  }
}

/**
 * Activate a subscription after successful payment
 */
export async function activateSubscription(
  supabase: SupabaseClient,
  data: {
    subscriptionId: string;
    userId: string;
    paymentId: string;
    signature: string;
  }
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Get subscription details
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', data.subscriptionId)
      .eq('user_id', data.userId)
      .single();

    if (fetchError || !subscription) {
      return {
        success: false,
        error: new Error('Subscription not found'),
      };
    }

    // Update subscription record
    const { error: updateSubError } = await supabase
      .from('subscriptions')
      .update({
        payment_id: data.paymentId,
        signature: data.signature,
        status: 'active',
        payment_status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.subscriptionId);

    if (updateSubError) {
      console.error('Failed to update subscription:', updateSubError);
      return {
        success: false,
        error: new Error(updateSubError.message),
      };
    }

    // Update user profile
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: subscription.plan_code,
        subscription_status: 'active',
        subscription_start: subscription.start_date,
        subscription_end: subscription.end_date,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', data.userId);

    if (updateProfileError) {
      console.error('Failed to update profile:', updateProfileError);
      // Don't return error here as subscription is already updated
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error activating subscription:', error);
    return { success: false, error };
  }
}

/**
 * Get subscription by order ID
 */
export async function getSubscriptionByOrderId(
  supabase: SupabaseClient,
  orderId: string
): Promise<SubscriptionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      console.error('Failed to fetch subscription by order ID:', error);
      return null;
    }

    return data as SubscriptionRecord;
  } catch (error) {
    console.error('Error getting subscription by order ID:', error);
    return null;
  }
}

/**
 * Get user's subscription history
 */
export async function getUserSubscriptionHistory(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10
): Promise<SubscriptionRecord[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch subscription history:', error);
      return [];
    }

    return (data || []) as SubscriptionRecord[];
  } catch (error) {
    console.error('Error getting subscription history:', error);
    return [];
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  supabase: SupabaseClient,
  userId: string,
  subscriptionId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .eq('user_id', userId);

    if (updateError) {
      return { success: false, error: new Error(updateError.message) };
    }

    // Update user profile to free plan
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: 'free',
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Failed to update profile after cancellation:', profileError);
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return { success: false, error };
  }
}

/**
 * Record a payment event for idempotency
 */
export async function recordPaymentEvent(
  supabase: SupabaseClient,
  data: {
    eventId: string;
    eventType: string;
    orderId?: string;
    paymentId?: string;
    subscriptionId?: string;
    payload: Record<string, any>;
  }
): Promise<{ success: boolean; alreadyProcessed: boolean }> {
  try {
    // Check if event already exists
    const { data: existing } = await supabase
      .from('payment_events')
      .select('id, processed')
      .eq('event_id', data.eventId)
      .single();

    if (existing) {
      return { success: true, alreadyProcessed: existing.processed };
    }

    // Insert new event
    const { error } = await supabase.from('payment_events').insert({
      event_id: data.eventId,
      event_type: data.eventType,
      order_id: data.orderId || null,
      payment_id: data.paymentId || null,
      subscription_id: data.subscriptionId || null,
      payload: data.payload,
      processed: false,
    });

    if (error) {
      console.error('Failed to record payment event:', error);
      return { success: false, alreadyProcessed: false };
    }

    return { success: true, alreadyProcessed: false };
  } catch (error) {
    console.error('Error recording payment event:', error);
    return { success: false, alreadyProcessed: false };
  }
}

/**
 * Mark payment event as processed
 */
export async function markEventProcessed(
  supabase: SupabaseClient,
  eventId: string,
  errorMessage?: string
): Promise<void> {
  try {
    await supabase
      .from('payment_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        error_message: errorMessage || null,
      })
      .eq('event_id', eventId);
  } catch (error) {
    console.error('Error marking event as processed:', error);
  }
}
