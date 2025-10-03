import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const supabase = await createClient();

  let query = supabase
    .from('colleges')
    .select('id, name, country')
    .eq('country', 'India')
    .limit(50);
  if (q) {
    // ilike search for convenience
    query = query.ilike('name', `%${q}%`);
  }
  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ colleges: data ?? [] });
}
