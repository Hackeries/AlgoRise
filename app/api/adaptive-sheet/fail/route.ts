import { NextResponse } from "next/server"
import { updateOutcome } from "@/lib/adaptive-store"
import { createClient } from "@/lib/supabase/server"
import { updateOutcomeDb, type DbItem } from "@/lib/adaptive-db"
import { computeNext } from "@/lib/sr"

export async function POST(req: Request) {
  const { problemId } = await req.json()
  if (!problemId) return NextResponse.json({ error: "problemId required" }, { status: 400 })

  try {
    const supabase = await createClient()
    const { data: userRes } = await supabase.auth.getUser()
    const userId = userRes?.user?.id
    if (userId) {
      const res = await updateOutcomeDb(supabase, userId, problemId, (row: DbItem) => {
        const next = computeNext(
          {
            id: row.problem_id,
            problem: {
              id: row.problem_id,
              platform: "codeforces" as const,
              problemId: row.problem_id,
              title: row.problem_title ?? row.problem_id,
              url: row.problem_url ?? "",
              rating: row.rating,
              tags: row.tags ?? [],
            },
            repetitions: row.repetitions ?? 0,
            ease: Number(row.ease ?? 2.5),
            intervalDays: row.interval_days ?? 0,
            nextDueAt: row.next_due_at,
          },
          "failed",
        )
        return {
          ...row,
          repetitions: next.repetitions,
          ease: next.ease,
          interval_days: next.intervalDays,
          next_due_at: next.nextDueAt,
          last_outcome: "failed",
        }
      })
      if ("error" in res && res.error) throw res.error
      return NextResponse.json({ ok: true, nextDueAt: res.nextDueAt }, { status: 200 })
    }
  } catch {}

  const data = updateOutcome("demo", problemId, "failed")
  return NextResponse.json(data, { status: 200 })
}
