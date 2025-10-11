import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      (await req.json()) as {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      };

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing Razorpay verification fields.' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Razorpay secret key is not set in environment.' },
        { status: 500 }
      );
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { ok: false, verified: false, error: 'Invalid Razorpay signature.' },
        { status: 400 }
      );
    }

    const supabase = (await createClient()) as SupabaseClient;

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated.' },
        { status: 401 }
      );
    }

    // Fetch purchase record
    const { data: purchase, error: fetchErr } = await supabase
      .from('purchases')
      .select('id, sheet_code')
      .eq('order_id', razorpay_order_id)
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !purchase) {
      return NextResponse.json(
        { error: 'Purchase record not found.' },
        { status: 404 }
      );
    }

    // Update purchase as paid
    const { error: updErr } = await supabase
      .from('purchases')
      .update({
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'paid',
      })
      .eq('id', purchase.id);

    if (updErr)
      console.error('Failed to update purchase status:', updErr.message);

    // Unlock sheet for user (cast to any for TS)
    if (purchase.sheet_code) {
      const { error: entErr } = await (supabase.from('user_sheets') as any)
        .insert({ user_id: user.id, sheet_code: purchase.sheet_code })
        .onConflict(['user_id', 'sheet_code'])
        .ignore();
      if (entErr)
        console.error('Failed to unlock sheet for user:', entErr.message);
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      sheetCode: purchase.sheet_code,
    });
  } catch (err: any) {
    console.error('Razorpay verification error:', err?.message);
    return NextResponse.json(
      { error: 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
