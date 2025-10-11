'use client';
import { useEffect, useState, useCallback } from 'react';
import { loadScript } from '@/lib/load-script';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { WalletCards } from 'lucide-react';

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
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/razorpay/create-order', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok && data?.enabled) {
          setEnabled(true);
        } else {
          setEnabled(false);
          setReason(data?.reason || 'Checkout unavailable.');
        }
      } catch {
        if (active) {
          setEnabled(false);
          setReason('Network error while checking payment status.');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onClick = useCallback(async () => {
    try {
      setLoading(true);

      if (!amount || amount <= 0) {
        toast({
          title: 'Invalid amount',
          description: 'Please refresh the page and try again.',
          variant: 'destructive',
        });
        return;
      }

      if (enabled === false) {
        toast({
          title: 'Checkout unavailable',
          description: reason || 'Payments are currently disabled.',
          variant: 'destructive',
        });
        return;
      }

      // Require sign-in but fail gracefully
      let userId: string | null = null;
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        // ignore – may be running without Supabase config
      }
      if (!userId) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to complete the purchase.',
          variant: 'destructive',
        });
        window.location.href = '/auth/login';
        return;
      }

      // 1) Create order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR', sheetCode }),
        cache: 'no-store',
      });
      const orderJson = await orderRes.json().catch(() => null);
      if (!orderRes.ok || !orderJson?.order_id) {
        toast({
          title: 'Unable to start payment',
          description: orderJson?.error || 'Please try again later.',
          variant: 'destructive',
        });
        return;
      }

      // 2) Load Razorpay SDK
      const ok = await loadScript(
        'https://checkout.razorpay.com/v1/checkout.js'
      );
      if (!ok || !window.Razorpay) {
        toast({
          title: 'Payment SDK failed to load',
          description: 'Check your connection and try again.',
          variant: 'destructive',
        });
        return;
      }

      const { key, amount: orderAmount, currency, order_id } = orderJson;
      if (!key) {
        toast({
          title: 'Missing key',
          description: 'Payment key is not configured.',
          variant: 'destructive',
        });
        return;
      }

      const rzp = new window.Razorpay({
        key,
        amount: orderAmount,
        currency,
        name: 'AlgoRise',
        description: sheetCode
          ? `Problem Sheet: ${sheetCode}`
          : 'Problem Sheet',
        order_id,
        theme: { color: '#2563EB' },
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
          const verifyJson = await verifyRes.json().catch(() => null);
          if (verifyRes.ok && verifyJson?.verified) {
            toast({
              title: 'Payment successful',
              description: 'Access unlocked. Redirecting…',
            });
            window.location.href = '/paths';
          } else {
            toast({
              title: 'Verification failed',
              description:
                verifyJson?.error ||
                "We couldn't verify your payment. If you were charged, please contact support.",
              variant: 'destructive',
            });
          }
        },
        modal: {
          ondismiss: () => {
            toast({
              title: 'Payment cancelled',
              description: 'You closed the checkout.',
            });
          },
        },
      });

      rzp.on?.('payment.failed', (resp: any) => {
        const msg =
          resp?.error?.description ||
          resp?.error?.reason ||
          'Payment failed. Please try again.';
        toast({
          title: 'Payment failed',
          description: msg,
          variant: 'destructive',
        });
      });
      rzp.open();
    } catch (e: any) {
      toast({
        title: 'Something went wrong',
        description: e?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [amount, sheetCode, enabled, reason]);

  return (
    <Button
      type='button'
      onClick={onClick}
      disabled={loading || !amount || amount <= 0 || enabled === false}
      aria-busy={loading}
      aria-label={
        enabled === false ? 'Checkout unavailable' : `Buy now for ₹${amount}`
      }
      title={
        enabled === false
          ? reason ?? 'Checkout unavailable'
          : `Buy now for ₹${amount}`
      }
      className={`w-full transition-all ${
        enabled === false ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {loading ? (
        'Processing…'
      ) : enabled === false ? (
        'Unavailable'
      ) : (
        <span className='inline-flex items-center gap-2'>
          <WalletCards className='h-4 w-4' aria-hidden='true' />
          {label}
        </span>
      )}
    </Button>
  );
}

export default RazorpayCheckoutButton;