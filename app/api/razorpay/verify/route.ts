import crypto from "crypto"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = (await req.json()) as {
      razorpay_payment_id: string
      razorpay_order_id: string
      razorpay_signature: string
    }

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing verification fields" }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay secret missing" }, { status: 500 })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex")
    const isValid = expectedSignature === razorpay_signature
    if (!isValid) {
      return NextResponse.json({ ok: false, verified: false }, { status: 400 })
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Update purchase to paid and get sheet code
    const { data: purchase, error: fetchErr } = await supabase
      .from("purchases")
      .select("id, sheet_code")
      .eq("order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .single()
    if (fetchErr || !purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    const { error: updErr } = await supabase
      .from("purchases")
      .update({
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status: "paid",
      })
      .eq("id", purchase.id)
    if (updErr) {
      console.error("[v0] purchases update failed:", updErr.message)
    }

    // Unlock sheet for user
    if (purchase.sheet_code) {
      const { error: entErr } = await supabase
        .from("user_sheets")
        .insert({ user_id: user.id, sheet_code: purchase.sheet_code })
      if (entErr && entErr.code !== "23505") {
        // ignore unique-violation if already unlocked
        console.error("[v0] user_sheets insert failed:", entErr.message)
      }
    }

    return NextResponse.json({ ok: true, verified: true, sheetCode: purchase.sheet_code })
  } catch (err: any) {
    console.error("[v0] verify error:", err?.message)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
