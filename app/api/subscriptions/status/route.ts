/**
 * Get User Subscription Status
 * 
 * GET /api/subscriptions/status
 * 
 * Returns the current user's subscription information.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserSubscription } from '@/lib/subscriptions/service';
import { isSubscriptionActive } from '@/lib/subscriptions/utils';

export async function GET() {
  try {
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

    const subscription = await getUserSubscription(supabase, user.id);

    if (!subscription) {
      // Return default free plan
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        isActive: true,
        isLifetime: true,
      });
    }

    const isActive = isSubscriptionActive(subscription);

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      isActive,
      isLifetime: subscription.isLifetime,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
    });
  } catch (error: any) {
    console.error('[Subscription] Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status.' },
      { status: 500 }
    );
  }
}
