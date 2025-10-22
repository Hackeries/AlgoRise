<<<<<<< HEAD
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
=======
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { battleId, accept } = await request.json();

    // Use service role client for database operations
    const serviceRoleClient = await createServiceRoleClient();
    if (!serviceRoleClient) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    if (accept) {
      // Create battle teams
      const { data: team, error: teamError } = await serviceRoleClient
        .from('battle_teams')
        .insert({
          battle_id: battleId,
          team_name: `Team ${user.id.slice(0, 8)}`,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add user to team
      const { error: playerError } = await serviceRoleClient
        .from('battle_team_players')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'captain',
        });

      if (playerError) throw playerError;

      // Update battle status
      const { error: updateError } = await serviceRoleClient
        .from('battles')
        .update({
          status: 'active',
          start_at: new Date().toISOString(),
        })
        .eq('id', battleId);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, battleId, teamId: team.id });
    } else {
      // Decline match
      const { error: declineError } = await serviceRoleClient
        .from('battles')
        .update({ status: 'cancelled' })
        .eq('id', battleId);

      if (declineError) throw declineError;

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Match accept error:', error);
    return NextResponse.json(
      { error: 'Failed to accept match' },
      { status: 500 }
    );
  }
}
>>>>>>> upstream/main
