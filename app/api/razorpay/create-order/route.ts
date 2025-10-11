import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // <- use our server util

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
            'Payment is not configured yet. Please contact support to enable checkout.',
        },
        { status: 500 }
      );
    }

    const rp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rp.orders.create({
      amount: Math.round(amount * 100),
      currency,
      notes: sheetCode ? { sheetCode } : undefined,
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to continue.' },
        { status: 401 }
      );
    }

    // best-effort logging of created order
    await supabase.from('purchases').insert({
      user_id: user.id,
      sheet_code: sheetCode || null,
      amount: order.amount,
      currency,
      order_id: order.id,
      status: 'created',
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || keyId,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "We couldn't create your payment order. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
