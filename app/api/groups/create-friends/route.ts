import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body?.name as string | undefined)?.trim();
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: group, error: gErr } = await supabase
      .from('groups')
      .insert({ name, type: 'friends', created_by: user.id })
      .select('id')
      .single();
    if (gErr)
      return NextResponse.json({ error: gErr.message }, { status: 500 });

    const { error: mErr } = await supabase
      .from('group_memberships')
      .insert({ group_id: group.id, user_id: user.id, role: 'admin' });
    if (mErr)
      return NextResponse.json({ error: mErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, groupId: group.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}
