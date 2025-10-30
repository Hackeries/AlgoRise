# Deployment Steps: Pricing & Subscription System

Step-by-step guide to deploy the subscription system to production.

---

## Pre-Deployment Checklist

### ☑️ Development Testing
- [ ] All database migrations run successfully in dev
- [ ] Test payment completes successfully
- [ ] Webhook receives and processes events
- [ ] Subscription activates in database
- [ ] User profile updates correctly
- [ ] Premium features unlock immediately
- [ ] Feature gating works as expected
- [ ] All components render without errors
- [ ] Mobile responsiveness verified

### ☑️ Code Review
- [ ] All TypeScript types are correct
- [ ] Error handling implemented
- [ ] Logging statements in place
- [ ] Security measures verified
- [ ] No hardcoded secrets
- [ ] Environment variables documented

---

## Step 1: Razorpay Production Setup

### 1.1 Complete KYC Verification

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to Settings > Account & Settings
3. Complete KYC verification
4. Wait for approval (usually 24-48 hours)

### 1.2 Generate Live API Keys

1. Switch to Live mode in Razorpay Dashboard
2. Go to Settings > API Keys
3. Generate Live keys
4. Securely store:
   - `RAZORPAY_KEY_ID` (starts with `rzp_live_`)
   - `RAZORPAY_KEY_SECRET`

### 1.3 Configure Webhooks

1. Go to Settings > Webhooks
2. Click "Add new webhook"
3. Enter webhook URL: `https://your-domain.com/api/webhooks/razorpay`
4. Select events:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `order.paid`
5. Generate and save webhook secret
6. Click "Save"

---

## Step 2: Database Migration

### 2.1 Backup Current Database

```bash
# Via Supabase Dashboard
# Project Settings > Database > Backup
# Or download a backup via API
```

### 2.2 Run Migration

```bash
# Option 1: Via Supabase SQL Editor
# 1. Open https://app.supabase.com/project/_/sql
# 2. Click "New Query"
# 3. Copy contents of scripts/031_create_subscriptions_system.sql
# 4. Click "Run"
# 5. Verify: "Success. No rows returned"

# Option 2: Via psql
psql -h your-production-db-host -U postgres -d postgres \
  -f scripts/031_create_subscriptions_system.sql
```

### 2.3 Verify Migration

```sql
-- Check tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('subscriptions', 'payment_events');

-- Check profiles columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE 'subscription%';

-- Expected output: 
-- subscription_plan
-- subscription_status
-- subscription_start
-- subscription_end
```

---

## Step 3: Environment Configuration

### 3.1 Set Production Environment Variables

#### Vercel
```bash
vercel env add RAZORPAY_KEY_ID
# Enter: rzp_live_xxxxxxxxxxxxxx

vercel env add RAZORPAY_KEY_SECRET
# Enter: your_live_secret

vercel env add NEXT_PUBLIC_RAZORPAY_KEY
# Enter: rzp_live_xxxxxxxxxxxxxx

vercel env add RAZORPAY_WEBHOOK_SECRET
# Enter: your_webhook_secret

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Enter: your_service_role_key
```

#### Other Platforms
Set these in your platform's environment variable settings:
```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 3.2 Verify Environment Variables

```bash
# Add temporary debug endpoint (remove after verification)
# app/api/debug/env-check/route.ts

