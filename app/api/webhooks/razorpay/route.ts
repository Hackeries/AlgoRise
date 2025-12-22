/**
 * Razorpay Webhook Handler
 * 
 * POST /api/webhooks/razorpay
 * 
 * Handles webhook events from Razorpay for payment confirmation.
 * Ensures idempotency and proper signature verification.
 * 
 * Setup in Razorpay Dashboard:
 * - URL: https://your-domain.com/api/webhooks/razorpay
 * - Events: payment.captured, payment.failed, order.paid
 * - Secret: Set RAZORPAY_WEBHOOK_SECRET in environment variables
 */

import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  getSubscriptionByOrderId,
  activateSubscription,
  recordPaymentEvent,
  markEventProcessed,
} from '@/lib/subscriptions/service';

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

/**
 * Rate limiting helper (simple in-memory for demonstration)
 * For production, use Redis or a proper rate limiting service
 */
const webhookRateLimit = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100; // Max 100 requests per minute

  const requests = webhookRateLimit.get(ip) || [];
  const recentRequests = requests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return true;
  }

  recentRequests.push(now);
  webhookRateLimit.set(ip, recentRequests);
  return false;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let eventId = 'unknown';

  try {
    // Rate limiting check
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      console.warn(`[Webhook] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Get webhook secret
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 503 }
      );
    }

    // Get raw body and signature
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('[Webhook] Missing signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify signature
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const event = JSON.parse(body);
    eventId = event.event || 'unknown';

    console.log(`[Webhook] Received event: ${eventId}`);

    // Get service role client for database operations
    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error('[Webhook] Failed to create Supabase client');
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Record event for idempotency
    const orderId = event.payload?.order?.entity?.id || event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;

    const { success: recordSuccess, alreadyProcessed } = await recordPaymentEvent(
      supabase,
      {
        eventId: eventId,
        eventType: event.event,
        orderId,
        paymentId,
        payload: event.payload,
      }
    );

    if (!recordSuccess) {
      console.error('[Webhook] Failed to record event');
      // Continue processing anyway
    }

    if (alreadyProcessed) {
      console.log(`[Webhook] Event ${eventId} already processed, skipping`);
      return NextResponse.json({ ok: true, message: 'Already processed' });
    }

    // Handle different event types
    let processed = false;
    let errorMessage: string | undefined;

    switch (event.event) {
      case 'payment.captured':
      case 'order.paid':
        try {
          await handlePaymentSuccess(supabase, event);
          processed = true;
        } catch (error: any) {
          errorMessage = error.message;
          console.error('[Webhook] Payment success handler failed:', error);
        }
        break;

      case 'payment.failed':
        try {
          await handlePaymentFailure(supabase, event);
          processed = true;
        } catch (error: any) {
          errorMessage = error.message;
          console.error('[Webhook] Payment failure handler failed:', error);
        }
        break;

      case 'subscription.activated':
        try {
          await handleSubscriptionActivated(supabase, event);
          processed = true;
        } catch (error: any) {
          errorMessage = error.message;
          console.error('[Webhook] Subscription activation handler failed:', error);
        }
        break;

      case 'subscription.charged':
        try {
          await handleSubscriptionCharged(supabase, event);
          processed = true;
        } catch (error: any) {
          errorMessage = error.message;
          console.error('[Webhook] Subscription charged handler failed:', error);
        }
        break;

      case 'subscription.cancelled':
      case 'subscription.paused':
        try {
          await handleSubscriptionCancelled(supabase, event);
          processed = true;
        } catch (error: any) {
          errorMessage = error.message;
          console.error('[Webhook] Subscription cancellation handler failed:', error);
        }
        break;

      case 'subscription.completed':
        try {
          await handleSubscriptionCompleted(supabase, event);
          processed = true;
        } catch (error: any) {
          errorMessage = error.message;
          console.error('[Webhook] Subscription completion handler failed:', error);
        }
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.event}`);
        processed = true; // Mark as processed to avoid reprocessing
    }

    // Mark event as processed
    if (processed) {
      await markEventProcessed(supabase, eventId, errorMessage);
    }

    const duration = Date.now() - startTime;
    console.log(`[Webhook] Event ${eventId} processed in ${duration}ms`);

    return NextResponse.json({ ok: true, processed, duration: `${duration}ms` });
  } catch (error: any) {
    console.error('[Webhook] Unexpected error:', error?.message, error?.stack);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(supabase: any, event: any) {
  const payment = event.payload?.payment?.entity;
  const order = event.payload?.order?.entity;

  if (!payment && !order) {
    throw new Error('Missing payment or order data in event');
  }

  const orderId = payment?.order_id || order?.id;
  const paymentId = payment?.id;
  const signature = payment?.signature; // May not be present in webhook

  if (!orderId) {
    throw new Error('Missing order ID in payment event');
  }

  console.log(`[Webhook] Processing payment success for order: ${orderId}`);

  // Get subscription record
  const subscription = await getSubscriptionByOrderId(supabase, orderId);

  if (!subscription) {
    console.error('[Webhook] Subscription not found for order:', orderId);
    throw new Error('Subscription not found');
  }

  // Check if already activated
  if (subscription.payment_status === 'completed') {
    console.log('[Webhook] Subscription already activated:', subscription.id);
    return;
  }

  // Activate subscription
  const { success, error } = await activateSubscription(supabase, {
    subscriptionId: subscription.id,
    userId: subscription.user_id,
    paymentId: paymentId || '',
    signature: signature || '',
  });

  if (!success) {
    throw error || new Error('Failed to activate subscription');
  }

  // Update purchase record
  try {
    await supabase
      .from('purchases')
      .update({
        payment_id: paymentId,
        status: 'paid',
      })
      .eq('order_id', orderId);
  } catch (e) {
    console.error('[Webhook] Failed to update purchase:', e);
  }

  console.log(`[Webhook] Subscription activated successfully: ${subscription.id}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(supabase: any, event: any) {
  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;

  if (!orderId) {
    throw new Error('Missing order ID in payment failure event');
  }

  console.log(`[Webhook] Processing payment failure for order: ${orderId}`);

  // Get subscription record
  const subscription = await getSubscriptionByOrderId(supabase, orderId);

  if (!subscription) {
    console.warn('[Webhook] Subscription not found for failed payment:', orderId);
    return;
  }

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      payment_status: 'failed',
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  // Update purchase record
  try {
    await supabase
      .from('purchases')
      .update({
        status: 'failed',
      })
      .eq('order_id', orderId);
  } catch (e) {
    console.error('[Webhook] Failed to update purchase:', e);
  }

  console.log(`[Webhook] Payment failure recorded for subscription: ${subscription.id}`);
}

/**
 * Handle subscription activation (for recurring subscriptions)
 */
async function handleSubscriptionActivated(supabase: any, event: any) {
  const subscription = event.payload?.subscription?.entity;
  
  if (!subscription?.id) {
    throw new Error('Missing subscription ID in activation event');
  }

  const subscriptionId = subscription.id;
  const userId = subscription.notes?.userId;

  if (!userId) {
    throw new Error('Missing user ID in subscription notes');
  }

  console.log(`[Webhook] Processing subscription activation: ${subscriptionId}`);

  // Get subscription record by Razorpay subscription ID
  const { data: dbSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('order_id', subscriptionId)
    .eq('user_id', userId)
    .single();

  if (!dbSubscription) {
    console.warn('[Webhook] Subscription not found for activation:', subscriptionId);
    return;
  }

  // Check if already activated
  if (dbSubscription.status === 'active') {
    console.log('[Webhook] Subscription already activated:', dbSubscription.id);
    return;
  }

  // Activate subscription
  const { success, error } = await activateSubscription(supabase, {
    subscriptionId: dbSubscription.id,
    userId: userId,
    paymentId: subscription.id,
    signature: '',
  });

  if (!success) {
    throw error || new Error('Failed to activate subscription');
  }

  console.log(`[Webhook] Subscription activated successfully: ${dbSubscription.id}`);
}

/**
 * Handle subscription charged (recurring payment)
 */
async function handleSubscriptionCharged(supabase: any, event: any) {
  const payment = event.payload?.payment?.entity;
  const subscription = event.payload?.subscription?.entity;

  if (!payment?.id || !subscription?.id) {
    throw new Error('Missing payment or subscription ID in charged event');
  }

  const subscriptionId = subscription.id;
  console.log(`[Webhook] Processing subscription charge: ${subscriptionId}`);

  // Get subscription record
  const { data: dbSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('order_id', subscriptionId)
    .single();

  if (!dbSubscription) {
    console.warn('[Webhook] Subscription not found for charge:', subscriptionId);
    return;
  }

  // Update subscription record with latest payment
  await supabase
    .from('subscriptions')
    .update({
      payment_id: payment.id,
      status: 'active',
      payment_status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', dbSubscription.id);

  // Extend subscription end date if applicable
  if (dbSubscription.end_date) {
    const currentEnd = new Date(dbSubscription.end_date);
    const now = new Date();
    const newEnd = currentEnd > now ? currentEnd : now;
    
    // Add 30 days (monthly billing)
    newEnd.setDate(newEnd.getDate() + 30);

    await supabase
      .from('subscriptions')
      .update({
        end_date: newEnd.toISOString(),
      })
      .eq('id', dbSubscription.id);

    // Update profile
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_end: newEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', dbSubscription.user_id);
  }

  console.log(`[Webhook] Subscription charged successfully: ${dbSubscription.id}`);
}

/**
 * Handle subscription cancellation or pause
 */
async function handleSubscriptionCancelled(supabase: any, event: any) {
  const subscription = event.payload?.subscription?.entity;

  if (!subscription?.id) {
    throw new Error('Missing subscription ID in cancellation event');
  }

  const subscriptionId = subscription.id;
  console.log(`[Webhook] Processing subscription cancellation: ${subscriptionId}`);

  // Get subscription record
  const { data: dbSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('order_id', subscriptionId)
    .single();

  if (!dbSubscription) {
    console.warn('[Webhook] Subscription not found for cancellation:', subscriptionId);
    return;
  }

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: event.event === 'subscription.paused' ? 'paused' : 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', dbSubscription.id);

  // Update profile
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', dbSubscription.user_id);

  console.log(`[Webhook] Subscription cancelled: ${dbSubscription.id}`);
}

/**
 * Handle subscription completion (all payments done)
 */
async function handleSubscriptionCompleted(supabase: any, event: any) {
  const subscription = event.payload?.subscription?.entity;

  if (!subscription?.id) {
    throw new Error('Missing subscription ID in completion event');
  }

  const subscriptionId = subscription.id;
  console.log(`[Webhook] Processing subscription completion: ${subscriptionId}`);

  // Get subscription record
  const { data: dbSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('order_id', subscriptionId)
    .single();

  if (!dbSubscription) {
    console.warn('[Webhook] Subscription not found for completion:', subscriptionId);
    return;
  }

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', dbSubscription.id);

  console.log(`[Webhook] Subscription completed: ${dbSubscription.id}`);
}

// Disable body parsing for raw body access
export const config = {
  api: {
    bodyParser: false,
  },
};
