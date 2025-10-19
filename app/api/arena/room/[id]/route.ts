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

    const { data: problems } = await supabase
      .from('user_problems')
      .select('*')
      .in('id', battle.problem_ids || [])
      .limit(3);

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

    return NextResponse.json({
      battle,
      problems: problems || [],
      teams,
      submissions,
    });
  } catch (error) {
    console.error('Room fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}