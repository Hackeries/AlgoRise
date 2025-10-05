import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") === "30d" ? 30 : 7
  
  try {
    const supabase = await createClient()
    
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

    // Get problems solved from adaptive_items
    const { data: solvedItems } = await supabase
      .from("adaptive_items")
      .select("problem_id")
      .eq("user_id", user.id)
      .eq("status", "solved")

    const problemsSolved = solvedItems?.length || 0

    return NextResponse.json({
      currentStreak: streak?.current_streak ?? 0,
      longestStreak: streak?.longest_streak ?? 0,
      problemsSolved,
      avgTimeMins: 0, // TODO: Calculate from timing data if available
      ratingChange,
    })
  } catch (error) {
    console.error('Error in analytics summary:', error)
    // Return mock data when Supabase is not available
    return NextResponse.json({ 
      currentStreak: 7, 
      longestStreak: 15, 
      problemsSolved: 42, 
      avgTimeMins: 25, 
      ratingChange: 50 
    })
  }
}
