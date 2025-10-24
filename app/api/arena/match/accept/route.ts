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
