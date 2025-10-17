// API routes for Code Battle Arena

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BattleMatchmakingService from "@/lib/battle-matchmaking";
import BattleService from "@/lib/battle-service";

export const dynamic = "force-dynamic";

// GET /api/battles - Get user's battles
export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's battles (both as host and participant)
    const { data: battles, error } = await supabase
      .from("battles")
      .select(`
        *,
        battle_participants(*),
        battle_rounds(*)
      `)
      .or(`host_user_id.eq.${user.id},guest_user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching battles:", error);
      return NextResponse.json({ error: "Failed to fetch battles" }, { status: 500 });
    }

    return NextResponse.json({ battles });
  } catch (error) {
    console.error("Error in GET /api/battles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/battles - Create a new battle or join matchmaking queue
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
    const { action, format = "best_of_3" } = body;

    if (action === "join_queue") {
      // Join matchmaking queue
      const matchmakingService = BattleMatchmakingService.getInstance();
      const userRating = await matchmakingService.getUserRating(user.id);
      
      const result = await matchmakingService.joinQueue(user.id, userRating, format);
      
      if (result.success && result.battleId) {
        // If matched immediately, start the battle
        const battleService = new BattleService();
        await battleService.startBattle(result.battleId);
      }
      
      return NextResponse.json(result);
    } else if (action === "create_private") {
      // Create a private battle
      const { guestUserId } = body;
      
      if (!guestUserId) {
        return NextResponse.json({ error: "Guest user ID required" }, { status: 400 });
      }
      
      // Get user ratings
      const matchmakingService = BattleMatchmakingService.getInstance();
      const hostRating = await matchmakingService.getUserRating(user.id);
      const guestRating = await matchmakingService.getUserRating(guestUserId);
      
      // Create battle record
      const { data: battle, error: battleError } = await supabase
        .from("battles")
        .insert({
          host_user_id: user.id,
          guest_user_id: guestUserId,
          status: "waiting",
          format
        })
        .select()
        .single();
        
      if (battleError) {
        console.error("Error creating private battle:", battleError);
        return NextResponse.json({ error: "Failed to create battle" }, { status: 500 });
      }
      
      // Create participant records
      const { error: participantError } = await supabase
        .from("battle_participants")
        .insert([
          {
            battle_id: battle.id,
            user_id: user.id,
            rating_before: hostRating,
            is_host: true
          },
          {
            battle_id: battle.id,
            user_id: guestUserId,
            rating_before: guestRating,
            is_host: false
          }
        ]);
        
      if (participantError) {
        console.error("Error creating battle participants:", participantError);
        return NextResponse.json({ error: "Failed to create participants" }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Private battle created", 
        battleId: battle.id 
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in POST /api/battles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}