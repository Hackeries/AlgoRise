'use client';
import { useState, useCallback } from 'react';
import { loadScript } from '@/lib/load-script';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Props = {
  amount: number; // in INR, e.g., 149
  sheetCode?: string; // e.g., "level-1000"
  label?: string;
};

export function RazorpayCheckoutButton({
  amount,
  sheetCode,
  label = 'Buy Now',
}: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = useCallback(async () => {
    try {
      setLoading(true);

      if (!amount || amount <= 0) {
        alert('Amount is invalid. Please refresh the page and try again.');
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to continue.');
        return;
      }

      // Prefill info (optional)
      let name = '';
      let email = '';
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name,email')
        .eq('user_id', user.id)
        .maybeSingle();
      name = profile?.full_name || user.user_metadata?.name || '';
      email = profile?.email || user.email || '';

      // 1) Create order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR', sheetCode }),
        cache: 'no-store',
      });
      let orderJson: any = null;
      try {
        orderJson = await orderRes.json();
      } catch {
        // ignore, handled below
      }
      if (!orderRes.ok || !orderJson?.order_id) {
        alert(
          orderJson?.error ||
            'Unable to start payment right now. Please try again.'
        );
        return;
      }

      // 2) Load Razorpay SDK
      const ok = await loadScript(
        'https://checkout.razorpay.com/v1/checkout.js'
      );
      if (!ok || !window.Razorpay) {
        alert(
          'Payment SDK failed to load. Please check your connection and try again.'
        );
        return;
      }

      const { key, amount: orderAmount, currency, order_id } = orderJson;
      if (!key) {
        alert('Payment key is not configured. Please contact support.');
        return;
      }

      const options = {
        key,
        amount: orderAmount,
        currency,
        name: 'AlgoRise',
        description: sheetCode
          ? `Problem Sheet: ${sheetCode}`
          : 'Problem Sheet',
        order_id,
        theme: { color: '#2563EB' },
        prefill: { name, email },
        notes: sheetCode ? { sheetCode } : undefined,
        handler: async (response: any) => {
          // 3) Verify
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
            cache: 'no-store',
          });
          const verifyJson = await verifyRes.json();
          if (verifyRes.ok && verifyJson.verified) {
            window.location.href = '/paths';
          } else {
            alert(
              verifyJson?.error ||
                "We couldn't verify your payment. If you were charged, please contact support."
            );
          }
        },
        modal: {
          ondismiss: () => {
            // user closed modal
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on?.('payment.failed', (resp: any) => {
        const msg =
          resp?.error?.description ||
          resp?.error?.reason ||
          'Payment failed. Please try again or use a different method.';
        alert(msg);
      });
      rzp.open();
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [amount, sheetCode]);

  return (
    <Button
      type='button'
      onClick={onClick}
      disabled={loading || !amount || amount <= 0}
      aria-busy={loading}
    >
      {loading ? 'Processing...' : label}
    </Button>
  );
}

export default RazorpayCheckoutButton;