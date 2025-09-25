import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getUserRatings } from "@/lib/codeforces-api";

// --- Types ---
interface CFHandle {
  handle: string;
  rating: number;
}

interface ProfileData {
  id: string;
  full_name: string | null;
  cf_handles: CFHandle[];
  college_id: string | null;
  colleges: { name: string } | null;
}

type RatingMap = Record<string, { rating: number }>;

// --- Utils: Fetch ratings in parallel ---
// This function is now imported from "@/lib/codeforces-api"

// --- API Handler ---
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") as "same" | "all"; // same | all
    const ratingMin = parseInt(url.searchParams.get("ratingMin") || "0");
    const ratingMax = parseInt(url.searchParams.get("ratingMax") || "4000");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (!["same", "all"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // --- Supabase client ---
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: await cookies() }
    );

    // --- Auth check ---
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Build query ---
    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        cf_handles!inner(handle, rating),
        college_id,
        colleges(name)
      `
      )
      .not("cf_handles.handle", "is", null)
      .gte("cf_handles.rating", ratingMin)
      .lte("cf_handles.rating", ratingMax)
      .order("cf_handles.rating", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type === "same") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("college_id")
        .eq("id", user.id)
        .single();

      if (!profile?.college_id) {
        return NextResponse.json({ error: "No college set" }, { status: 400 });
      }

      query = query.eq("college_id", profile.college_id);
    }

    // --- Execute query ---
    const { data: profiles, error } = (await query) as {
      data: ProfileData[] | null;
      error: any;
    };

    if (error || !profiles) {
      return NextResponse.json(
        { error: error?.message || "Failed to fetch profiles" },
        { status: 500 }
      );
    }

    // --- Extract handles & fetch live ratings ---
    const allHandles = profiles
      .map((p) => p.cf_handles.map((h) => h.handle))
      .flat()
      .filter(Boolean);

    const ratings = await getUserRatings(allHandles);

    // --- Build leaderboard ---
    const leaderboard = profiles.map((p: ProfileData, index: number) => {
      // Pick highest rated handle
      const mainHandle = p.cf_handles.reduce(
        (best, h) => (h.rating > best.rating ? h : best),
        p.cf_handles[0]
      );

      const handle = mainHandle?.handle || "Unknown";
      const liveRating =
        ratings[handle]?.rating ?? mainHandle?.rating ?? 0;

      return {
        id: p.id,
        name: p.full_name || handle,
        handle,
        rating: liveRating,
        college: p.colleges?.name || "Unknown",
        rank: offset + index + 1,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
