/**
 * Create Razorpay Subscription (Recurring Payments)
 * 
 * POST /api/subscriptions/create-subscription
 * Body: { planCode: string }
 * 
 * Creates a Razorpay subscription with recurring billing.
 * Replaces the insecure order-based payment system.
 */

import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptions/types';
import { createSubscription } from '@/lib/subscriptions/service';
import { isValidPlanCode } from '@/lib/subscriptions/utils';

// Razorpay plan IDs mapping (should match plans created in Razorpay Dashboard)
const RAZORPAY_PLAN_IDS: Record<string, string> = {
  'entry-gate': process.env.RAZORPAY_PLAN_ENTRY_GATE || '',
  'core-builder': process.env.RAZORPAY_PLAN_CORE_BUILDER || '',
  'algorithmic-ascend': process.env.RAZORPAY_PLAN_ALGORITHMIC_ASCEND || '',
  'competitive-forge': process.env.RAZORPAY_PLAN_COMPETITIVE_FORGE || '',
  'master-craft': process.env.RAZORPAY_PLAN_MASTER_CRAFT || '',
};

export async function POST(req: Request) {
  try {
    const { planCode } = await req.json();

    // Validate plan code
    if (!planCode || !isValidPlanCode(planCode)) {
      return NextResponse.json(
        { error: 'Invalid plan code provided.' },
        { status: 400 }
      );
    }

    if (planCode === 'free') {
      return NextResponse.json(
        { error: 'Cannot create subscription for free plan.' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planCode];
    if (!plan || plan.amountInr <= 0) {
      return NextResponse.json(
        { error: 'Invalid plan or pricing.' },
        { status: 400 }
      );
    }

    // Check Razorpay credentials
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('[Subscription] Razorpay credentials not configured');
      return NextResponse.json(
        {
          error: 'Subscription service is disabled. Please contact support.',
          missingKeys: [
            ...(keyId ? [] : ['RAZORPAY_KEY_ID']),
            ...(keySecret ? [] : ['RAZORPAY_KEY_SECRET']),
          ],
        },
        { status: 503 }
      );
    }

    // Check if Razorpay plan ID is configured
    const razorpayPlanId = RAZORPAY_PLAN_IDS[planCode];
    if (!razorpayPlanId) {
      console.error(`[Subscription] Razorpay plan ID not configured for: ${planCode}`);
      return NextResponse.json(
        { error: 'Subscription plan not available. Please contact support.' },
        { status: 503 }
      );
    }

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Check if user already has an active subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, subscription_end')
      .eq('id', user.id)
      .single();

    if (
      profile?.subscription_plan === planCode &&
      profile?.subscription_status === 'active' &&
      (!profile?.subscription_end || new Date(profile.subscription_end) > new Date())
    ) {
      return NextResponse.json(
        { error: 'You already have an active subscription for this plan.' },
        { status: 400 }
      );
    }

    // Create Razorpay subscription
    const rp = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // For lifetime plans, we create a one-time payment but store it as a subscription
    // For recurring plans, we create actual Razorpay subscriptions
    if (plan.isLifetime) {
      // Lifetime plans: Create a one-time order
      const amountInPaise = Math.round(plan.amountInr * 100);
      const order = await rp.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        notes: {
          planCode: plan.code,
          planName: plan.name,
          userId: user.id,
          type: 'lifetime',
        },
      });

      // Create subscription record
      const startDate = new Date();
      const { subscription, error: subError } = await createSubscription(
        supabase,
        {
          userId: user.id,
          planCode: plan.code,
          planName: plan.name,
          amount: plan.amountInr,
          currency: 'INR',
          orderId: order.id,
          startDate,
          endDate: undefined, // Lifetime = no end date
          metadata: {
            userEmail: user.email,
            orderCreatedAt: new Date().toISOString(),
            subscriptionType: 'lifetime',
          },
        }
      );

      if (subError || !subscription) {
        console.error('[Subscription] Failed to create subscription record:', subError);
      }

      return NextResponse.json({
        success: true,
        type: 'lifetime',
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || keyId,
        subscription_id: subscription?.id,
        plan_name: plan.name,
      });
    } else {
      // Recurring plans: Create Razorpay subscription
      // Note: This requires Razorpay subscription plans to be pre-created in dashboard
      const subscription = await rp.subscriptions.create({
        plan_id: razorpayPlanId,
        total_count: plan.durationDays ? Math.ceil(plan.durationDays / 30) : 12, // Convert days to months
        quantity: 1,
        customer_notify: 1,
        notes: {
          planCode: plan.code,
          planName: plan.name,
          userId: user.id,
        },
      });

      // Create our subscription record
      const startDate = new Date();
      const endDate = plan.durationDays
        ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000)
        : undefined;

      const { subscription: dbSubscription, error: subError } = await createSubscription(
        supabase,
        {
          userId: user.id,
          planCode: plan.code,
          planName: plan.name,
          amount: plan.amountInr,
          currency: 'INR',
          orderId: subscription.id, // Store Razorpay subscription ID as order_id
          startDate,
          endDate,
          metadata: {
            userEmail: user.email,
            razorpaySubscriptionId: subscription.id,
            subscriptionType: 'recurring',
            orderCreatedAt: new Date().toISOString(),
          },
        }
      );

      if (subError || !dbSubscription) {
        console.error('[Subscription] Failed to create subscription record:', subError);
      }

      return NextResponse.json({
        success: true,
        type: 'recurring',
        subscription_id: subscription.id,
        razorpay_subscription_id: subscription.id,
        amount: subscription.plan_id, // Razorpay stores plan info here
        currency: 'INR',
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || keyId,
        db_subscription_id: dbSubscription?.id,
        plan_name: plan.name,
        short_url: subscription.short_url, // User can be redirected here
      });
    }
  } catch (e: any) {
    console.error('[Subscription] Create subscription error:', e?.message, e?.stack);
    return NextResponse.json(
      {
        error: "We couldn't create your subscription. Please try again.",
        details: process.env.NODE_ENV === 'development' ? e?.message : undefined,
      },
      { status: 500 }
    );
  }
}
