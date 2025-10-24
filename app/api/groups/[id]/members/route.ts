import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure user is a member of the group to view members
    const { data: membership } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!membership)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Members list
    const { data: membersRaw, error: membersErr } = await supabase
      .from('group_memberships')
      .select(
        `user_id, role, created_at,
         profiles:profiles!group_memberships_user_id_fkey(full_name, codeforces_handle, avatar_url, last_active_at)`
      )
      .eq('group_id', groupId);

    if (membersErr)
      return NextResponse.json(
        { error: membersErr.message },
        { status: 500 }
      );

    const members = (membersRaw || []).map((m: any) => ({
      id: m.user_id,
      name: m.profiles?.full_name || m.profiles?.codeforces_handle || 'Member',
      handle: m.profiles?.codeforces_handle || 'unknown',
      avatar: m.profiles?.avatar_url || null,
      role: m.role,
      joinedAt: m.created_at,
      lastActive: m.profiles?.last_active_at || new Date().toISOString(),
      isOnline:
        m.profiles?.last_active_at &&
        new Date().getTime() - new Date(m.profiles.last_active_at).getTime() <
          5 * 60 * 1000,
    }));

    // Pending invites (best-effort; requires group_invitations)
    let invites: any[] = [];
    const service = await createServiceRoleClient();
    if (service) {
      const { data: inv } = await service
        .from('group_invitations')
        .select('id, email, role, created_at, status')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      invites = (inv || []).map((i: any) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        createdAt: i.created_at,
        status: i.status || 'pending',
      }));
    }

    // Return also an inviteCode if exists for convenience
    const { data: groupRow } = await supabase
      .from('groups')
      .select('invite_code')
      .eq('id', groupId)
      .single();

    return NextResponse.json({
      members,
      invites,
      inviteCode: groupRow?.invite_code || null,
    });
  } catch (error: any) {
    console.error('Group members error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
