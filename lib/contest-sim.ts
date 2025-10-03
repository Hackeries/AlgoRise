export type RankRow = { user_id: string; score: number; penalty_s: number };
export type RatingRow = { user_id: string; rating: number };

function expectedScore(ra: number, rb: number) {
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

export function simulateRatings({
  ranks,
  ratings,
  K = 32,
}: {
  ranks: RankRow[]; // sorted ascending by rank externally
  ratings: RatingRow[];
  K?: number;
}): { user_id: string; delta: number }[] {
  // Map current ratings
  const rMap = new Map(ratings.map(r => [r.user_id, r.rating || 1200]));
  // Convert ranks to relative scores (simple: normalized by place)
  // Better models (Plackett-Luce) can be added later
  const n = ranks.length;
  const actual = new Map<string, number>();
  ranks.forEach((row, idx) => {
    const score = (n - idx) / n; // top gets ~1, bottom ~1/n
    actual.set(row.user_id, score);
  });

  // Expected vs all others
  const deltas: { user_id: string; delta: number }[] = [];
  for (const row of ranks) {
    const ra = rMap.get(row.user_id) ?? 1200;
    let expSum = 0;
    for (const other of ranks) {
      if (other.user_id === row.user_id) continue;
      const rb = rMap.get(other.user_id) ?? 1200;
      expSum += expectedScore(ra, rb);
    }
    const expAvg = expSum / (n - 1);
    const act = actual.get(row.user_id) ?? 0.5;
    const delta = Math.round(K * (act - expAvg));
    deltas.push({ user_id: row.user_id, delta });
  }
  return deltas;
}
