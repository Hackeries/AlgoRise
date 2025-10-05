import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { handle } = await req.json()
    if (!handle || typeof handle !== "string") {
      return NextResponse.json({ error: "handle required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const token = `RG-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`

    // upsert row
    const { error: upErr } = await supabase.from("cf_handles").upsert(
      {
        user_id: user.id,
        handle,
        verified: false,
        verification_token: token,
      },
      { onConflict: "user_id" },
    )
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    return NextResponse.json({ handle, token })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 })
  }
}
