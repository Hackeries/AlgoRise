import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { applyMeaningfulAction, getStreak } from "@/lib/streaks"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const row = await getStreak(supabase, user.id)
    if (!row) {
      return Response.json({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDay: null,
        updatedAt: null,
      })
    }
    return Response.json({
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      lastActiveDay: row.last_active_day,
      updatedAt: row.updated_at,
    })
  } catch (error) {
    console.error("Error in GET /api/streaks:", error)
    if (error instanceof Error && error.message.includes("Supabase configuration missing")) {
      return Response.json({ error: "Authentication service not configured" }, { status: 503 })
    }
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json().catch(() => ({}) as any)
    const now = body?.now ? new Date(body.now) : new Date()

    // Look up previous longest before applying the action
    const prev = await getStreak(supabase, user.id)

    const updated = await applyMeaningfulAction(supabase, user.id, now)
    const newLongest = (prev?.longest_streak ?? 0) < updated.longest_streak

    return Response.json({
      currentStreak: updated.current_streak,
      longestStreak: updated.longest_streak,
      lastActiveDay: updated.last_active_day,
      updatedAt: updated.updated_at,
      newLongest, // celebrate on client if true
    })
  } catch (error) {
    console.error("Error in POST /api/streaks:", error)
    if (error instanceof Error && error.message.includes("Supabase configuration missing")) {
      return Response.json({ error: "Authentication service not configured" }, { status: 503 })
    }
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
