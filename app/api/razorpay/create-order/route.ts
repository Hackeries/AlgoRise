import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const {
      amount,
      currency = "INR",
      sheetCode,
    } = (await req.json()) as {
      amount: number
      currency?: string
      sheetCode?: string
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay env vars missing" }, { status: 500 })
    }

    // Create order in Razorpay (amount in paise)
    const rp = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const order = await rp.orders.create({
      amount: Math.round(amount * 100),
      currency,
      notes: sheetCode ? { sheetCode } : undefined,
    })

    // Persist pending purchase
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { error: upErr } = await supabase.from("purchases").insert({
      user_id: user.id,
      sheet_code: sheetCode || null,
      amount: Math.round(amount * 100),
      currency,
      order_id: order.id,
      status: "created",
    })
    if (upErr) {
      // We still return order to client, but log server-side for diagnostics
      console.error("[v0] purchases insert failed:", upErr.message)
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || keyId,
    })
  } catch (err: any) {
    console.error("[v0] create-order error:", err?.message)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
