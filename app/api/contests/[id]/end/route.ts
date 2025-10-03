import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { simulateRatings } from '@/lib/contest-sim';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const contestId = params.id;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // ensure host
  const { data: contest, error: cErr } = await supabase
    .from('contests')
    .select('id, host_user_id, status')
    .eq('id', contestId)
    .single();
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (contest.host_user_id !== user.id)
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  // compute leaderboard
  const { data: submissions, error: sErr } = await supabase
    .from('contest_submissions')
    .select('user_id, status, penalty_s')
    .eq('contest_id', contestId);
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  // aggregate
  const map = new Map<
    string,
    { user_id: string; solved: number; penalty: number }
  >();
  for (const r of submissions ?? []) {
    const curr = map.get(r.user_id) ?? {
      user_id: r.user_id,
      solved: 0,
      penalty: 0,
    };
    if (r.status === 'solved') curr.solved += 1;
    curr.penalty += r.penalty_s ?? 0;
    map.set(r.user_id, curr);
  }
  const list = Array.from(map.values()).sort((a, b) => {
    if (b.solved !== a.solved) return b.solved - a.solved;
    return a.penalty - b.penalty;
  });
  const withRank = list.map((r, idx) => ({
    user_id: r.user_id,
    score: r.solved,
    penalty_s: r.penalty,
    rank: idx + 1,
  }));

  // fetch pre-contest ratings snapshot (fallback 1200)
  // for v1, we reuse cf_snapshots.last_rating if present, else 1200
  const { data: snaps } = await supabase
    .from('cf_snapshots')
    .select('user_id, last_rating');
  const ratings = (withRank.map(r => ({
    user_id: r.user_id,
    rating: snaps?.find(s => s.user_id === r.user_id)?.last_rating ?? 1200,
  })) ?? []) as { user_id: string; rating: number }[];

  const deltas = simulateRatings({ ranks: withRank, ratings, K: 32 });

  // upsert results
  for (const row of withRank) {
    const delta = deltas.find(d => d.user_id === row.user_id)?.delta ?? 0;
    const { error: upErr } = await supabase.from('contest_results').upsert(
      {
        contest_id: contestId,
        user_id: row.user_id,
        rank: row.rank,
        score: row.score,
        penalty_s: row.penalty_s,
        rating_delta: delta,
      },
      { onConflict: 'contest_id,user_id' }
    );
    if (upErr)
      return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  // update contest status
  const { error: updErr } = await supabase
    .from('contests')
    .update({ status: 'ended' })
    .eq('id', contestId);
  if (updErr)
    return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, results: withRank, deltas });
}
