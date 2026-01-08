import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface LeaderboardRow {
  user_id: string;
  username?: string;
  solved: number;
  penalty: number;
  score: number;
  rank?: number;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contestId = id;

  const url = new URL(req.url);
  const limit = Math.min(
    Math.max(1, Number(url.searchParams.get('limit') ?? 50)),
    200
  );
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? 0));

  const supabase = await createClient();

  const { data: contest } = await supabase
    .from('contests')
    .select('id, visibility, host_user_id')
    .eq('id', contestId)
    .single();

  if (!contest) {
    return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
  }

  try {
    const leaderboard = await getContestLeaderboard(supabase, contestId, {
      limit,
      offset,
    });

    const { count } = await supabase
      .from('contest_participants')
      .select('id', { count: 'exact', head: true })
      .eq('contest_id', contestId);

    const response = NextResponse.json({
      leaderboard,
      totalParticipants: count ?? leaderboard.length,
      limit,
      offset,
    });

    response.headers.set(
      'cache-control',
      'public, s-maxage=5, stale-while-revalidate=30'
    );

    return response;
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Failed to fetch leaderboard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function getContestLeaderboard(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contestId: string,
  options: { limit: number; offset: number }
): Promise<LeaderboardRow[]> {
  const {
    data: rpcData,
    error: rpcErr,
  }: { data: LeaderboardRow[] | null; error: unknown } = await supabase
    .rpc('contest_leaderboard', { in_contest_id: contestId })
    .select()
    .range(options.offset, options.offset + options.limit - 1);

  if (!rpcErr && rpcData && rpcData.length > 0) {
    return rpcData.map((r, idx) => ({ ...r, rank: options.offset + idx + 1 }));
  }

  const { data: rows, error: aggErr } = await supabase
    .from('contest_submissions')
    .select('user_id, problem_id, status, penalty_s')
    .eq('contest_id', contestId);

  if (aggErr) throw new Error(aggErr.message);

  const { data: problemPoints } = await supabase
    .from('contest_problems')
    .select('problem_id, points')
    .eq('contest_id', contestId);

  const pointsMap = new Map<string, number>();
  for (const r of problemPoints ?? []) {
    pointsMap.set(r.problem_id, Number(r.points ?? 0));
  }

  const { data: participants } = await supabase
    .from('contest_participants')
    .select('user_id')
    .eq('contest_id', contestId);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in(
      'id',
      (participants ?? []).map(p => p.user_id)
    );

  const usernameMap = new Map<string, string>();
  for (const p of profiles ?? []) {
    if (p.username) usernameMap.set(p.id, p.username);
  }

  const solvedProblems = new Map<string, Set<string>>();
  const map = new Map<string, LeaderboardRow>();

  for (const r of rows ?? []) {
    const curr = map.get(r.user_id) ?? {
      user_id: r.user_id,
      username: usernameMap.get(r.user_id),
      solved: 0,
      penalty: 0,
      score: 0,
    };

    if (r.status === 'solved') {
      const userSolved = solvedProblems.get(r.user_id) ?? new Set();
      if (!userSolved.has(r.problem_id)) {
        userSolved.add(r.problem_id);
        solvedProblems.set(r.user_id, userSolved);
        curr.solved += 1;
        curr.score += pointsMap.get(r.problem_id) ?? 0;
      }
    }
    curr.penalty += r.penalty_s ?? 0;
    map.set(r.user_id, curr);
  }

  for (const p of participants ?? []) {
    if (!map.has(p.user_id)) {
      map.set(p.user_id, {
        user_id: p.user_id,
        username: usernameMap.get(p.user_id),
        solved: 0,
        penalty: 0,
        score: 0,
      });
    }
  }

  const list = Array.from(map.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.solved !== a.solved) return b.solved - a.solved;
    return a.penalty - b.penalty;
  });

  return list
    .slice(options.offset, options.offset + options.limit)
    .map((r, idx) => ({ ...r, rank: options.offset + idx + 1 }));
}
