# Quick Start: Pricing & Subscription System

Get the AlgoRise subscription system up and running in 5 minutes.

---

## 🚀 Quick Setup

### 1. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and set:
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
NEXT_PUBLIC_RAZORPAY_KEY=your_test_key_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Supabase (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Run Database Migration

```bash
# Via Supabase SQL Editor
# 1. Go to https://app.supabase.com/project/_/sql
# 2. Open scripts/031_create_subscriptions_system.sql
# 3. Copy contents and run in SQL Editor

# Or via psql
psql -h your-supabase-host -U postgres -f scripts/031_create_subscriptions_system.sql
```

### 3. Install Dependencies (if needed)

```bash
npm install
# or
pnpm install
```

### 4. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

### 5. Test the Integration

1. Navigate to `http://localhost:3000/pricing`
2. Click any "Upgrade" button
3. Use test card: `4111 1111 1111 1111` (CVV: any 3 digits, Expiry: any future date)
4. Complete payment
5. Verify subscription in your profile

---

## 🎯 Using Subscription Features

### Check User's Subscription

```tsx
import { useSubscription } from '@/hooks/use-subscription';

function MyComponent() {
  const { subscription, isPremium, hasAccess } = useSubscription();

  if (isPremium) {
    return <div>Welcome, Premium User!</div>;
  }

  return <div>Upgrade to unlock features</div>;
}
```

### Gate Premium Features

```tsx
import { SubscriptionGate } from '@/components/subscriptions';

<SubscriptionGate requiredPlan="core-builder">
  <PremiumFeature />
</SubscriptionGate>
```

### Add Checkout Button

```tsx
import { SubscriptionCheckoutButton } from '@/components/subscriptions';

<SubscriptionCheckoutButton
  planCode="algorithmic-ascend"
  planName="Algorithmic Ascend"
  amount={169}
  label="Upgrade Now"
/>
```

### Show Subscription Badge

```tsx
import { SubscriptionBadge } from '@/components/subscriptions';

<SubscriptionBadge plan={subscription.plan} />
```

---

## 🔐 Webhook Setup

### Local Development (using ngrok)

```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Start ngrok
ngrok http 3000

# 3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)

# 4. In Razorpay Dashboard:
#    - Go to Settings > Webhooks
#    - Add webhook: https://abc123.ngrok.io/api/webhooks/razorpay
#    - Select events: payment.captured, payment.failed, order.paid
#    - Save and copy the webhook secret

# 5. Update .env.local with webhook secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_dashboard
```

### Production

```bash
# In Razorpay Dashboard:
# 1. Switch to Live mode
# 2. Add webhook: https://your-domain.com/api/webhooks/razorpay
# 3. Select same events
# 4. Update production env with webhook secret
```

---

## ✅ Verification Checklist

- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] `/pricing` page loads correctly
- [ ] Checkout button opens Razorpay modal
- [ ] Test payment completes successfully
- [ ] Subscription appears in database
- [ ] User profile updated with plan
- [ ] Premium features unlock
- [ ] Webhook receives events (if configured)

---

## 🐛 Quick Troubleshooting

### "Checkout is disabled"
→ Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local`

### "Authentication required"
→ User must be logged in. Redirect to `/auth/login`

### Payment succeeds but subscription not activated
→ Check webhook configuration and logs

### Features still locked after payment
→ Clear browser cache and refresh the page

---

## 📚 Next Steps

- Read full documentation: [PRICING_INTEGRATION.md](./PRICING_INTEGRATION.md)
- Configure production Razorpay keys
- Set up monitoring and alerts
- Test edge cases (failed payments, duplicate webhooks)
- Implement custom feature gating logic

---

## 🆘 Need Help?

- Check [PRICING_INTEGRATION.md](./PRICING_INTEGRATION.md) for detailed docs
- Review [Razorpay Documentation](https://razorpay.com/docs/)
- Check [Supabase Documentation](https://supabase.com/docs)

---

**Happy Building! 🚀**
