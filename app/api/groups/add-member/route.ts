import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const groupId = body?.groupId as string | undefined;
  const targetHandle = body?.handle as string | undefined;
  if (!groupId || !targetHandle?.trim())
    return NextResponse.json(
      { error: 'groupId and handle required' },
      { status: 400 }
    );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookies() }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if user is admin/moderator of group
  const { data: membership } = await supabase
    .from('group_memberships')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();

  if (!membership || !['admin', 'moderator'].includes(membership.role)) {
    return NextResponse.json(
      { error: 'Not authorized to add members' },
      { status: 403 }
    );
  }

  const { data: group } = await supabase
    .from('groups')
    .select('type, college_id, max_members')
    .eq('id', groupId)
    .single();

  if (!group)
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });

  // Find target user by handle
  const { data: cfHandle } = await supabase
    .from('cf_handles')
    .select('user_id')
    .eq('handle', targetHandle.trim())
    .eq('verified', true)
    .single();

  if (!cfHandle)
    return NextResponse.json(
      { error: 'User not found or handle not verified' },
      { status: 404 }
    );

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, college_id')
    .eq('id', cfHandle.user_id)
    .single();

  if (!targetProfile)
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 404 }
    );

  if ((group.type === 'icpc' || group.type === 'college') && group.college_id) {
    if (targetProfile.college_id !== group.college_id) {
      return NextResponse.json(
        {
          error: `This user belongs to a different college. ${
            group.type === 'icpc' ? 'ICPC teams' : 'College groups'
          } require all members from the same college.`,
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

  // Add member
  const { error } = await supabase.from('group_memberships').upsert(
    {
      group_id: groupId,
      user_id: targetProfile.id,
      role: 'member',
    },
    { onConflict: 'group_id,user_id' }
  );

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
