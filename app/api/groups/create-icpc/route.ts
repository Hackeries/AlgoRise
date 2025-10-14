import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body?.name as string | undefined)?.trim();
    const description = (body?.description as string | undefined)?.trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Team name must be at least 2 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Check if user has college set
    const { data: profile } = await supabase
      .from('profiles')
      .select('college_id')
      .eq('id', user.id)
      .single();

    if (!profile?.college_id) {
      return NextResponse.json(
        { error: 'You must set your college before creating an ICPC team' },
        { status: 400 }
      );
    }

    // Create ICPC team with max 3 members
    const { data: group, error: gErr } = await supabase
      .from('groups')
      .insert({
        name,
        type: 'icpc',
        created_by: user.id,
        college_id: profile.college_id,
        max_members: 3,
        description: description || null,
      })
      .select('id')
      .single();

    if (gErr) {
      console.error('Error creating ICPC team:', gErr);
      return NextResponse.json(
        { error: gErr.message || 'Failed to create ICPC team' },
        { status: 500 }
      );
    }

    // Add creator as admin
    const { error: mErr } = await supabase
      .from('group_memberships')
      .insert({ group_id: group.id, user_id: user.id, role: 'admin' });

    if (mErr) {
      console.error('Error adding membership:', mErr);
      return NextResponse.json(
        { error: mErr.message || 'Failed to add membership' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, groupId: group.id });
  } catch (e: any) {
    console.error('Unexpected error in create-icpc:', e);
    return NextResponse.json(
      { error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}