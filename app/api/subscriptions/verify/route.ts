/**
 * Verify Razorpay Payment and Activate Subscription
 * 
 * POST /api/subscriptions/verify
 * Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * 
 * Verifies payment signature and activates user subscription.
 */

import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getSubscriptionByOrderId,
  activateSubscription,
} from '@/lib/subscriptions/service';

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields.' },
        { status: 400 }
      );
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('[Subscription] Razorpay key secret not configured');
      return NextResponse.json(
        { error: 'Payment verification unavailable.' },
        { status: 500 }
      );
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[Subscription] Invalid signature');
      return NextResponse.json(
        { ok: false, verified: false, error: 'Invalid payment signature.' },
        { status: 400 }
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
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    // Get subscription record
    const subscription = await getSubscriptionByOrderId(
      supabase,
      razorpay_order_id
    );

    if (!subscription) {
      console.error('[Subscription] Subscription not found for order:', razorpay_order_id);
      return NextResponse.json(
        { error: 'Subscription record not found.' },
        { status: 404 }
      );
    }

    // Verify user owns this subscription
    if (subscription.user_id !== user.id) {
      console.error('[Subscription] User ID mismatch');
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 403 }
      );
    }

    // Check if already processed
    if (subscription.payment_status === 'completed') {
      return NextResponse.json({
        ok: true,
        verified: true,
        message: 'Subscription already active.',
        plan: subscription.plan_code,
      });
    }

    // Activate subscription
    const { success, error: activationError } = await activateSubscription(
      supabase,
      {
        subscriptionId: subscription.id,
        userId: user.id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      }
    );

    if (!success) {
      console.error('[Subscription] Activation failed:', activationError);
      return NextResponse.json(
        {
          error: 'Failed to activate subscription. Please contact support.',
        },
        { status: 500 }
      );
    }

    // Update purchase record
    try {
      await supabase
        .from('purchases')
        .update({
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
          status: 'paid',
        })
        .eq('order_id', razorpay_order_id);
    } catch (e) {
      console.error('[Subscription] Failed to update purchase:', e);
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      message: 'Subscription activated successfully!',
      plan: subscription.plan_code,
      subscription_id: subscription.id,
    });
  } catch (err: any) {
    console.error('[Subscription] Verification error:', err?.message, err?.stack);
    return NextResponse.json(
      { error: 'Payment verification failed. Please contact support.' },
      { status: 500 }
    );
  }
}
