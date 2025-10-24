// API route to join a battle

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BattleMatchmakingService from "@/lib/battle-matchmaking";
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
    // Get battle details
    const { data: battle, error: battleError } = await supabase
      .from("battles")
      .select("*")
      .eq("id", battleId)
      .single();

    if (battleError || !battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }

    // Check if battle is waiting for players
    if (battle.status !== "waiting") {
      return NextResponse.json({ error: "Battle is not available for joining" }, { status: 400 });
    }

    // Check if user is already in the battle
    const { data: existingParticipant, error: participantError } = await supabase
      .from("battle_participants")
      .select("id")
      .eq("battle_id", battleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (participantError) {
      console.error("Error checking existing participant:", participantError);
      return NextResponse.json({ error: "Failed to check participant status" }, { status: 500 });
    }

    if (existingParticipant) {
      return NextResponse.json({ error: "Already joined this battle" }, { status: 400 });
    }

    // Get user rating
    const matchmakingService = BattleMatchmakingService.getInstance();
    const userRating = await matchmakingService.getUserRating(user.id);

    // Add user as participant
    const { error: insertError } = await supabase
      .from("battle_participants")
      .insert({
        battle_id: battleId,
        user_id: user.id,
        rating_before: userRating,
        is_host: false
      });

    if (insertError) {
      console.error("Error joining battle:", insertError);
      return NextResponse.json({ error: "Failed to join battle" }, { status: 500 });
    }

    // If this is a private battle and both players have joined, start the battle
    const { data: participants, error: participantsError } = await supabase
      .from("battle_participants")
      .select("user_id")
      .eq("battle_id", battleId);

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      // Don't fail the join, but log the error
    }

    // Notify participants
    const rtManager = RealTimeNotificationManager.getInstance();
    
    // Notify the joining user
    await rtManager.sendToUser(user.id, {
      type: "battle_joined",
      battleId,
      message: "Successfully joined the battle"
    });

    // Notify other participants
    if (participants) {
      const otherParticipants = participants
        .filter((p: any) => p.user_id !== user.id)
        .map((p: any) => p.user_id);
        
      await rtManager.sendToUsers(otherParticipants, {
        type: "battle_player_joined",
        battleId,
        playerId: user.id,
        message: "A new player has joined the battle"
      });

      // If both players have joined, start the battle
      if (participants.length === 2) {
        // Update battle status to in_progress
        const { error: updateError } = await supabase
          .from("battles")
          .update({
            status: "in_progress",
            started_at: new Date().toISOString()
          })
          .eq("id", battleId);

        if (updateError) {
          console.error("Error starting battle:", updateError);
        } else {
          // Notify all participants that battle has started
          const allParticipantIds = participants.map((p: any) => p.user_id);
          await rtManager.sendToUsers(allParticipantIds, {
            type: "battle_started",
            battleId,
            message: "Battle started! First round beginning now."
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Successfully joined battle",
      battleId 
    });
  } catch (error) {
    console.error("Error in POST /api/battles/[id]/join:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}