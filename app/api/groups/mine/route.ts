import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('group_memberships')
    .select(
      'role, groups(id, name, type, college_id, created_at, description, max_members)'
    )
    .order('created_at', { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const membershipsWithCount = await Promise.all(
    (data ?? []).map(async (membership: any) => {
      const { count } = await supabase
        .from('group_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', membership.groups.id);

      return {
        role: membership.role,
        group: {
          ...membership.groups,
          memberCount: count || 0,
        },
      };
    })
  );

  return NextResponse.json({ memberships: membershipsWithCount });
}
