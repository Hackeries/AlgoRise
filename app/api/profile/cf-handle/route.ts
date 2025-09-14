import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ handle: null, verified: false })
  }

  // Get latest CF handle from snapshots
  const { data: snapshot } = await supabase
    .from("cf_snapshots")
    .select("cf_handle, rating")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    handle: snapshot?.cf_handle || null,
    verified: !!snapshot?.cf_handle,
    rating: snapshot?.rating || null,
  })
}
