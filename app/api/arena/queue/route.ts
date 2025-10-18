import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BattleMatchmakingService from "@/lib/battle-matchmaking";
import { RealTimeNotificationManager } from "@/lib/realtime-notifications";

export async function POST(req: Request) {
  const supabase = await createClient();
  const matchmakingService = BattleMatchmakingService.getInstance();
  const rtManager = RealTimeNotificationManager.getInstance();

  try {
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const format = body.format || 'best_of_3';

    // Get user's current battle rating
    const userRating = await matchmakingService.getUserRating(user.id);

    // Add user to the matchmaking queue
    const result = await matchmakingService.joinQueue(user.id, userRating, format);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Joined queue successfully",
        battleId: result.battleId
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error joining battle queue:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to join queue" 
    }, { status: 500 });
  }
}