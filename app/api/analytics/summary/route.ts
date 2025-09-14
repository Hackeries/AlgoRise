import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") === "30d" ? 30 : 7
  const supabase = getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ currentStreak: 0, longestStreak: 0, problemsSolved: 0, avgTimeMins: 0, ratingChange: 0 })
  }

  // Streaks
  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak,longest_streak")
    .eq("user_id", user.id)
    .maybeSingle()

  // Rating change from cf_snapshots within range
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString()
  const { data: points } = await supabase
    .from("cf_snapshots")
    .select("created_at,rating")
    .eq("user_id", user.id)
    .gte("created_at", since)
    .order("created_at", { ascending: true })

  let ratingChange = 0
  if (points && points.length >= 2) {
    ratingChange = (points[points.length - 1].rating ?? 0) - (points[0].rating ?? 0)
  }

  // Problems solved and avg time can be wired later; return 0 as placeholder
  return NextResponse.json({
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
    problemsSolved: 0,
    avgTimeMins: 0,
    ratingChange,
  })
}
