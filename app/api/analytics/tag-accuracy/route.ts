import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ tags: [], mock: false })
  }

  // Query real user attempts and calculate tag accuracy
  const { data: attempts, error } = await supabase
    .from("adaptive_items")
    .select("tags, status")
    .eq("user_id", user.id)
    .not("status", "eq", "pending")

  if (error || !attempts) {
    return NextResponse.json({ tags: [], mock: false })
  }

  // Calculate accuracy by tag
  const tagStats: Record<string, { solved: number; total: number }> = {}

  attempts.forEach((attempt) => {
    if (attempt.tags && Array.isArray(attempt.tags)) {
      attempt.tags.forEach((tag: string) => {
        if (!tagStats[tag]) {
          tagStats[tag] = { solved: 0, total: 0 }
        }
        tagStats[tag].total++
        if (attempt.status === "solved") {
          tagStats[tag].solved++
        }
      })
    }
  })

  const tags = Object.entries(tagStats)
    .filter(([_, stats]) => stats.total >= 3) // Only show tags with at least 3 attempts
    .map(([tag, stats]) => ({
      tag,
      accuracy: Math.round((stats.solved / stats.total) * 100),
      solved: stats.solved,
    }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 10) // Top 10 tags

  return NextResponse.json({ tags, mock: false })
}
