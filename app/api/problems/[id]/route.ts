// API route for fetching a specific problem by ID
// Includes full problem details with test cases and hints

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/problems/[id] - Get full problem details
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const problemId = params.id;

    // Fetch problem details
    const { data: problem, error: problemError } = await supabase
      .from("problems")
      .select("*")
      .eq("id", problemId)
      .eq("is_active", true)
      .single();

    if (problemError || !problem) {
      console.error("Error fetching problem:", problemError);
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // Fetch hints for this problem
    const { data: hints, error: hintsError } = await supabase
      .from("problem_hints")
      .select("*")
      .eq("problem_id", problemId)
      .order("level", { ascending: true });

    if (hintsError) {
      console.warn("Error fetching hints:", hintsError);
      // Continue without hints - not critical
    }

    // Fetch user's history with this problem (if any)
    const { data: history, error: historyError } = await supabase
      .from("problem_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("problem_id", problemId)
      .single();

    if (historyError && historyError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - that's fine
      console.warn("Error fetching problem history:", historyError);
    }

    return NextResponse.json({
      problem: {
        ...problem,
        hints: hints || [],
        userHistory: history || null,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/problems/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/problems/[id] - Update problem interaction (attempt, solve, time spent)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const problemId = params.id;
    const body = await req.json();
    const { action, timeSpentSeconds } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Get or create problem history record
    let { data: history, error: fetchError } = await supabase
      .from("problem_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("problem_id", problemId)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      // No history exists, create it
      const { data: newHistory, error: createError } = await supabase
        .from("problem_history")
        .insert({
          user_id: user.id,
          problem_id: problemId,
          battle_id: null,
          battle_round_id: null,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating problem history:", createError);
        return NextResponse.json(
          { error: "Failed to create problem history" },
          { status: 500 }
        );
      }

      history = newHistory;
    } else if (fetchError) {
      console.error("Error fetching problem history:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch problem history" },
        { status: 500 }
      );
    }

    // Update based on action
    const updates: any = {
      last_attempted_at: new Date().toISOString(),
    };

    if (action === "attempt") {
      updates.attempt_count = (history?.attempt_count || 0) + 1;
    } else if (action === "solve") {
      updates.solved_at = new Date().toISOString();
      updates.attempt_count = (history?.attempt_count || 0) + 1;
    }

    if (timeSpentSeconds) {
      updates.time_spent_seconds =
        (history?.time_spent_seconds || 0) + timeSpentSeconds;
    }

    // Update the history record
    const { data: updatedHistory, error: updateError } = await supabase
      .from("problem_history")
      .update(updates)
      .eq("id", history.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating problem history:", updateError);
      return NextResponse.json(
        { error: "Failed to update problem history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, history: updatedHistory });
  } catch (error) {
    console.error("Error in PATCH /api/problems/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
