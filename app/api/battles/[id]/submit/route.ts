// API route to submit solutions in a battle

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BattleService from "@/lib/battle-service";
import { RealTimeNotificationManager } from "@/lib/realtime-notifications";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const battleId = id;
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { roundId, codeText, language = "cpp" } = body;

    if (!roundId || !codeText) {
      return NextResponse.json({ error: "Round ID and code text required" }, { status: 400 });
    }

    // Verify user is a participant in this battle
    const { data: participant, error: participantError } = await supabase
      .from("battle_participants")
      .select("id")
      .eq("battle_id", battleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (participantError) {
      console.error("Error checking participant:", participantError);
      return NextResponse.json({ error: "Failed to verify participant" }, { status: 500 });
    }

    if (!participant) {
      return NextResponse.json({ error: "Not a participant in this battle" }, { status: 403 });
    }

    // Verify round belongs to this battle
    const { data: round, error: roundError } = await supabase
      .from("battle_rounds")
      .select("id")
      .eq("id", roundId)
      .eq("battle_id", battleId)
      .maybeSingle();

    if (roundError) {
      console.error("Error checking round:", roundError);
      return NextResponse.json({ error: "Failed to verify round" }, { status: 500 });
    }

    if (!round) {
      return NextResponse.json({ error: "Round not found in this battle" }, { status: 404 });
    }

    // Submit solution using battle service
    const battleService = new BattleService();
    const result = await battleService.submitSolution(
      battleId,
      roundId,
      user.id,
      codeText,
      language
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Solution submitted successfully",
      submissionId: result.submissionId
    });
  } catch (error) {
    console.error("Error in POST /api/battles/[id]/submit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}