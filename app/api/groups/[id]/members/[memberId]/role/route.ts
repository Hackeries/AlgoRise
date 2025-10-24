import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const { role } = body as { role: 'admin' | 'moderator' | 'member' };
    const { id: groupId, memberId } = await params;

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only group admin can change roles
    const { data: me } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();
    if (!me || me.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update role
    const { error } = await supabase
      .from('group_memberships')
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Update role error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
