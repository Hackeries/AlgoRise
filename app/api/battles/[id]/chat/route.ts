// API route for battle chat functionality

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BattleChatService from "@/lib/battle-chat-service";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    // Verify user has access to this battle
    const hasAccess = await verifyBattleAccess(supabase, battleId, user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get chat messages
    const chatService = new BattleChatService();
    const messages = await chatService.getMessages(battleId, 50);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error in GET /api/battles/[id]/chat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { message, action = "send", messageId } = body;

    // Verify user has access to this battle
    const hasAccess = await verifyBattleAccess(supabase, battleId, user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const chatService = new BattleChatService();

    if (action === "send") {
      // Send a new message
      if (!message) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
      }

      const result = await chatService.sendMessage(battleId, user.id, message);
      return NextResponse.json(result);
    } else if (action === "delete") {
      // Delete a message
      if (!messageId) {
        return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
      }

      const result = await chatService.deleteMessage(messageId, user.id, battleId);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in POST /api/battles/[id]/chat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to verify battle access
async function verifyBattleAccess(supabase: any, battleId: string, userId: string): Promise<boolean> {
  try {
    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from("battle_participants")
      .select("id")
      .eq("battle_id", battleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!participantError && participant) {
      return true;
    }

    // Check if user is a spectator
    const { data: spectator, error: spectatorError } = await supabase
      .from("battle_spectators")
      .select("id")
      .eq("battle_id", battleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!spectatorError && spectator) {
      return true;
    }

    // Check if user is host or guest
    const { data: battle, error: battleError } = await supabase
      .from("battles")
      .select("host_user_id, guest_user_id, is_public")
      .eq("id", battleId)
      .single();

    if (!battleError && battle) {
      // Public battles can be viewed by anyone
      if (battle.is_public) {
        return true;
      }
      
      // Host or guest can always access
      return battle.host_user_id === userId || battle.guest_user_id === userId;
    }

    return false;
  } catch (error) {
    console.error("Error verifying battle access:", error);
    return false;
  }
}