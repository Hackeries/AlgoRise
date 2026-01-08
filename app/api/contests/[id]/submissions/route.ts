import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SubmissionPayload {
  problemId: string;
  status: 'solved' | 'failed';
  penalty?: number;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contestId = id;

  let body: { submissions?: SubmissionPayload[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const submissions = Array.isArray(body?.submissions) ? body.submissions : [];

  if (!submissions.length) {
    return NextResponse.json(
      { error: 'No submissions provided' },
      { status: 400 }
    );
  }

  if (submissions.length > 50) {
    return NextResponse.json(
      { error: 'Too many submissions in batch (max 50)' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: participant } = await supabase
    .from('contest_participants')
    .select('id')
    .eq('contest_id', contestId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!participant) {
    return NextResponse.json(
      { error: 'Not registered for this contest' },
      { status: 403 }
    );
  }

  const { data: contest } = await supabase
    .from('contests')
    .select('starts_at, ends_at')
    .eq('id', contestId)
    .single();

  if (!contest) {
    return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
  }

  const now = Date.now();
  const startsAt = new Date(contest.starts_at).getTime();
  const endsAt = new Date(contest.ends_at).getTime();

  if (now < startsAt) {
    return NextResponse.json(
      { error: 'Contest has not started yet' },
      { status: 400 }
    );
  }

  if (now > endsAt) {
    return NextResponse.json({ error: 'Contest has ended' }, { status: 400 });
  }

  const validSubmissions = submissions.filter(
    (s): s is SubmissionPayload =>
      typeof s.problemId === 'string' &&
      s.problemId.trim() !== '' &&
      (s.status === 'solved' || s.status === 'failed')
  );

  if (validSubmissions.length === 0) {
    return NextResponse.json(
      { error: 'No valid submissions' },
      { status: 400 }
    );
  }

  const rows = validSubmissions.map(s => ({
    contest_id: contestId,
    user_id: user.id,
    problem_id: s.problemId.trim(),
    status: s.status,
    penalty_s: Math.max(0, Number(s.penalty ?? 0) || 0),
  }));

  const { error } = await supabase.from('contest_submissions').insert(rows);

  if (error) {
    console.error('Batch submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    count: validSubmissions.length,
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contestId = id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: submissions, error } = await supabase
    .from('contest_submissions')
    .select('problem_id, status, penalty_s, created_at')
    .eq('contest_id', contestId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: submissions || [] });
}
