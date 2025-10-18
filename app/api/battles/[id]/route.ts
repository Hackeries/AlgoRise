// API route to get battle details

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import BattleService from '@/lib/battle-service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const battleId = id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get battle details with all related data
    const { data: battle, error } = await supabase
      .from('battles')
      .select(
        `
        *,
        battle_participants(*),
        battle_rounds(*),
        battle_submissions(*)
      `
      )
      .eq('id', battleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Battle not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching battle:', error);
      return NextResponse.json(
        { error: 'Failed to fetch battle' },
        { status: 500 }
      );
    }

    // Verify user has access to this battle
    const isParticipant = battle.battle_participants.some(
      (p: any) => p.user_id === user.id
    );

    const isHost = battle.host_user_id === user.id;
    const isGuest = battle.guest_user_id === user.id;

    if (!isParticipant && !isHost && !isGuest) {
      // Check if battle is public (in a real implementation, you might have public battles)
      // For now, only participants can view
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ battle });
  } catch (error) {
    console.error('Error in GET /api/battles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/battles/[id] - Start a battle (host only)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const battleId = id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify user is the host of this battle
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('host_user_id, status')
      .eq('id', battleId)
      .single();

    if (battleError) {
      if (battleError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Battle not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching battle:', battleError);
      return NextResponse.json(
        { error: 'Failed to fetch battle' },
        { status: 500 }
      );
    }

    if (battle.host_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the host can start the battle' },
        { status: 403 }
      );
    }

    if (battle.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Battle is not in waiting state' },
        { status: 400 }
      );
    }

    // Start battle using battle service
    const battleService = new BattleService();
    const result = await battleService.startBattle(battleId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Battle started successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/battles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
