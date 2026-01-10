import { createClient } from '@/lib/supabase/server';

export type LeaderboardRow = {
  user_id: string;
  solved: number;
  penalty: number;
  score: number;
  rank?: number;
};

export async function getContestLeaderboard(
  contestId: string
): Promise<LeaderboardRow[]> {
  const supabase = await createClient();

  // Try RPC first if available
  const { data: rpcData, error: rpcErr }: any = await supabase
    .rpc('contest_leaderboard', { in_contest_id: contestId })
    .select()
    .limit(200);

  if (!rpcErr && (rpcData?.length ?? 0) > 0) {
    return rpcData.map((r: any, idx: number) => ({ ...r, rank: idx + 1 }));
  }

  // Fallback: manual aggregation
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
  for (const r of problemPoints ?? [])
    pointsMap.set(r.problem_id, Number(r.points ?? 0));

  const map = new Map<string, LeaderboardRow>();
  for (const r of rows ?? []) {
    const curr = map.get(r.user_id) ?? {
      user_id: r.user_id,
      solved: 0,
      penalty: 0,
      score: 0,
    };
    if (r.status === 'solved') {
      curr.solved += 1;
      curr.score += pointsMap.get(r.problem_id) ?? 0;
    }
    curr.penalty += r.penalty_s ?? 0;
    map.set(r.user_id, curr);
  }

  // Ensure participants with 0 submissions still appear
  const { data: participants } = await supabase
    .from('contest_participants')
    .select('user_id')
    .eq('contest_id', contestId);

  for (const p of participants ?? []) {
    if (!map.has(p.user_id)) {
      map.set(p.user_id, {
        user_id: p.user_id,
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
  return list.map((r, idx) => ({ ...r, rank: idx + 1 }));
}