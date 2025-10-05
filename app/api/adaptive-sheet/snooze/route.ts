import { NextResponse } from "next/server"
import { snooze as snoozeMemory } from "@/lib/adaptive-store"
import { createClient } from "@/lib/supabase/server"
import { snoozeDb } from "@/lib/adaptive-db"

export async function POST(req: Request) {
  const { problemId, minutes = 60 } = await req.json()
  if (!problemId) return NextResponse.json({ error: "problemId required" }, { status: 400 })

  try {
    const supabase = await createClient()
    const { data: userRes } = await supabase.auth.getUser()
    const userId = userRes?.user?.id
    if (userId) {
      const res = await snoozeDb(supabase, userId, problemId, minutes)
      if ("error" in res && res.error) throw res.error
      return NextResponse.json({ ok: true, nextDueAt: res.nextDueAt }, { status: 200 })
    }
  } catch {}

  const data = snoozeMemory("demo", problemId, minutes)
  return NextResponse.json(data, { status: 200 })
}
