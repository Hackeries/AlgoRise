import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({ success: true, created: false })
    }

    const now = new Date().toISOString()
    const { error: insertErr } = await supabase.from("profiles").insert({
      id: user.id,
      created_at: now,
      updated_at: now,
    })

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, created: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 })
  }
}
