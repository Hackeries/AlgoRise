// API route for fetching problem hints
// Implements a multi-level progressive hint system

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/problems/hints?problemId=xxx&level=1 - Get hint for a specific level
export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("problemId");
    const level = parseInt(searchParams.get("level") || "1");

    if (!problemId) {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      );
    }

    if (level < 1 || level > 4) {
      return NextResponse.json(
        { error: "Invalid hint level (must be 1-4)" },
        { status: 400 }
      );
    }

    // Fetch hints up to and including the requested level
    const { data: hints, error } = await supabase
      .from("problem_hints")
      .select("*")
      .eq("problem_id", problemId)
      .lte("level", level)
      .order("level", { ascending: true });

    if (error) {
      console.error("Error fetching hints:", error);
      return NextResponse.json(
        { error: "Failed to fetch hints" },
        { status: 500 }
      );
    }

    return NextResponse.json({ hints: hints || [] });
  } catch (error) {
    console.error("Error in GET /api/problems/hints:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
