import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      console.error("ensure-profile: auth failed", { userErr, hasUser: !!user })
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const serviceClient = await createServiceRoleClient()
    if (!serviceClient) {
      console.error("ensure-profile: Service role client not available - SUPABASE_SERVICE_ROLE_KEY is missing")
      return NextResponse.json(
        { error: "Server configuration error: service role key missing" },
        { status: 500 }
      )
    }

    const { data: existingProfile } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ success: true, created: false })
    }

    const now = new Date().toISOString()
    const { error: insertErr } = await serviceClient.from("profiles").upsert(
      {
        id: user.id,
        created_at: now,
        updated_at: now,
      },
      { onConflict: "id", ignoreDuplicates: true }
    )

    if (insertErr) {
      console.error("ensure-profile: Profile insert error:", insertErr)
      if (insertErr.code === "23505") {
        return NextResponse.json({ success: true, created: false })
      }
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, created: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown error"
    console.error("ensure-profile: Unexpected error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
