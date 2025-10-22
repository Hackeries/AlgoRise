export interface AtcoderProblemModel {
  difficulty?: number | null;
  discrimination?: number | null;
  is_experimental?: boolean;
}

export interface AtcoderProblem {
  id: string; // e.g., abc100_a
  contestId: string; // e.g., abc100
  title: string;
  title_en?: string;
  // Mapped field for consistency with CF
  rating?: number; // derived from difficulty
  source: 'AtCoder';
}

// Fetch list of AtCoder problems and their difficulties from AtCoder Problems
export async function fetchAtcoderProblemsWithDifficulty(): Promise<AtcoderProblem[]> {
  // Static resources
  const problemsUrl = 'https://kenkoooo.com/atcoder/resources/problems.json';
  const modelsUrl = 'https://kenkoooo.com/atcoder/resources/problem-models.json';

  const [problemsRes, modelsRes] = await Promise.all([
    fetch(problemsUrl, { cache: 'no-store' }),
    fetch(modelsUrl, { cache: 'no-store' }),
  ]);

  if (!problemsRes.ok) throw new Error(`AtCoder problems fetch failed: ${problemsRes.status}`);
  if (!modelsRes.ok) throw new Error(`AtCoder models fetch failed: ${modelsRes.status}`);

  const problemsJson = (await problemsRes.json()) as Array<{
    id: string;
    contest_id: string;
    title: string;
    title_en?: string;
  }>;
  const modelsJson = (await modelsRes.json()) as Record<string, AtcoderProblemModel>;

  // Map difficulty to a CF-like rating number
  // Many community mappings use: approxRating = round(difficulty)
  // We'll clamp to [800, 3500] and skip null difficulty
  const result: AtcoderProblem[] = [];
  for (const p of problemsJson) {
    const model = modelsJson[p.id];
    if (!model || typeof model.difficulty !== 'number') continue;
    const approx = Math.round(model.difficulty || 0);
    const rating = Math.max(800, Math.min(3500, approx));
    result.push({
      id: p.id,
      contestId: p.contest_id,
      title: p.title,
      title_en: p.title_en,
      rating,
      source: 'AtCoder',
    });
  }
  return result;
}

// Get set of solved AtCoder problems by user (IDs like abc100_a)
export async function getAtcoderSolvedSet(handle: string): Promise<Set<string>> {
  if (!handle) return new Set();
  // AtCoder Problems submissions API
  const submissionsUrl = `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(
    handle
  )}&from_second=0`;
  try {
    const res = await fetch(submissionsUrl, { cache: 'no-store' });
    if (!res.ok) return new Set();
    const subs = (await res.json()) as Array<{
      id: number;
      problem_id: string;
      result: string; // 'AC' etc.
      epoch_second: number;
    }>;
    const solved = new Set<string>();
    for (const s of subs) {
      if (s.result === 'AC') solved.add(s.problem_id);
    }
    return solved;
  } catch {
    return new Set();
  }
}
