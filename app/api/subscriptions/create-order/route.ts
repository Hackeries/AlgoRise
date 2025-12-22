/**
 * Create Razorpay Order for Subscription Purchase (DEPRECATED)
 * 
 * POST /api/subscriptions/create-order
 * Body: { planCode: string }
 * 
 * @deprecated This endpoint is deprecated. Use /api/subscriptions/create-subscription instead.
 * 
 * This endpoint now redirects to the new subscription-based API.
 * The old order-based approach is insecure and does not support recurring billing.
 */

import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptions/types';
import { createSubscription } from '@/lib/subscriptions/service';
import { isValidPlanCode } from '@/lib/subscriptions/utils';

export async function POST(req: Request) {
  // Log deprecation warning
  console.warn('[DEPRECATED] /api/subscriptions/create-order is deprecated. Use /api/subscriptions/create-subscription instead.');
  
  // For backward compatibility, continue to support this endpoint
  // but encourage migration to the new endpoint
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
        { error: 'Cannot purchase free plan.' },
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
      return NextResponse.json(
        {
          error:
            'Checkout is disabled. Please contact support.',
          missingKeys: [
            ...(keyId ? [] : ['RAZORPAY_KEY_ID']),
            ...(keySecret ? [] : ['RAZORPAY_KEY_SECRET']),
          ],
        },
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

    // Check if user already has this plan or higher
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status')
      .eq('user_id', user.id)
      .single();

    if (profile?.subscription_plan === planCode && profile?.subscription_status === 'active') {
      return NextResponse.json(
        { error: 'You already have this plan.' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const rp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const amountInPaise = Math.round(plan.amountInr * 100);

    const order = await rp.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      notes: {
        planCode: plan.code,
        planName: plan.name,
        userId: user.id,
      },
    });

    // Create subscription record
    const startDate = new Date();
    const endDate = plan.isLifetime ? undefined : new Date(Date.now() + (plan.durationDays! * 24 * 60 * 60 * 1000));

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
        endDate,
        metadata: {
          userEmail: user.email,
          orderCreatedAt: new Date().toISOString(),
        },
      }
    );

    if (subError || !subscription) {
      console.error('[Subscription] Failed to create subscription record:', subError);
      // Continue anyway - webhook will handle it
    }

    // Also create entry in purchases table for backward compatibility
    try {
      await supabase.from('purchases').insert({
        user_id: user.id,
        plan_code: planCode,
        amount: amountInPaise,
        currency: 'INR',
        order_id: order.id,
        status: 'created',
        subscription_id: subscription?.id || null,
      });
    } catch (e) {
      console.error('[Subscription] Failed to create purchase record:', e);
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || keyId,
      subscription_id: subscription?.id,
      plan_name: plan.name,
      deprecated: true,
      migration_notice: 'This API is deprecated. Please migrate to /api/subscriptions/create-subscription for better security and recurring billing support.',
    });
  } catch (e: any) {
    console.error('[Subscription] Create order error:', e?.message, e?.stack);
    return NextResponse.json(
      {
        error: "We couldn't create your payment order. Please try again.",
      },
      { status: 500 }
    );
  }
}
