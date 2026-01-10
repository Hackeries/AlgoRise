import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const groupId = body?.groupId as string | undefined;
    if (!groupId)
      return NextResponse.json({ error: 'groupId required' }, { status: 400 });

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

    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .match({ group_id: groupId, user_id: user.id });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}
