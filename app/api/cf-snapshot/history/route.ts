import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("cf_snapshots")
      .select("rating, at")
      .order("at", { ascending: false })
      .limit(5)
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    const points = (data ?? []).reverse()
    return NextResponse.json({ ok: true, data: points })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to load history" }, { status: 500 })
  }
}
