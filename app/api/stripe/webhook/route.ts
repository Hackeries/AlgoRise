import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export const dynamic = "force-dynamic"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" })
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET // optional

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.payment_succeeded":
      // TODO: mark entitlements for user_id (in event.metadata) in DB
      break
    default:
      break
  }
}

export async function POST(req: NextRequest) {
  try {
    let event: Stripe.Event

    if (endpointSecret) {
      const rawBody = await req.text()
      const sig = req.headers.get("stripe-signature")!
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
    } else {
      const json = await req.json()
      event = json as Stripe.Event
    }

    await handleEvent(event)
    return new NextResponse("OK", { status: 200 })
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }
}
