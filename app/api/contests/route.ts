import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ contests: [] })
  }

  // Get contests from user's groups and public contests
  const { data: contests, error } = await supabase
    .from("contests")
    .select(`
      id,
      name,
      start_time,
      type,
      groups!inner(
        group_memberships!inner(user_id)
      )
    `)
    .eq("groups.group_memberships.user_id", user.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5)

  const formattedContests =
    contests?.map((contest) => ({
      id: contest.id,
      name: contest.name,
      date: new Date(contest.start_time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      type: contest.type as "group" | "public",
    })) || []

  return NextResponse.json({ contests: formattedContests })
}
