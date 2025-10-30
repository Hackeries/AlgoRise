# Pricing & Subscription System - README Addition

Add this section to your main README.md file.

---

## 💳 Pricing & Subscription System

AlgoRise includes a production-ready payment and subscription system powered by Razorpay.

### Features

- ✅ **5 Subscription Tiers** - From Entry Gate (₹49) to Master Craft (₹419)
- ✅ **Lifetime Access** - All plans include lifetime access, no recurring charges
- ✅ **Secure Payments** - Razorpay integration with signature verification
- ✅ **Webhook Processing** - Server-side payment confirmation
- ✅ **Feature Gating** - Content access based on subscription level
- ✅ **Real-time Updates** - Instant subscription activation

### Quick Start

1. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   # Set your Razorpay credentials
   ```

2. **Run Database Migration**
   ```bash
   # Via Supabase SQL Editor
   # Run: scripts/031_create_subscriptions_system.sql
   ```

3. **Start Development**
   ```bash
   npm run dev
   # Visit http://localhost:3000/pricing
   ```

### Documentation

- **[PRICING_INTEGRATION.md](./PRICING_INTEGRATION.md)** - Complete documentation (400+ lines)
- **[QUICK_START_PRICING.md](./QUICK_START_PRICING.md)** - 5-minute setup guide
- **[DEPLOYMENT_STEPS_PRICING.md](./DEPLOYMENT_STEPS_PRICING.md)** - Production deployment
- **[PRICING_SYSTEM_SUMMARY.md](./PRICING_SYSTEM_SUMMARY.md)** - Implementation overview

### Usage Example

```tsx
import { SubscriptionGate } from '@/components/subscriptions';

// Gate premium features
<SubscriptionGate requiredPlan="core-builder">
  <PremiumContent />
</SubscriptionGate>

// Or use the hook
import { useSubscription } from '@/hooks/use-subscription';

const { hasAccess, isPremium } = useSubscription();
if (hasAccess('algorithmic-ascend')) {
  // Show advanced features
}
```

### Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| Entry Gate | ₹49 | 80+ problems, lifetime access |
| Core Builder | ₹99 | 120+ problems, mini-contests |
| Algorithmic Ascend | ₹169 | 150+ problems, analytics (Most Popular) |
| Competitive Forge | ₹259 | 150+ elite problems, forum |
| Master Craft | ₹419 | 200+ elite problems, live analysis |

### Testing

Use Razorpay test credentials and test card:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Production Setup

1. Complete Razorpay KYC verification
2. Switch to Live mode
3. Update environment variables
4. Configure webhook: `https://your-domain.com/api/webhooks/razorpay`
5. Run database migration
6. Test with small real transaction

See [DEPLOYMENT_STEPS_PRICING.md](./DEPLOYMENT_STEPS_PRICING.md) for detailed steps.

---
