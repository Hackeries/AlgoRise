import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ problems: [] })
  }

  // Get user's current rating and weak tags from recent attempts
  const { data: userProfile } = await supabase
    .from("cf_snapshots")
    .select("rating")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const currentRating = userProfile?.rating || 1200

  // Get user's weak tags (low accuracy tags)
  const { data: attempts } = await supabase
    .from("adaptive_items")
    .select("tags, status")
    .eq("user_id", user.id)
    .not("status", "eq", "pending")
    .limit(50)

  // Calculate weak tags
  const tagStats: Record<string, { solved: number; total: number }> = {}
  attempts?.forEach((attempt) => {
    if (attempt.tags && Array.isArray(attempt.tags)) {
      attempt.tags.forEach((tag: string) => {
        if (!tagStats[tag]) tagStats[tag] = { solved: 0, total: 0 }
        tagStats[tag].total++
        if (attempt.status === "solved") tagStats[tag].solved++
      })
    }
  })

  const weakTags = Object.entries(tagStats)
    .filter(([_, stats]) => stats.total >= 3)
    .map(([tag, stats]) => ({ tag, accuracy: stats.solved / stats.total }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((item) => item.tag)

  // Generate adaptive problems based on rating and weak tags
  const targetRating = Math.max(800, currentRating - 200) // Slightly easier than current rating
  const problems = [
    {
      id: "daily-1",
      title: `${weakTags[0] || "Implementation"} Practice`,
      rating: targetRating,
      tags: [weakTags[0] || "implementation"],
      url: `https://codeforces.com/problemset?tags=${weakTags[0] || "implementation"}&order=BY_RATING_ASC`,
    },
    {
      id: "daily-2",
      title: `${weakTags[1] || "Math"} Challenge`,
      rating: targetRating + 100,
      tags: [weakTags[1] || "math"],
      url: `https://codeforces.com/problemset?tags=${weakTags[1] || "math"}&order=BY_RATING_ASC`,
    },
    {
      id: "daily-3",
      title: `${weakTags[2] || "Greedy"} Problem`,
      rating: targetRating + 200,
      tags: [weakTags[2] || "greedy"],
      url: `https://codeforces.com/problemset?tags=${weakTags[2] || "greedy"}&order=BY_RATING_ASC`,
    },
  ]

  return NextResponse.json({ problems })
}
