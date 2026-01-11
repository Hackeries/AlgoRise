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
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    // Use service role client to bypass RLS for profile creation
    const serviceClient = await createServiceRoleClient()
    if (!serviceClient) {
      console.error("Service role client not available")
      // Fall back to regular client
      return await createProfileWithRegularClient(supabase, user.id)
    }

    // Check if profile already exists
    const { data: existingProfile } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ success: true, created: false })
    }

    // Create profile using service role client (bypasses RLS)
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
      console.error("Profile insert error:", insertErr)
      // Handle duplicate key error gracefully
      if (insertErr.code === "23505") {
        return NextResponse.json({ success: true, created: false })
      }
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, created: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown error"
    console.error("Ensure profile error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function createProfileWithRegularClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (existingProfile) {
    return NextResponse.json({ success: true, created: false })
  }

  const now = new Date().toISOString()
  const { error: insertErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      created_at: now,
      updated_at: now,
    },
    { onConflict: "id", ignoreDuplicates: true }
  )

  if (insertErr) {
    console.error("Profile insert error (fallback):", insertErr)
    if (insertErr.code === "23505") {
      return NextResponse.json({ success: true, created: false })
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, created: true })
}
