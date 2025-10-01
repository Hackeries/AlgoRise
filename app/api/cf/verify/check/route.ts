import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cfGetUserInfo } from "@/lib/codeforces-api"

async function fetchCfUser(handle: string) {
  const response = await cfGetUserInfo(handle)
  if (response.status !== "OK" || !('result' in response) || !response.result?.[0]) {
    throw new Error('comment' in response ? response.comment : "CF API bad response")
  }
  return response.result[0] as { handle: string; organization?: string; rating?: number; maxRating?: number }
}

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data: row, error: selErr } = await supabase
      .from("cf_handles")
      .select("handle, verification_token, verified")
      .eq("user_id", user.id)
      .single()
    if (selErr || !row) return NextResponse.json({ error: "no handle to verify" }, { status: 400 })
    if (row.verified) return NextResponse.json({ verified: true })

    const cf = await fetchCfUser(row.handle)
    const org = (cf.organization || "").toString().toLowerCase()
    const token = (row.verification_token || "").toLowerCase()
    const matched = !!token && org.includes(token)

    if (!matched) {
      return NextResponse.json({ verified: false, reason: "token not found in organization" }, { status: 200 })
    }

    const { error: upErr } = await supabase
      .from("cf_handles")
      .update({ verified: true, verification_token: null, last_sync_at: new Date().toISOString() })
      .eq("user_id", user.id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

 const { error: snapErr } = await supabase.from("cf_snapshots").insert({
  user_id: user.id,
  handle: cf.handle,
  rating: cf.rating ?? null,
  max_rating: cf.maxRating ?? null,
  captured_at: new Date().toISOString(),
})

if (snapErr) {
  console.error("Snapshot insert error:", snapErr)
  return NextResponse.json({ error: snapErr }, { status: 500 })
}

    return NextResponse.json({ verified: true, rating: cf.rating ?? null, maxRating: cf.maxRating ?? null })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 })
  }
}