export async function GET() {
  return Response.json({
    razorpayConfigured: !!process.env.RAZORPAY_KEY_ID,
    webhookConfigured: !!process.env.RAZORPAY_WEBHOOK_SECRET,
    supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

# Visit: https://your-domain.com/api/debug/env-check
# Should return all true
# DELETE THIS FILE after verification!
```

---

## Step 4: Deploy Application

### 4.1 Build and Test Locally with Production Config

```bash
# Set production env in .env.local temporarily
npm run build

# Check for build errors
# Fix any TypeScript or build errors

# Test production build locally
npm run start
```

### 4.2 Deploy to Platform

```bash
# Vercel
vercel --prod

# Or use your platform's deployment method
git push origin main  # If using auto-deploy
```

### 4.3 Verify Deployment

- [ ] Visit https://your-domain.com/pricing
- [ ] Check that all plans display
- [ ] Verify checkout buttons are enabled
- [ ] Check console for errors

---

## Step 5: Test Production Payment Flow

### 5.1 Test Small Transaction

1. Create a test account on your production site
2. Navigate to /pricing
3. Select the cheapest plan (Entry Gate - ₹49)
4. Click checkout button
5. Complete payment with a **real card** (SMALL AMOUNT ONLY)
6. Verify subscription activates

### 5.2 Verification Points

- [ ] Razorpay order created (check Razorpay Dashboard > Payments)
- [ ] Payment completes successfully
- [ ] Webhook received (check logs)
- [ ] Subscription record in database
- [ ] User profile updated
- [ ] `payment_events` table has entry
- [ ] User sees premium features
- [ ] Subscription badge shows correct plan

### 5.3 Refund Test Payment (Optional)

```bash
# Via Razorpay Dashboard
# Payments > Select payment > Refund
```

---

## Step 6: Monitoring Setup

### 6.1 Set Up Logging

#### Vercel
```bash
# View logs
vercel logs --prod

# Real-time logs
vercel logs --prod --follow
```

#### Custom Logger (Optional)
```typescript
// lib/logger.ts
export function logPaymentEvent(event: string, data: any) {
  console.log(`[Payment] ${event}`, JSON.stringify(data));
  
  // Send to external service (Sentry, LogRocket, etc.)
  if (process.env.SENTRY_DSN) {
    // Sentry.captureMessage(...)
  }
}
```

### 6.2 Set Up Alerts

#### Webhook Failures
```typescript
// In webhook handler, add:
if (error) {
  // Send alert email or Slack notification
  await sendAlert({
    type: 'webhook_failure',
    error: error.message,
    eventId: eventId,
  });
}
```

#### Payment Failures
```sql
-- Query to check for recent failures
SELECT * FROM subscriptions 
WHERE payment_status = 'failed' 
AND created_at > NOW() - INTERVAL '1 hour';
```

### 6.3 Database Monitoring

```sql
-- Active subscriptions by plan
SELECT plan_code, COUNT(*) as count
FROM subscriptions 
WHERE status = 'active' 
GROUP BY plan_code;

-- Daily revenue
SELECT DATE(created_at) as date, 
       SUM(amount) / 100 as revenue_inr
FROM subscriptions 
WHERE payment_status = 'completed' 
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Failed payments
SELECT COUNT(*) as failed_count
FROM subscriptions 
WHERE payment_status = 'failed' 
AND created_at > NOW() - INTERVAL '24 hours';
```

---

## Step 7: Post-Deployment Verification

### 7.1 Smoke Tests

- [ ] Homepage loads
- [ ] /pricing page loads
- [ ] User can sign up
- [ ] User can view their profile
- [ ] Checkout opens for all plans
- [ ] Webhook endpoint accessible (test with curl)

### 7.2 Webhook Test

```bash
# Test webhook endpoint is accessible
curl -X POST https://your-domain.com/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: test" \
  -d '{"event":"test"}'

# Should return 401 (signature invalid) but shows endpoint is reachable
```

### 7.3 Monitor for 24 Hours

- Check logs every few hours
- Monitor webhook success rate
- Check for any error spikes
- Verify subscriptions are activating

---

## Step 8: Enable Production Features

### 8.1 Remove Test Banners

```tsx
// Remove any "TEST MODE" banners from the UI
// Update any messaging about beta features
```

### 8.2 Enable Analytics

```typescript
// Track payment events
analytics.track('payment_initiated', { plan: planCode, amount });
analytics.track('payment_completed', { plan: planCode, subscriptionId });
analytics.track('payment_failed', { plan: planCode, error });
```

### 8.3 Update Documentation

- [ ] Update README with production setup
- [ ] Add pricing page to sitemap
- [ ] Update help/FAQ if needed
- [ ] Announce feature to users

---

## Rollback Plan

If issues occur, follow these steps:

### Immediate Actions

1. **Disable payments temporarily**
   ```bash
   # Remove RAZORPAY_KEY_ID from environment
   # This will show "Checkout unavailable" to users
   ```

2. **Check webhook logs**
   ```bash
   vercel logs --prod | grep webhook
   ```

3. **Verify database state**
   ```sql
   SELECT * FROM subscriptions 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC;
   ```

### Database Rollback (If Needed)

```sql
-- Backup current state first!
-- Then rollback subscription-related changes

-- Remove new columns (ONLY IF ABSOLUTELY NECESSARY)
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS subscription_plan,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS subscription_start,
  DROP COLUMN IF EXISTS subscription_end;

-- Drop new tables
DROP TABLE IF EXISTS payment_events;
DROP TABLE IF EXISTS subscriptions;
```

---

## Success Criteria

System is successfully deployed when:

- ✅ Real payment completes successfully
- ✅ Subscription activates immediately
- ✅ Webhook processes correctly
- ✅ No errors in logs for 24 hours
- ✅ All monitoring in place
- ✅ Team trained on troubleshooting
- ✅ Rollback plan tested

---

## Support Contacts

- **Razorpay Support**: https://razorpay.com/support/
- **Supabase Support**: https://supabase.com/support
- **Internal Team**: [Your team contact info]

---

## Post-Launch Checklist

- [ ] Monitor payment success rate (target: >95%)
- [ ] Check webhook processing time (target: <2s)
- [ ] Verify no duplicate subscriptions
- [ ] Monitor customer support inquiries
- [ ] Track conversion rate by plan
- [ ] Set up weekly review of metrics
- [ ] Plan for scaling if needed

---

**Deployment Status**: Ready for Production

**Deployed By**: _____________

**Deployment Date**: _____________

**Verified By**: _____________

**Notes**: _____________________________________________
