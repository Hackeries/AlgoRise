import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    const { teamName, memberIds } = await request.json();

    if (!Array.isArray(memberIds) || memberIds.length !== 2) {
      return NextResponse.json(
        { error: 'Team must have exactly 2 other members (3 total)' },
        { status: 400 }
      );
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('battle_teams')
      .insert({
        team_name: teamName,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add captain
    await supabase.from('battle_team_players').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'captain',
    });

    // Add members
    for (const memberId of memberIds) {
      await supabase.from('battle_team_players').insert({
        team_id: team.id,
        user_id: memberId,
        role: 'member',
      });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}