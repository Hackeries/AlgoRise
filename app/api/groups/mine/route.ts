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
    .select('role, groups(id, name, type, college_id, created_at)')
    .order('created_at', { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ memberships: data ?? [] });
}
