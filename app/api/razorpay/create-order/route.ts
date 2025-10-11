import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Parse request
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
        { error: 'The amount provided is invalid or zero.' },
        { status: 400 }
      );
    }

    // Razorpay keys
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay API keys are missing from environment.' },
        { status: 500 }
      );
    }

    // Create Razorpay order
    const rp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rp.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency,
      notes: sheetCode ? { sheetCode } : undefined,
    });

    // Create Supabase server client
    const supabase = createServerComponentClient({ cookies });

    // Get current authenticated user
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to make a purchase.' },
        { status: 401 }
      );
    }

    // Insert pending purchase
    const { error: upErr } = await supabase.from('purchases').insert({
      user_id: user.id,
      sheet_code: sheetCode || null,
      amount: Math.round(amount * 100),
      currency,
      order_id: order.id,
      status: 'created',
    });

    if (upErr) {
      console.error('Failed to save purchase in database:', upErr.message);
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || keyId,
    });
  } catch (err: any) {
    console.error('Error while creating Razorpay order:', err?.message);
    return NextResponse.json(
      { error: 'Unable to create payment order. Please try again.' },
      { status: 500 }
    );
  }
}