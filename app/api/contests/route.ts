import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cfGetProblems } from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Return only public contests for non-authenticated users
    const { data: contests, error } = await supabase
      .from("contests")
      .select("*")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching public contests:", error)
      return NextResponse.json({ contests: [] }, { status: 500 })
    }

    return NextResponse.json({
      contests:
        contests?.map((contest) => ({
          ...contest,
          isRegistered: false,
          isHost: false,
        })) || [],
    })
  }

  // For authenticated users, let RLS handle the filtering
  const { data: contests, error } = await supabase
    .from("contests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching contests:", error)
    return NextResponse.json({ contests: [] }, { status: 500 })
  }

  // Check which contests the user is registered for
  const { data: participations, error: partErr } = await supabase
    .from("contest_participants")
    .select("contest_id")
    .eq("user_id", user.id)

  if (partErr) {
    console.error("Error fetching participations:", partErr)
  }

  const registeredContestIds = new Set(participations?.map((p: any) => p.contest_id) || [])

  const formattedContests =
    contests?.map((contest: any) => ({
      ...contest,
      isRegistered: registeredContestIds.has(contest.id),
      isHost: contest.host_user_id === user.id,
    })) || []

  return NextResponse.json({ contests: formattedContests })
}

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    console.log("Creating contest for user:", user.id)

    // Simple validation
    const name = body.name?.toString()?.trim() || ""
    if (!name) {
      return NextResponse.json({ error: "Contest name is required" }, { status: 400 })
    }

    // Create basic contest - let RLS handle the rest
    const contestInsert = {
      name,
      description: body.description?.toString()?.trim() || "",
      visibility: body.visibility === "public" ? "public" : "private",
      status: "draft",
      host_user_id: user.id,
      starts_at: body.starts_at,
      ends_at: body.ends_at,
      max_participants: body.max_participants || null,
      allow_late_join: body.allow_late_join !== false,
      contest_mode: body.contest_mode === "icpc" ? "icpc" : "practice",
      duration_minutes: body.duration_minutes || 120,
      problem_count: body.problem_count || 5,
      rating_min: body.rating_min || 800,
      rating_max: body.rating_max || 1600,
    }

    console.log("Contest insert data:", contestInsert)

    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .insert(contestInsert)
      .select()
      .single()

    if (contestError) {
      console.error("Database error:", contestError)
      return NextResponse.json(
        {
          error: `Database error: ${contestError.message}`,
          details: contestError,
        },
        { status: 500 },
      )
    }

    console.log("Contest created successfully:", contest.id)

    // Auto-generate contest problems from Codeforces by rating range
    try {
      const minR = Number(contestInsert.rating_min) || 800
      const maxR = Number(contestInsert.rating_max) || 1600
      const count = Number(contestInsert.problem_count) || 5

      // Fetch all problems once
      const problemsResp = await cfGetProblems()
      if (problemsResp.status === "OK" && "result" in problemsResp && problemsResp.result) {
        const all = problemsResp.result.problems || []
        // Filter by rating range and basic sanity
        const pool = all.filter((p: any) => {
          const r = p?.rating
          return r && r >= minR && r <= maxR && p.contestId && p.index && p.name
        })

        // Shuffle and pick unique problems by contestId+index
        const shuffled = pool.sort(() => Math.random() - 0.5)
        const picked = []
        const seen = new Set<string>()
        for (const p of shuffled) {
          const key = `${p.contestId}${p.index}`
          if (seen.has(key)) continue
          seen.add(key)
          picked.push(p)
          if (picked.length >= count) break
        }

        if (picked.length > 0) {
          const rows = picked.map((p: any, i: number) => ({
            contest_id: contest.id,
            problem_id: `${p.contestId}${p.index}`,
            title: p.name,
            points: 1, // reveal points after contest ends in UI; keep 1 point each by default
            contest_id_cf: p.contestId,
            index_cf: p.index,
            rating: p.rating ?? null,
          }))

          const { error: insertErr } = await supabase.from("contest_problems").insert(rows)
          if (insertErr) {
            console.error("Failed to insert contest problems:", insertErr)
          } else {
            console.log(`Inserted ${rows.length} problems for contest`, contest.id)
          }
        } else {
          console.warn("No CF problems matched the selected rating range", { minR, maxR })
        }
      } else {
        console.warn("CF problems fetch failed:", problemsResp.comment)
      }
    } catch (e) {
      console.error("Auto-generate problems failed:", e)
    }

    return NextResponse.json({
      success: true,
      contest: {
        id: contest.id,
        name: contest.name,
        status: contest.status,
      },
    })
  } catch (error) {
    console.error("Contest creation failed:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
