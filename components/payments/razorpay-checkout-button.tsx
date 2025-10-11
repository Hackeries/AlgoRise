"use client"
import { useState, useCallback } from "react"
import { loadScript } from "@/lib/load-script"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

declare global {
  interface Window {
    Razorpay: any
  }
}

type Props = {
  amount: number // in INR, e.g., 149
  sheetCode?: string // e.g., "level-1000"
  label?: string
}

export function RazorpayCheckoutButton({ amount, sheetCode, label = "Buy Problem Sheet" }: Props) {
  const [loading, setLoading] = useState(false)

  const onClick = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        alert("Please sign in to continue")
        setLoading(false)
        return
      }

      // Prefill info from profile
      let name = ""
      let email = ""
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("user_id", user.id)
        .maybeSingle()
      name = profile?.full_name || user.user_metadata?.name || ""
      email = profile?.email || user.email || ""

      // 1) Create order on server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "INR", sheetCode }),
        cache: "no-store",
      })
      const orderJson = await orderRes.json()
      if (!orderRes.ok) {
        console.error("[v0] create-order error:", orderJson?.error)
        alert(orderJson?.error || "Failed to start payment")
        setLoading(false)
        return
      }

      // 2) Load Razorpay checkout script
      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js")
      if (!ok || !window.Razorpay) {
        alert("Razorpay SDK failed to load. Check your network.")
        setLoading(false)
        return
      }

      const options = {
        key: orderJson.key as string,
        amount: orderJson.amount,
        currency: orderJson.currency,
        name: "AlgoRise",
        description: sheetCode ? `Problem Sheet: ${sheetCode}` : "Problem Sheet",
        order_id: orderJson.order_id,
        theme: { color: "#2563EB" }, // brand color
        prefill: { name, email },
        handler: async (response: any) => {
          // 3) Verify on server and unlock
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
            cache: "no-store",
          })
          const verifyJson = await verifyRes.json()
          if (verifyRes.ok && verifyJson.verified) {
            alert("Payment successful! Sheet unlocked.")
            // Optional: redirect to sheet/learning path
            // location.href = verifyJson.sheetCode ? `/paths?sheet=${verifyJson.sheetCode}` : "/paths"
          } else {
            alert("We could not verify your payment. Please contact support.")
          }
        },
        modal: {
          ondismiss: () => {
            // user closed the modal
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e: any) {
      console.error("[v0] Razorpay flow error:", e?.message)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [amount, sheetCode])

  return (
    <Button onClick={onClick} disabled={loading}>
      {loading ? "Processing..." : label}
    </Button>
  )
}

export default RazorpayCheckoutButton
