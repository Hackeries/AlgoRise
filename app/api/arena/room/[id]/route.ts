<<<<<<< HEAD
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
=======
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const battleId = params.id;

    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    // Derive problems for the battle
    // If battle has explicit problem_set_id -> fetch first few problems from that set
    // Otherwise, fallback to a lightweight selection from user_problems by problem_id
    let problems: any[] = [];
    if ((battle as any).problem_set_id) {
      const { data: contest } = await supabase
        .from('contests')
        .select('problems')
        .eq('id', (battle as any).problem_set_id)
        .single();
      if (contest?.problems && Array.isArray(contest.problems)) {
        problems = contest.problems.slice(0, 5);
      }
    }

    if (problems.length === 0 && (battle as any).problem_ids) {
      const { data: fallbackProblems } = await supabase
        .from('user_problems')
        .select('*')
        .in('problem_id', (battle as any).problem_ids)
        .limit(5);
      problems = fallbackProblems || [];
    }

    const { data: teams } = await supabase
      .from('battle_teams')
      .select(
        `
        *,
        battle_team_players(user_id, role)
      `
      )
      .eq('battle_id', battleId);

    const { data: submissions } = await supabase
      .from('battle_submissions')
      .select('*')
      .eq('battle_id', battleId)
      .order('submitted_at', { ascending: false });

    // Build scoreboard summary from teams + submissions (ICPC-like)
    const teamScores = (teams || []).map((t: any) => {
      const teamSubs = (submissions || []).filter(s => s.team_id === t.id);
      const solved = new Set(
        teamSubs.filter(s => s.verdict === 'AC').map(s => s.problem_id)
      ).size;
      const penalty = teamSubs.reduce((acc, s) => acc + (s.penalty || 0), 0);
      return {
        teamId: t.id,
        teamName: t.team_name,
        score: solved,
        penaltyTime: penalty,
      };
    });

    return NextResponse.json({
      battle,
      problems: problems || [],
      teams,
      submissions,
      scoreboard: teamScores.sort((a, b) =>
        a.score === b.score ? a.penaltyTime - b.penaltyTime : b.score - a.score
      ),
    });
  } catch (error) {
    console.error('Room fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
>>>>>>> upstream/main
  }
}