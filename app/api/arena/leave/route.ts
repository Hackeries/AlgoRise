import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BattleMatchmakingService from "@/lib/battle-matchmaking";

export async function POST(req: Request) {
  const supabase = await createClient();
  const matchmakingService = BattleMatchmakingService.getInstance();

  try {
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Remove user from the matchmaking queue
    const result = await matchmakingService.leaveQueue(user.id);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Left queue successfully"
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error leaving battle queue:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to leave queue" 
    }, { status: 500 });
  }
}