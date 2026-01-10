'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { SubscriptionPlanCode } from '@/lib/subscriptions/types';
import { loadScript } from '@/lib/load-script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionCheckoutButtonProps {
  planCode: SubscriptionPlanCode;
  planName: string;
  amount: number;
  label?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export function SubscriptionCheckoutButton({
  planCode,
  planName,
  amount,
  label = 'Upgrade Now',
  disabled = false,
  className = '',
  variant = 'default',
}: SubscriptionCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = useCallback(async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to purchase a plan.',
          variant: 'destructive',
        });
        // Redirect to login
        window.location.href = `/auth/login?redirect=/pricing`;
        return;
      }

      // Create order
      const orderRes = await fetch('/api/subscriptions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planCode }),
        cache: 'no-store',
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData?.order_id) {
        toast({
          title: 'Unable to create order',
          description: orderData?.error || 'Please try again later.',
          variant: 'destructive',
        });
        return;
      }

      // Load Razorpay SDK
      const scriptLoaded = await loadScript(
        'https://checkout.razorpay.com/v1/checkout.js'
      );

      if (!scriptLoaded || !window.Razorpay) {
        toast({
          title: 'Payment SDK failed to load',
          description: 'Please check your connection and try again.',
          variant: 'destructive',
        });
        return;
      }

      // Configure Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AlgoRise',
        description: `${planName} Subscription`,
        order_id: orderData.order_id,
        theme: {
          color: '#2563EB',
        },
        prefill: {
          email: user.email,
        },
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyRes = await fetch('/api/subscriptions/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
              cache: 'no-store',
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData?.verified) {
              toast({
                title: '🎉 Payment successful!',
                description: 'Your subscription has been activated. Redirecting...',
              });

              // Redirect to dashboard or profile after a short delay
              setTimeout(() => {
                window.location.href = '/profile';
              }, 2000);
            } else {
              toast({
                title: 'Verification failed',
                description:
                  verifyData?.error ||
                  "We couldn't verify your payment. Please contact support.",
                variant: 'destructive',
              });
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Verification error',
              description: 'Please contact support with your payment ID.',
              variant: 'destructive',
            });
          }
        },
        modal: {
          ondismiss: () => {
            toast({
              title: 'Payment cancelled',
              description: 'You closed the checkout window.',
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response: any) => {
        const errorMsg =
          response?.error?.description ||
          response?.error?.reason ||
          'Payment failed. Please try again.';
        toast({
          title: 'Payment failed',
          description: errorMsg,
          variant: 'destructive',
        });
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Something went wrong',
        description: error?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [planCode, planName, amount]);

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading || !amount || amount <= 0}
      className={className}
      variant={variant}
      type="button"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
