import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ✅ Helper to create Supabase client compatible with latest Next.js & Supabase versions
async function createSupabaseClient() {
  const cookieStore = await cookies(); // 👈 await is required here

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: cookiesToSet => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const contestId = params.id;
  const body = await req.json().catch(() => ({}));
  const problem_id = (body?.problemId as string | undefined)?.trim();
  const status = body?.status as 'solved' | 'failed' | undefined;
  const penalty_s = Number(body?.penalty ?? 0);

  if (!problem_id || !status)
    return NextResponse.json(
      { error: 'problemId and status required' },
      { status: 400 }
    );

  const supabase = await createSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { error } = await supabase.from('contest_submissions').insert({
    contest_id: contestId,
    user_id: user.id,
    problem_id,
    status,
    penalty_s: isFinite(penalty_s) ? penalty_s : 0,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const contestId = params.id;
  const supabase = await createSupabaseClient();

  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('*')
    .eq('id', contestId)
    .single();

  if (contestError || !contest)
    return NextResponse.json({ error: 'Contest not found' }, { status: 404 });

  const { data: problems } = await supabase
    .from('contest_problems')
    .select('*')
    .eq('contest_id', contestId)
    .order('problem_id');

  const now = new Date();
  const start = new Date(contest.starts_at);
  const end = new Date(contest.ends_at);

  let status: 'upcoming' | 'live' | 'ended' = 'upcoming';
  if (now >= end) status = 'ended';
  else if (now >= start) status = 'live';

  const timeRemaining = end.getTime() - now.getTime();

  const formattedProblems = (problems || []).map(p => ({
    id: p.problem_id,
    contestId: p.contest_id_cf || 0,
    index: p.index_cf || '',
    name: p.title,
    rating: p.rating || 0,
  }));

  const shareUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }/contests/${contestId}`;

  return NextResponse.json({
    contest: {
      ...contest,
      problems: formattedProblems,
      status,
      timeRemaining: Math.max(0, timeRemaining),
      shareUrl,
    },
  });
}
