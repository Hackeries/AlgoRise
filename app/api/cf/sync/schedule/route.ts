import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { userId, handle } = await req.json()

    const supabase = await createClient()

    // Schedule daily sync (in production, use a job queue like Vercel Cron)
    const { error } = await supabase.from("cf_sync_schedule").upsert(
      {
        user_id: userId,
        handle,
        next_sync_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        active: true,
      },
      { onConflict: "user_id" },
    )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sync schedule error:", error)
    return NextResponse.json({ error: "Failed to schedule sync" }, { status: 500 })
  }
}
