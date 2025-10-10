import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body?.name as string | undefined)?.trim();
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Group name must be at least 2 characters' },
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

    const { data: group, error: gErr } = await supabase
      .from('groups')
      .insert({ name, type: 'friends', created_by: user.id })
      .select('id')
      .single();

    if (gErr) {
      console.error('Error creating group:', gErr);
      return NextResponse.json(
        { error: gErr.message || 'Failed to create group' },
        { status: 500 }
      );
    }

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
    console.error('Unexpected error in create-friends:', e);
    return NextResponse.json(
      { error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}