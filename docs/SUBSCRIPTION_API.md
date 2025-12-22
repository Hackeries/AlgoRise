# Subscription System API Documentation

## Overview

The AlgoRise subscription system has been refactored to support Razorpay subscriptions with proper security, idempotency, and Pro-feature gating. This document describes the new API endpoints and migration path.

## Key Changes

### 🔐 Security Improvements
- **Signature Verification**: All webhooks verify Razorpay signatures
- **Idempotency**: Duplicate events are safely handled
- **Server-side Gating**: Pro features are enforced at the API level, not just UI

### 🔄 Subscription Support
- **Recurring Billing**: Support for monthly/yearly subscriptions
- **Lifetime Plans**: One-time payment for lifetime access
- **Event Handling**: Proper webhook handling for all subscription events

### 📊 Pro Analytics
- **Weak Tag Detection**: Identify user's weakest performing topics
- **Mastery Tracking**: Per-tag performance scores and trends
- **Fail-Decay Analysis**: Retention patterns based on upsolve progression

## API Endpoints

### Subscription Management

#### Create Subscription (Recommended)
```
POST /api/subscriptions/create-subscription
```

**Request Body:**
```json
{
  "planCode": "entry-gate" | "core-builder" | "algorithmic-ascend" | "competitive-forge" | "master-craft"
}
```

**Response:**
```json
{
  "success": true,
  "type": "lifetime" | "recurring",
  "order_id": "order_xyz",
  "amount": 9900,
  "currency": "INR",
  "key": "rzp_test_xyz",
  "plan_name": "Entry Gate"
}
```

#### Create Order (Deprecated)
```
POST /api/subscriptions/create-order
```

**Status:** ⚠️ Deprecated - Use `/api/subscriptions/create-subscription` instead

### Upsolve Queue (Pro-only)

All upsolve endpoints require active Pro subscription.

```
GET /api/upsolve/queue
POST /api/upsolve/queue
POST /api/upsolve/resolve
```

### Pro Analytics

All analytics endpoints require active Pro subscription.

```
GET /api/analytics/weak-tags
POST /api/analytics/weak-tags
GET /api/analytics/mastery
POST /api/analytics/mastery
GET /api/analytics/fail-decay
POST /api/analytics/fail-decay
```

## Environment Variables

```bash
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_xxx
RAZORPAY_WEBHOOK_SECRET=xxx
```

## Testing

```bash
npx tsx __tests__/subscriptions/webhook-idempotency.test.ts
npx tsx __tests__/subscriptions/rls-policy.test.ts
```
