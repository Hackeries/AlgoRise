import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BattleService from "@/lib/battle-service";
import { RealTimeNotificationManager } from "@/lib/realtime-notifications";

export async function POST(req: Request) {
  const supabase = await createClient();
  const battleService = new BattleService();
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
    const { battleId, accept } = body;

    if (!battleId) {
      return NextResponse.json({ 
        success: false, 
        message: "battleId is required" 
      }, { status: 400 });
    }

    if (accept) {
      // Start the battle
      const result = await battleService.startBattle(battleId);
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: "Battle started successfully"
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: result.message 
        }, { status: 400 });
      }
    } else {
      // Decline the match - cancel the battle
      const { error } = await supabase
        .from('battles')
        .update({ 
          status: 'cancelled',
          ended_at: new Date().toISOString()
        })
        .eq('id', battleId);

      if (error) {
        console.error("Error cancelling battle:", error);
        return NextResponse.json({ 
          success: false, 
          message: "Failed to decline match" 
        }, { status: 500 });
      }

      // Notify participants
      const { data: participants } = await supabase
        .from('battle_participants')
        .select('user_id')
        .eq('battle_id', battleId);

      if (participants) {
        const userIds = participants.map((p: any) => p.user_id);
        await rtManager.sendToUsers(userIds, {
          type: 'battle_cancelled',
          battleId,
          message: 'Battle was cancelled as one player declined'
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Match declined successfully"
      });
    }
  } catch (error) {
    console.error("Error handling match acceptance:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to handle match acceptance" 
    }, { status: 500 });
  }
}