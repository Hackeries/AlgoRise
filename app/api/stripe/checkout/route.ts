import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { cookies, headers } from "next/headers"
import { createServerClient } from "@supabase/ssr"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" })

export async function POST(req: NextRequest) {
  try {
    const { name, amountInr, kind, recurring } = await req.json()

    if (!name || !kind) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const origin = headers().get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Optional: attach user id via Supabase if available
    let userId: string | undefined
    try {
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name: string) => cookieStore.get(name)?.value,
          },
        },
      )
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id
    } catch {
      // ignore if Supabase not configured
    }

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      quantity: 1,
      price_data: {
        currency: "inr",
        unit_amount: amountInr ? amountInr * 100 : undefined,
        product_data: { name },
        ...(kind === "subscription" ? { recurring: { interval: recurring || "month" } } : {}),
      } as any,
    }

    const session = await stripe.checkout.sessions.create({
      mode: kind === "subscription" ? "subscription" : "payment",
      line_items: [lineItem],
      success_url: `${origin}/pricing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      metadata: { product_name: name, user_id: userId || "" },
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create checkout session" }, { status: 500 })
  }
}
