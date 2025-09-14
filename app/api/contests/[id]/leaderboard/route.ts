import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const contestId = params.id
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies },
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  // Aggregate score: solved count; penalty tie-breaker (lower is better)
  const { data, error } = await supabase.rpc("contest_leaderboard", { in_contest_id: contestId }).select().limit(200)

  // Fallback if RPC not present: aggregate in SQL via a view-on-the-fly
  if (error) {
    const { data: rows, error: aggErr } = await supabase
      .from("contest_submissions")
      .select("user_id, status, penalty_s")
      .eq("contest_id", contestId)

    if (aggErr) return NextResponse.json({ error: aggErr.message }, { status: 500 })

    const map = new Map<string, { user_id: string; solved: number; penalty: number }>()
    for (const r of rows ?? []) {
      const curr = map.get(r.user_id) ?? { user_id: r.user_id, solved: 0, penalty: 0 }
      if (r.status === "solved") curr.solved += 1
      curr.penalty += r.penalty_s ?? 0
      map.set(r.user_id, curr)
    }
    const list = Array.from(map.values()).sort((a, b) => {
      if (b.solved !== a.solved) return b.solved - a.solved
      return a.penalty - b.penalty
    })
    const withRank = list.map((r, idx) => ({ rank: idx + 1, ...r }))
    return NextResponse.json({ leaderboard: withRank })
  }

  return NextResponse.json({ leaderboard: data ?? [] })
}
