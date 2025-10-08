import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cfGetProblems, type CodeforcesProblem } from "@/lib/codeforces-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Return only public contests for non-authenticated users
    const { data: contests, error } = await supabase
      .from("contests")
      .select("*")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching public contests:", error);
      return NextResponse.json({ contests: [] }, { status: 500 });
    }

    return NextResponse.json({ 
      contests: contests?.map(contest => ({
        ...contest,
        isRegistered: false,
        isHost: false
      })) || [] 
    });
  }

  // For authenticated users, let RLS handle the filtering
  const { data: contests, error } = await supabase
    .from("contests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching contests:", error);
    return NextResponse.json({ contests: [] }, { status: 500 });
  }

  // Check which contests the user is registered for
  const { data: participations, error: partErr } = await supabase
    .from("contest_participants")
    .select("contest_id")
    .eq("user_id", user.id);

  if (partErr) {
    console.error("Error fetching participations:", partErr);
  }

  const registeredContestIds = new Set(participations?.map((p: any) => p.contest_id) || []);

  const formattedContests = contests?.map((contest: any) => ({
    ...contest,
    isRegistered: registeredContestIds.has(contest.id),
    isHost: contest.host_user_id === user.id,
  })) || [];

  return NextResponse.json({ contests: formattedContests });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Creating contest for user:", user.id);

    // Simple validation
    const name = body.name?.toString()?.trim() || "";
    if (!name) {
      return NextResponse.json({ error: "Contest name is required" }, { status: 400 });
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
    };

    console.log("Contest insert data:", contestInsert);

    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .insert(contestInsert)
      .select()
      .single();

    if (contestError) {
      console.error("Database error:", contestError);
      return NextResponse.json({ 
        error: `Database error: ${contestError.message}`,
        details: contestError 
      }, { status: 500 });
    }

    console.log("Contest created successfully:", contest.id);

    return NextResponse.json({ 
      success: true,
      contest: {
        id: contest.id,
        name: contest.name,
        status: contest.status,
      }
    });

  } catch (error) {
    console.error("Contest creation failed:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
