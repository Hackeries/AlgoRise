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
    return NextResponse.json({ 
      error: "You must be logged in to submit code" 
    }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { roundId, codeText, language = "cpp" } = body;

    // Enhanced validation
    if (!roundId) {
      return NextResponse.json({ 
        error: "Round ID is required" 
      }, { status: 400 });
    }

    if (!codeText) {
      return NextResponse.json({ 
        error: "Code cannot be empty" 
      }, { status: 400 });
    }

    if (codeText.trim().length < 10) {
      return NextResponse.json({ 
        error: "Code is too short. Please provide a valid solution." 
      }, { status: 400 });
    }

    if (codeText.length > 10 * 1024) { // 10KB limit
      return NextResponse.json({ 
        error: "Code is too long. Maximum allowed size is 10KB." 
      }, { status: 400 });
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
      return NextResponse.json({ 
        error: "Failed to verify your participation in this battle" 
      }, { status: 500 });
    }

    if (!participant) {
      return NextResponse.json({ 
        error: "You are not a participant in this battle" 
      }, { status: 403 });
    }

    // Verify round belongs to this battle
    const { data: round, error: roundError } = await supabase
      .from("battle_rounds")
      .select("id, battle_id")
      .eq("id", roundId)
      .eq("battle_id", battleId)
      .maybeSingle();

    if (roundError) {
      console.error("Error checking round:", roundError);
      return NextResponse.json({ 
        error: "Failed to verify round" 
      }, { status: 500 });
    }

    if (!round) {
      return NextResponse.json({ 
        error: "Round not found in this battle" 
      }, { status: 404 });
    }

    // Check for submission throttling
    const { data: lastSubmission } = await supabase
      .from("battle_submissions")
      .select("submitted_at")
      .eq("user_id", user.id)
      .eq("battle_id", battleId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastSubmission) {
      const lastSubmitTime = new Date(lastSubmission.submitted_at).getTime();
      const currentTime = Date.now();
      const timeDiff = currentTime - lastSubmitTime;
      
      // Minimum 10 seconds between submissions
      if (timeDiff < 10000) {
        const waitTime = Math.ceil((10000 - timeDiff) / 1000);
        return NextResponse.json({ 
          error: `Please wait ${waitTime} seconds before submitting again` 
        }, { status: 429 });
      }
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
      // Return user-friendly error messages
      const userFriendlyMessage = result.message?.includes('wait') 
        ? result.message
        : "Failed to submit your solution. Please try again.";
      
      return NextResponse.json({ 
        error: userFriendlyMessage 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Solution submitted successfully",
      submissionId: result.submissionId
    });
  } catch (error: any) {
    console.error("Error in POST /api/battles/[id]/submit:", error);
    
    // Don't expose internal errors to users
    return NextResponse.json({ 
      error: "An error occurred while submitting your code. Please try again." 
    }, { status: 500 });
  }
}