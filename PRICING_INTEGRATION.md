# AlgoRise Pricing & Subscription System

Complete documentation for the production-ready payment and subscription system integrated with Razorpay.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [Database Schema](#database-schema)
5. [Backend API Endpoints](#backend-api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Payment Flow](#payment-flow)
8. [Webhook Integration](#webhook-integration)
9. [Feature Gating](#feature-gating)
10. [Testing](#testing)
11. [Production Deployment](#production-deployment)
12. [Security Considerations](#security-considerations)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The AlgoRise subscription system provides:

- ✅ **Multiple subscription tiers** (Entry Gate, Core Builder, Algorithmic Ascend, etc.)
- ✅ **Razorpay payment integration** with order creation and verification
- ✅ **Secure webhook handling** for payment confirmations
- ✅ **Feature gating** based on subscription level
- ✅ **Lifetime access** model for all paid plans
- ✅ **Audit trail** for all transactions
- ✅ **Idempotent webhook processing** to prevent duplicate charges
- ✅ **Real-time subscription updates** on payment success

### Subscription Plans

| Plan Code | Plan Name | Price (INR) | Access Type |
|-----------|-----------|-------------|-------------|
| `free` | Free | ₹0 | Free tier with limited features |
| `entry-gate` | Entry Gate | ₹49 | Lifetime access |
| `core-builder` | Core Builder | ₹99 | Lifetime access |
| `algorithmic-ascend` | Algorithmic Ascend | ₹169 | Lifetime access (Most Popular) |
| `competitive-forge` | Competitive Forge | ₹259 | Lifetime access |
| `master-craft` | Master Craft | ₹419 | Lifetime access |

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Pricing Page │  │  useSubscription │  │  Gating      │      │
│  │              │  │  Hook          │  │  Components  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Routes                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Create Order │  │ Verify       │  │ Webhook      │      │
│  │              │  │ Payment      │  │ Handler      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase (PostgreSQL)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ profiles     │  │ subscriptions│  │ payment_events│     │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
          ▲                  ▲
          │                  │
┌─────────┴──────────────────┴─────────────────────────────────┐
│                    Razorpay Payment Gateway                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Order API    │  │ Payment      │  │ Webhooks     │      │
│  │              │  │ Processing   │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup & Configuration

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Database Setup

Run the subscription migration script:

```bash
# Using psql
psql -h your-supabase-host -U postgres -d postgres -f scripts/031_create_subscriptions_system.sql

# Or via Supabase Dashboard
# Navigate to SQL Editor and paste the contents of 031_create_subscriptions_system.sql
```

This creates:
- Subscription columns in `profiles` table
- `subscriptions` table for audit trail
- `payment_events` table for webhook idempotency
- Helper functions for subscription management
- Proper RLS policies

### 3. Razorpay Configuration

#### Development (Test Mode)

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get Test API keys from Settings > API Keys
3. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to test keys

#### Production

1. Complete KYC verification on Razorpay
2. Switch to Live mode in dashboard
3. Get Live API keys
4. Update environment variables with live keys

#### Webhook Setup

1. Go to Settings > Webhooks in Razorpay Dashboard
2. Add webhook URL: `https://your-domain.com/api/webhooks/razorpay`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Generate webhook secret
5. Set `RAZORPAY_WEBHOOK_SECRET` in environment

---

## Database Schema

### profiles table (updated)

```sql
-- Added columns
subscription_plan text NOT NULL DEFAULT 'free'
subscription_status text NOT NULL DEFAULT 'active'
subscription_start timestamptz
subscription_end timestamptz
```

### subscriptions table

Tracks all subscription purchases and their status.

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  plan_name text NOT NULL,
  plan_code text NOT NULL,
  amount integer NOT NULL, -- in paise
  currency text DEFAULT 'INR',
  order_id text UNIQUE NOT NULL,
  payment_id text,
  signature text,
  start_date timestamptz NOT NULL,
  end_date timestamptz, -- NULL for lifetime plans
  status text NOT NULL, -- pending|active|expired|cancelled|refunded
  payment_status text NOT NULL, -- pending|completed|failed
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### payment_events table

Ensures webhook idempotency and audit trail.

```sql
CREATE TABLE payment_events (
  id uuid PRIMARY KEY,
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  order_id text,
  payment_id text,
  subscription_id uuid REFERENCES subscriptions(id),
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);
```

---

## Backend API Endpoints

### 1. Create Order

**Endpoint:** `POST /api/subscriptions/create-order`

Creates a Razorpay order for a subscription purchase.

**Request:**
```json
{
  "planCode": "algorithmic-ascend"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "order_MkXBkxxxxxxxx",
  "amount": 16900,
  "currency": "INR",
  "key": "rzp_test_xxxxxxxxxxxxxx",
  "subscription_id": "uuid",
  "plan_name": "Algorithmic Ascend"
}
```

**Errors:**
- `400` - Invalid plan code
- `401` - Authentication required
- `503` - Razorpay not configured

### 2. Verify Payment

**Endpoint:** `POST /api/subscriptions/verify`

Verifies payment signature and activates subscription.

**Request:**
```json
{
  "razorpay_payment_id": "pay_MkXBkxxxxxxxx",
  "razorpay_order_id": "order_MkXBkxxxxxxxx",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "ok": true,
  "verified": true,
  "message": "Subscription activated successfully!",
  "plan": "algorithmic-ascend",
  "subscription_id": "uuid"
}
```

### 3. Get Subscription Status

**Endpoint:** `GET /api/subscriptions/status`

Returns current user's subscription information.

**Response:**
```json
{
  "plan": "algorithmic-ascend",
  "status": "active",
  "isActive": true,
  "isLifetime": true,
  "startDate": "2025-10-30T00:00:00Z",
  "endDate": null
}
```

### 4. Webhook Handler

**Endpoint:** `POST /api/webhooks/razorpay`

Handles Razorpay webhook events.

**Security:** Verifies webhook signature using `RAZORPAY_WEBHOOK_SECRET`

**Supported Events:**
- `payment.captured` - Activates subscription
- `payment.failed` - Marks subscription as failed
- `order.paid` - Activates subscription (alternative event)

---

## Frontend Components

### 1. SubscriptionCheckoutButton

Renders a button that initiates Razorpay checkout.

```tsx
import { SubscriptionCheckoutButton } from '@/components/subscriptions';

<SubscriptionCheckoutButton
  planCode="algorithmic-ascend"
  planName="Algorithmic Ascend"
  amount={169}
  label="Upgrade Now"
/>
```

**Props:**
- `planCode`: Subscription plan identifier
- `planName`: Display name for Razorpay checkout
- `amount`: Price in INR
- `label`: Button text
- `className`: CSS classes
- `variant`: Button variant

### 2. SubscriptionBadge

Displays user's current plan as a badge.

```tsx
import { SubscriptionBadge } from '@/components/subscriptions';

<SubscriptionBadge plan="algorithmic-ascend" showIcon={true} />
```

### 3. SubscriptionGate

Wraps content that requires a specific subscription level.

```tsx
import { SubscriptionGate } from '@/components/subscriptions';

<SubscriptionGate requiredPlan="core-builder">
  <PremiumFeature />
</SubscriptionGate>
```

**Props:**
- `requiredPlan`: Minimum required plan
- `children`: Content to show if user has access
- `fallback`: Custom UI for non-subscribers
- `showUpgradePrompt`: Show default upgrade prompt

### 4. SubscriptionStatusCard

Shows detailed subscription information.

```tsx
import { SubscriptionStatusCard } from '@/components/subscriptions';

<SubscriptionStatusCard />
```

### 5. useSubscription Hook

React hook for accessing subscription state.

```tsx
import { useSubscription } from '@/hooks/use-subscription';

function MyComponent() {
  const { subscription, isLoading, isPremium, hasAccess } = useSubscription();

  if (hasAccess('core-builder')) {
    return <PremiumContent />;
  }

  return <UpgradePrompt />;
}
```

**Returns:**
- `subscription`: User's subscription object
- `isLoading`: Loading state
- `isActive`: Whether subscription is currently active
- `isPremium`: Whether user has any paid plan
- `hasAccess(planCode)`: Check if user can access a feature
- `refresh()`: Manually refresh subscription data

---

## Payment Flow

### Client-Side Flow

```
1. User clicks "Upgrade" button
   ↓
2. SubscriptionCheckoutButton validates user authentication
   ↓
3. POST /api/subscriptions/create-order
   ↓
4. Receive order_id and Razorpay key
   ↓
5. Load Razorpay SDK
   ↓
6. Open Razorpay checkout modal
   ↓
7. User completes payment
   ↓
8. Razorpay callback with payment details
   ↓
9. POST /api/subscriptions/verify
   ↓
10. Signature verification passes
   ↓
11. Subscription activated
   ↓
12. Redirect to profile/dashboard
```

### Server-Side Flow (Webhook)

```
1. Razorpay sends webhook event
   ↓
2. Verify webhook signature
   ↓
3. Check if event already processed (idempotency)
   ↓
4. Record event in payment_events table
   ↓
5. Process event based on type:
   - payment.captured → Activate subscription
   - payment.failed → Mark as failed
   ↓
6. Update subscriptions and profiles tables
   ↓
7. Mark event as processed
   ↓
8. Return 200 OK to Razorpay
```

---

## Feature Gating

### Using SubscriptionGate Component

```tsx
<SubscriptionGate requiredPlan="algorithmic-ascend">
  <AdvancedAnalytics />
</SubscriptionGate>
```

### Using useSubscription Hook

```tsx
const { hasAccess, isPremium } = useSubscription();

if (!isPremium) {
  return <FreeUserView />;
}

if (hasAccess('competitive-forge')) {
  return <EliteFeatures />;
}

return <StandardFeatures />;
```

### Server-Side Gating

```tsx
// In API route or Server Component
import { createClient } from '@/lib/supabase/server';
import { getUserSubscription } from '@/lib/subscriptions';
import { hasAccessToFeature } from '@/lib/subscriptions';

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

const subscription = await getUserSubscription(supabase, user.id);

if (!hasAccessToFeature(subscription.plan, 'core-builder')) {
  return { error: 'Premium feature' };
}

// Proceed with premium feature
```

---

## Testing

### Test Mode Setup

1. Use Razorpay test credentials
2. No actual money is charged
3. Use test card numbers from [Razorpay Docs](https://razorpay.com/docs/payments/payments/test-card-details/)

### Test Card Details

```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

### Testing Scenarios

#### 1. Successful Payment

```bash
# Test the complete flow
1. Go to /pricing
2. Click "Upgrade" on any plan
3. Complete payment with test card
4. Verify subscription in profile
5. Check database for subscription record
```

#### 2. Failed Payment

```bash
# Use card: 4000 0000 0000 0002
# This will trigger payment failure
```

#### 3. Webhook Testing

```bash
# Use ngrok for local testing
ngrok http 3000

# Update webhook URL in Razorpay Dashboard
# Trigger a test payment
# Check logs for webhook processing
```

### Manual Testing Checklist

- [ ] User can see all plans on /pricing page
- [ ] Checkout button opens Razorpay modal
- [ ] Payment completes successfully
- [ ] Subscription record created in database
- [ ] User profile updated with new plan
- [ ] Payment event recorded
- [ ] Webhook processes correctly
- [ ] User redirected after payment
- [ ] Premium features unlock immediately
- [ ] SubscriptionGate blocks free users
- [ ] SubscriptionBadge displays correct plan
- [ ] useSubscription hook returns correct data

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Switch to Razorpay Live mode
- [ ] Update all environment variables to production values
- [ ] Configure webhook URL with production domain
- [ ] Test with real (small) transaction
- [ ] Set up monitoring and alerts
- [ ] Configure database backups
- [ ] Enable rate limiting on webhook endpoint
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

### Environment Variables

Ensure these are set in production:

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Razorpay (Live Mode)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_key_secret
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_production_webhook_secret

# Application
NEXT_PUBLIC_APP_URL=https://algorise.com
NODE_ENV=production
```

### Webhook Configuration

1. Production webhook URL: `https://algorise.com/api/webhooks/razorpay`
2. Ensure HTTPS is enabled
3. Use a strong webhook secret
4. Enable IP whitelisting if supported

### Monitoring

#### Key Metrics to Track

- Payment success rate
- Payment failure rate
- Average time to subscription activation
- Webhook processing time
- Duplicate webhook events
- Failed webhook retries

#### Logging

```typescript
// All critical events are logged:
- Order creation
- Payment verification
- Subscription activation
- Webhook events
- Errors and failures
```

---

## Security Considerations

### 1. Signature Verification

All webhooks verify Razorpay signature:

```typescript
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(body)
  .digest('hex');
```

### 2. Idempotency

`payment_events` table prevents duplicate processing:

```typescript
// Check if event already exists
const existing = await supabase
  .from('payment_events')
  .select('id, processed')
  .eq('event_id', eventId)
  .single();

if (existing) {
  return { alreadyProcessed: true };
}
```

### 3. Rate Limiting

Webhook endpoint has built-in rate limiting:

```typescript
// Max 100 requests per minute per IP
const maxRequests = 100;
const windowMs = 60000;
```

### 4. Authentication

All API endpoints require authentication:

```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 5. Input Validation

- Plan codes validated against whitelist
- Amount verification
- User ownership checks
- Order ID verification

---

## Troubleshooting

### Payment Not Processing

**Symptoms:** User completes payment but subscription not activated

**Solutions:**
1. Check webhook logs for errors
2. Verify webhook secret is correct
3. Ensure webhook URL is accessible
4. Check database for subscription record
5. Verify Razorpay signature

### Webhook Not Receiving Events

**Symptoms:** No webhook calls after payment

**Solutions:**
1. Verify webhook URL in Razorpay Dashboard
2. Check webhook URL is HTTPS
3. Ensure firewall allows Razorpay IPs
4. Check webhook secret matches
5. Test with Razorpay webhook tester

### Duplicate Subscriptions

**Symptoms:** User charged multiple times

**Solutions:**
1. Check `payment_events` table for duplicate event IDs
2. Verify idempotency logic is working
3. Review webhook retry configuration
4. Check for race conditions in activation logic

### User Can't Access Premium Features

**Symptoms:** User paid but features locked

**Solutions:**
1. Check `profiles.subscription_plan` value
2. Verify `profiles.subscription_status = 'active'`
3. Clear client-side cache
4. Refresh subscription with `useSubscription().refresh()`
5. Check feature gating logic

### Common Error Messages

#### "Authentication required"
- User not logged in
- Session expired
- Solution: Redirect to login page

#### "Invalid plan code"
- Plan code not in SUBSCRIPTION_PLANS
- Typo in plan code
- Solution: Use valid plan codes from types

#### "Checkout is disabled"
- Missing Razorpay credentials
- Solution: Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET

#### "Payment verification failed"
- Invalid signature
- Webhook secret mismatch
- Solution: Verify environment variables

---

## Support & Maintenance

### Database Maintenance

Run this periodically to expire old subscriptions:

```sql
SELECT public.expire_subscriptions();
```

### Monitoring Queries

```sql
-- Active subscriptions by plan
SELECT plan_code, COUNT(*) 
FROM subscriptions 
WHERE status = 'active' 
GROUP BY plan_code;

-- Failed payments in last 24 hours
SELECT * FROM subscriptions 
WHERE payment_status = 'failed' 
AND created_at > NOW() - INTERVAL '24 hours';

-- Unprocessed webhook events
SELECT * FROM payment_events 
WHERE processed = false 
AND created_at > NOW() - INTERVAL '1 hour';
```

### Backup Strategy

1. Regular database backups via Supabase
2. Export subscription data monthly
3. Keep payment_events for audit trail
4. Archive old records after 2 years

---

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## License

This integration is part of the AlgoRise platform and follows the project's license.

---

**Last Updated:** 2025-10-30
**Version:** 1.0.0
**Maintainers:** AlgoRise Development Team
