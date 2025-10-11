import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // <- use our server util

export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
  const enabled = Boolean((keyId && keySecret) || publicKey);

  return NextResponse.json(
    enabled
      ? { enabled: true, mode: keyId && keySecret ? 'server' : 'client-only' }
      : {
          enabled: false,
          reason:
            'Payments are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vars to enable checkout.',
        },
    { status: enabled ? 200 : 503 }
  );
}

export async function POST(req: Request) {
  try {
    const {
      amount,
      currency = 'INR',
      sheetCode,
    } = (await req.json()) as {
      amount: number;
      currency?: string;
      sheetCode?: string;
    };

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than zero.' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error:
            'Checkout is disabled on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in project Vars.',
          missingKeys: [
            ...(keyId ? [] : ['RAZORPAY_KEY_ID']),
            ...(keySecret ? [] : ['RAZORPAY_KEY_SECRET']),
          ],
        },
        { status: 422 }
      );
    }

    const rp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rp.orders.create({
      amount: Math.round(amount * 100),
      currency,
      notes: sheetCode ? { sheetCode } : undefined,
    });

    // Optional: user context + best-effort logging
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('purchases').insert({
          user_id: user.id,
          sheet_code: sheetCode || null,
          amount: order.amount,
          currency,
          order_id: order.id,
          status: 'created',
        });
      }
    } catch (e) {
      console.log(
        '[v0] Skipping purchase log (no auth or DB):',
        (e as any)?.message
      );
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || keyId,
    });
  } catch (e) {
    console.error('[v0] Razorpay create-order error:', (e as any)?.message);
    return NextResponse.json(
      {
        error:
          "We couldn't create your payment order. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}