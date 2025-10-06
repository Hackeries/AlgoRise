import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
    console.log("Request body:", body);
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate required fields
  const {
    name,
    description,
    start_time,
    end_time,
  // created_by, // Do not take from body
    duration_minutes,
    problem_count,
    rating_min,
    rating_max,
    max_participants,
    allow_late_join,
  } = body;

  if (!name || !start_time || !duration_minutes || !problem_count) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  console.log("user.id:", user.id);

  // Insert contest into database
  const { data, error } = await supabase.from("contests").insert([
    {
      name,
      description,
      start_time,
      end_time,
      duration_minutes,
      rating_min,
      rating_max,
      max_participants,
      allow_late_join,
      problem_count,
      created_by: user.id,
      created_at: new Date().toISOString(),
      status: "upcoming",
    },
  ]).select('id, name, description, start_time, end_time, duration_minutes, rating_min, rating_max, max_participants, allow_late_join, problem_count, created_by, created_at, status');

  console.log("Supabase insert error:", error);
  console.log("Supabase insert data:", data);

  if (error) {
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  

  return NextResponse.json({ contest: data?.[0] || null });
}
export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ contests: [] });
  }

  const { data: contests, error } = await supabase
    .from("contests")
    .select(`
      id,
      name,
      description,
      status,
      start_time,
      end_time,
      duration_minutes,
      max_participants,
      allow_late_join,
      created_by,
      created_at,
      problem_count,
      rating_min,
      rating_max,
      type
    `)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5);

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json({ contests: [] });
  }

  // Filter contests: public OR user is in group
  const userContests = (contests || []).filter(
    (c: any) =>
      c.type === "public" ||
      (c.groups?.some((g: any) =>
        g.group_memberships?.some((m: any) => m.user_id === user.id)
      ))
  );

  const formattedContests = userContests.map((contest: any) => ({
    id: contest.id,
    name: contest.name,
    description: contest.description || "",
    status: contest.status || "upcoming",
    start_time: contest.start_time
      ? new Date(contest.start_time).toISOString()
      : null,
    end_time: contest.end_time
      ? new Date(contest.end_time).toISOString()
      : null,
    duration_minutes: contest.duration_minutes || 120,
    max_participants: contest.max_participants || null,
    allow_late_join: contest.allow_late_join ?? true,
    created_by: contest.created_by || null,
    created_at: contest.created_at
      ? new Date(contest.created_at).toISOString()
      : new Date().toISOString(),
    problem_count: contest.problem_count || 5,
    rating_min: contest.rating_min || 1200,
    rating_max: contest.rating_max || 1400,
    type: contest.type || "public",
  }));

  return NextResponse.json({ contests: formattedContests });
}

