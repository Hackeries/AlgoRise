import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const contestId = params.id;

  // ✅ FIX: Await the client creation
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // ✅ Try RPC first (contest_leaderboard function)
  const { data, error } = await supabase
    .rpc('contest_leaderboard', { in_contest_id: contestId })
    .select()
    .limit(200);

  if (!error && (data?.length ?? 0) > 0) {
    return NextResponse.json({ leaderboard: data });
  }

  // ✅ Fallback: aggregate manually from contest_submissions
  const { data: rows, error: aggErr } = await supabase
    .from('contest_submissions')
    .select('user_id, status, penalty_s')
    .eq('contest_id', contestId);

  if (aggErr) {
    return NextResponse.json({ error: aggErr.message }, { status: 500 });
  }

  const map = new Map<
    string,
    { user_id: string; solved: number; penalty: number }
  >();

  for (const r of rows ?? []) {
    const curr = map.get(r.user_id) ?? {
      user_id: r.user_id,
      solved: 0,
      penalty: 0,
    };
    if (r.status === 'solved') curr.solved += 1;
    curr.penalty += r.penalty_s ?? 0;
    map.set(r.user_id, curr);
  }

  // ✅ Include all registered participants (even with 0 submissions)
  const { data: participants } = await supabase
    .from('contest_participants')
    .select('user_id')
    .eq('contest_id', contestId);

  for (const p of participants ?? []) {
    if (!map.has(p.user_id)) {
      map.set(p.user_id, { user_id: p.user_id, solved: 0, penalty: 0 });
    }
  }

  // ✅ Sort leaderboard: more solved → higher rank; lower penalty → better
  const list = Array.from(map.values()).sort((a, b) => {
    if (b.solved !== a.solved) return b.solved - a.solved;
    return a.penalty - b.penalty;
  });

  // ✅ Assign ranks
  const withRank = list.map((r, idx) => ({ rank: idx + 1, ...r }));

  return NextResponse.json({ leaderboard: withRank });
}