# AlgoRise Subscription System Migration Guide

## Overview

The AlgoRise payment and subscription system has been completely refactored to address security concerns, support recurring billing, and provide proper Pro-tier feature gating. This guide will help you understand the changes and how to migrate.

## What Changed?

### Before (Insecure)
- ❌ Order-based one-time payments
- ❌ UI-only feature gating
- ❌ No webhook signature verification
- ❌ No idempotency handling
- ❌ Limited analytics

### After (Secure)
- ✅ Subscription-based recurring payments
- ✅ Server-side feature gating
- ✅ Webhook signature verification
- ✅ Idempotency and rate limiting
- ✅ Pro-only advanced analytics

## For Users

### What You Need to Know

1. **Existing Subscriptions**: All existing subscriptions remain active. No action needed.

2. **New Features**:
   - **Upsolve Queue**: Spaced repetition system for problem practice (Pro-only)
   - **Weak Tag Analysis**: Identify your weakest topics (Pro-only)
   - **Mastery Tracking**: Track improvement across tags (Pro-only)
   - **Fail-Decay Analysis**: Retention patterns (Pro-only)

3. **Access Control**: Pro features are now enforced at the server level, not just hidden in the UI.

### How to Access New Features

If you have an active Pro subscription, you can now access:

1. **Upsolve Queue** at `/train/upsolve`
2. **Advanced Analytics** at `/analytics/pro`
3. All features via API endpoints

## For Developers

### Database Migration

Run the new migration to set up RLS policies and analytics tables:

```sql
-- Run this migration
\i supabase/migrations/002_subscription_system_hardening.sql
```

This migration:
- Adds Pro subscription check helper function
- Updates RLS policies on upsolve_queue
- Creates weak_tag_analysis table
- Creates tag_mastery_tracking table
- Creates fail_decay_analysis table
- Updates topic_mastery with Pro-only policies

### API Migration

#### 1. Update Subscription Creation

**Old Code (Deprecated):**
```typescript
const response = await fetch('/api/subscriptions/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planCode: 'entry-gate' })
});
```

**New Code (Recommended):**
```typescript
const response = await fetch('/api/subscriptions/create-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planCode: 'entry-gate' })
});

const data = await response.json();
if (data.type === 'lifetime') {
  // Handle one-time payment
  initializeRazorpay(data.order_id, data.key);
} else if (data.type === 'recurring') {
  // Handle subscription
  window.location.href = data.short_url;
}
```

#### 2. Update Webhook Configuration

Configure these events in your Razorpay Dashboard:

- `payment.captured`
- `payment.failed`
- `subscription.activated`
- `subscription.charged`
- `subscription.cancelled`
- `subscription.paused`
- `subscription.completed`

Webhook URL: `https://your-domain.com/api/webhooks/razorpay`

#### 3. Environment Variables

Add these to your `.env.local`:

```bash
# Existing
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_xxx

# New - Required for webhooks
RAZORPAY_WEBHOOK_SECRET=xxx

# New - Optional for recurring plans
RAZORPAY_PLAN_ENTRY_GATE=plan_xxx
RAZORPAY_PLAN_CORE_BUILDER=plan_xxx
RAZORPAY_PLAN_ALGORITHMIC_ASCEND=plan_xxx
RAZORPAY_PLAN_COMPETITIVE_FORGE=plan_xxx
RAZORPAY_PLAN_MASTER_CRAFT=plan_xxx
```

### Code Changes Required

#### 1. Server-Side Feature Gating

**Before:**
```typescript
// UI-only check (insecure)
export default function ProtectedPage() {
  const { isPro } = useSubscription();
  if (!isPro) return <UpgradePrompt />;
  return <ProContent />;
}
```

**After:**
```typescript
// Server-side enforcement (secure)
import { requireProSubscription } from '@/lib/subscriptions/server-middleware';

export async function GET(req: Request) {
  const authCheck = await requireProSubscription(req);
  if (!authCheck.authorized) {
    return authCheck.response; // 403 Forbidden
  }
  
  // User has valid Pro subscription
  const userId = authCheck.userId;
  // ... rest of logic
}
```

#### 2. Using New Analytics APIs

