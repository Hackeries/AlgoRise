import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Ensure caller is at least a member
  const { data: membership } = await supabase
    .from('group_memberships')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();

  if (!membership)
    return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  // Read existing code, or generate then persist
  const { data: groupRow, error: selErr } = await supabase
    .from('groups')
    .select('invite_code')
    .eq('id', groupId)
    .single();
  if (selErr)
    return NextResponse.json(
      { error: selErr.message || 'Failed to read group' },
      { status: 500 }
    );

  let inviteCode = (groupRow?.invite_code as string | null) || null;
  if (!inviteCode) {
    inviteCode = randomUUID();
    const { error: upErr } = await supabase
      .from('groups')
      .update({ invite_code: inviteCode })
      .eq('id', groupId);
    if (upErr)
      return NextResponse.json(
        { error: upErr.message || 'Failed to save invite code' },
        { status: 500 }
      );
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteLink = `${base}/groups/join/${inviteCode}`;
  return NextResponse.json({ link: inviteLink, code: inviteCode });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params;
  const supabase = await createClient();

  const body = await req.json().catch(() => ({}));
  const email = (body?.email as string | undefined)?.trim();
  const role = (body?.role as 'member' | 'moderator' | undefined) || 'member';
  const inviteCode = (body?.code as string | undefined) || '';

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // If email provided → create invitation record and return shareable link
  if (email) {
    // Must be admin or moderator to invite
    const { data: membership } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();
    if (!membership || !['admin', 'moderator'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Not authorized to invite' },
        { status: 403 }
      );
    }

    // Ensure group has an invite_code
    const getRes = await GET(req, { params: Promise.resolve({ id: groupId }) });
    if (getRes.status !== 200) return getRes;
    const { code, link } = await getRes.json();

    // Persist invitation (for audit/history)
    const { error: insErr } = await supabase.from('group_invitations').insert({
      group_id: groupId,
      email,
      role,
      code,
      created_by: user.id,
    });
    if (insErr)
      return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      link,
      code,
      message:
        'Invitation created. Use the provided link to share via email or messaging. If the recipient has an AlgoRise account, they can join directly.',
    });
  }

  // Otherwise treat as "join by code" for current user
  if (!inviteCode)
    return NextResponse.json(
      { error: 'Invite code required' },
      { status: 400 }
    );

  const { data: group } = await supabase
    .from('groups')
    .select('type, college_id, invite_code, max_members')
    .eq('id', groupId)
    .eq('invite_code', inviteCode)
    .single();
  if (!group)
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });

  // College check for ICPC/college groups
  if ((group.type === 'icpc' || group.type === 'college') && group.college_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('college_id')
      .eq('user_id', user.id)
      .single();
    if (!profile?.college_id || profile.college_id !== group.college_id) {
      return NextResponse.json(
        {
          error: `College mismatch. ${
            group.type === 'icpc' ? 'ICPC teams' : 'College groups'
          } require same college.`,
        },
        { status: 400 }
      );
    }
  }

  const { count } = await supabase
    .from('group_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);
  if (group.max_members && count && count >= group.max_members) {
    return NextResponse.json(
      { error: `Group is full (max ${group.max_members} members)` },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('group_memberships')
    .upsert(
      { group_id: groupId, user_id: user.id, role: 'member' },
      { onConflict: 'group_id,user_id' }
    );
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}