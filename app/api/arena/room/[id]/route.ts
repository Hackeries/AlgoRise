import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BattleService from "@/lib/battle-service";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params;
  const supabase = await createClient();
  const battleService = new BattleService();

  try {
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Get battle details
    const battle = await battleService.getBattle(battleId);

    if (!battle) {
      return NextResponse.json({ 
        success: false, 
        message: "Battle not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      battle
    });
  } catch (error) {
    console.error("Error fetching battle:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch battle" 
    }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: battleId } = await params;
  const supabase = await createClient();
  const battleService = new BattleService();

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
    const { action } = body;

    switch (action) {
      case 'start':
        // Start the battle
        const startResult = await battleService.startBattle(battleId);
        
        if (startResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: "Battle started successfully"
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: startResult.message 
          }, { status: 400 });
        }

      case 'terminate':
        // Terminate the battle
        const { error } = await supabase
          .from('battles')
          .update({ 
            status: 'cancelled',
            ended_at: new Date().toISOString()
          })
          .eq('id', battleId);

        if (error) {
          console.error("Error terminating battle:", error);
          return NextResponse.json({ 
            success: false, 
            message: "Failed to terminate battle" 
          }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: "Battle terminated successfully"
        });

      case 'spectate':
        // Add user as spectator
        const spectateResult = await battleService.addSpectator(battleId, user.id);
        
        if (spectateResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: "Joined as spectator successfully"
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: spectateResult.message 
          }, { status: 400 });
        }

      case 'leave_spectate':
        // Remove user as spectator
        const leaveSpectateResult = await battleService.removeSpectator(battleId, user.id);
        
        if (leaveSpectateResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: "Left spectator mode successfully"
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: leaveSpectateResult.message 
          }, { status: 400 });
        }

      case 'set_visibility':
        // Set battle visibility
        const { isPublic } = body;
        const visibilityResult = await battleService.setBattleVisibility(battleId, isPublic, user.id);
        
        if (visibilityResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: `Battle is now ${isPublic ? 'public' : 'private'}`
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: visibilityResult.message 
          }, { status: 400 });
        }

      default:
        return NextResponse.json({ 
          success: false, 
          message: "Invalid action" 
        }, { status: 400 });
    }
  } catch (error) {
    console.error("Error handling battle action:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to handle battle action" 
    }, { status: 500 });
  }
}