```typescript
// Weak Tag Analysis
const weakTags = await fetch('/api/analytics/weak-tags').then(r => r.json());

// Mastery Tracking
const mastery = await fetch('/api/analytics/mastery').then(r => r.json());

// Fail-Decay Analysis
const failDecay = await fetch('/api/analytics/fail-decay').then(r => r.json());
```

#### 3. Using Upsolve Queue

```typescript
// Get queue
const queue = await fetch('/api/upsolve/queue').then(r => r.json());

// Add problem
await fetch('/api/upsolve/queue', {
  method: 'POST',
  body: JSON.stringify({
    problemId: 'uuid',
    source: 'manual'
  })
});

// Resolve problem
await fetch('/api/upsolve/resolve', {
  method: 'POST',
  body: JSON.stringify({
    problemId: 'uuid',
    success: true
  })
});
```

## Testing

### Run Tests

```bash
# Install test runner
npm install --save-dev tsx

# Run webhook idempotency tests
npx tsx __tests__/subscriptions/webhook-idempotency.test.ts

# Run RLS policy tests
npx tsx __tests__/subscriptions/rls-policy.test.ts
```

### Test Webhooks Locally

1. Use ngrok or similar to expose your local server
2. Configure webhook URL in Razorpay Dashboard
3. Create a test subscription
4. Verify webhook events are received and processed

## Rollout Plan

### Phase 1: Backend Deployment (Week 1)
- [ ] Deploy database migration
- [ ] Deploy new API endpoints
- [ ] Configure webhook secret
- [ ] Test webhook delivery

### Phase 2: Frontend Update (Week 2)
- [ ] Update subscription creation flows
- [ ] Add UI for new Pro features
- [ ] Test end-to-end subscription flow

### Phase 3: Migration (Week 3)
- [ ] Notify users of new features
- [ ] Monitor error logs
- [ ] Fix any edge cases

### Phase 4: Cleanup (Week 4)
- [ ] Remove deprecated endpoints
- [ ] Update documentation
- [ ] Final testing

## Troubleshooting

### Issue: Webhooks Not Received

**Solution:**
1. Check webhook URL is correct
2. Verify RAZORPAY_WEBHOOK_SECRET is set
3. Check webhook logs in Razorpay Dashboard
4. Ensure server is accessible from Razorpay

### Issue: Pro Features Not Accessible

**Solution:**
1. Check user's subscription status in database:
   ```sql
   SELECT subscription_plan, subscription_status, subscription_end
   FROM profiles WHERE id = 'user-id';
   ```
2. Verify subscription_status is 'active'
3. Verify subscription_end is null or in future
4. Check RLS policies are applied correctly

### Issue: Duplicate Webhook Processing

**Solution:**
- Webhooks are idempotent by design
- Check payment_events table for event_id
- Duplicate events will be skipped automatically

### Issue: TypeScript Errors

**Solution:**
- Most import errors are false positives
- Next.js resolves @ paths correctly at runtime
- Run `npm run build` to verify actual errors

## Support

- Documentation: `/docs/SUBSCRIPTION_API.md`
- Tests: `__tests__/subscriptions/`
- GitHub Issues: Report any problems

## FAQ

**Q: Will my existing subscription continue to work?**
A: Yes, all existing subscriptions are fully compatible.

**Q: Do I need to update my payment integration?**
A: Only if you want to support recurring billing. The old endpoint still works but is deprecated.

**Q: Are Pro features retroactive?**
A: Yes, all existing Pro users have immediate access to new features.

**Q: What happens to failed webhook deliveries?**
A: Razorpay will retry failed webhooks automatically. Events are processed idempotently.

**Q: Can I test subscriptions locally?**
A: Yes, use Razorpay test mode and ngrok for webhook testing.

## Checklist for Migration

- [ ] Run database migration
- [ ] Set RAZORPAY_WEBHOOK_SECRET
- [ ] Configure webhook URL in Razorpay Dashboard
- [ ] Enable required webhook events
- [ ] Test subscription creation flow
- [ ] Test webhook delivery
- [ ] Run test suite
- [ ] Update frontend components (optional)
- [ ] Monitor logs for errors
- [ ] Notify users of new features
