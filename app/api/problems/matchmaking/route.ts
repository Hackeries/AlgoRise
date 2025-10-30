// API route for fetching problems for battle matchmaking
// This route ensures problems are NEVER hardcoded and always fetched dynamically from the database

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/problems/matchmaking - Get problems for matchmaking based on user rating
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
    const targetRating = parseInt(searchParams.get("rating") || "1200");
    const ratingRange = parseInt(searchParams.get("range") || "200");
    const count = parseInt(searchParams.get("count") || "2");
    const daysThreshold = parseInt(searchParams.get("days") || "7");

    // Validate parameters
    if (targetRating < 800 || targetRating > 3500) {
      return NextResponse.json(
        { error: "Invalid rating range (must be 800-3500)" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { error: "Invalid count (must be 1-10)" },
        { status: 400 }
      );
    }

    // Call the database function to get random problems
    const { data: problems, error } = await supabase.rpc(
      "get_matchmaking_problems",
      {
        p_user_id: user.id,
        p_target_rating: targetRating,
        p_rating_range: ratingRange,
        p_count: count,
        p_days_threshold: daysThreshold,
      }
    );

    if (error) {
      console.error("Error fetching matchmaking problems:", error);
      return NextResponse.json(
        { error: "Failed to fetch problems" },
        { status: 500 }
      );
    }

    // If we don't have enough problems in the rating range, expand the search
    if (!problems || problems.length < count) {
      console.warn(
        `Not enough problems found for rating ${targetRating}±${ratingRange}. Found: ${problems?.length || 0}`
      );

      // Try again with a wider range
      const { data: expandedProblems, error: expandedError } = await supabase
        .rpc("get_matchmaking_problems", {
          p_user_id: user.id,
          p_target_rating: targetRating,
          p_rating_range: ratingRange * 2, // Double the range
          p_count: count,
          p_days_threshold: daysThreshold,
        });

      if (expandedError) {
        console.error("Error fetching expanded problems:", expandedError);
        return NextResponse.json(
          { error: "Failed to fetch problems" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        problems: expandedProblems || [],
        message:
          expandedProblems && expandedProblems.length > 0
            ? "Expanded search range to find suitable problems"
            : "No suitable problems found",
      });
    }

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Error in GET /api/problems/matchmaking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/problems/matchmaking - Record problem view/interaction
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
    const { problemId, battleId, battleRoundId } = body;

    if (!problemId) {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      );
    }

    // Record the problem view
    const { error } = await supabase.rpc("record_problem_view", {
      p_user_id: user.id,
      p_problem_id: problemId,
      p_battle_id: battleId || null,
      p_battle_round_id: battleRoundId || null,
    });

    if (error) {
      console.error("Error recording problem view:", error);
      return NextResponse.json(
        { error: "Failed to record problem view" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/problems/matchmaking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
