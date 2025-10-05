import type { SupabaseClient } from '@supabase/supabase-js';
import type { SheetItem, Outcome } from '@/lib/types';

// === Types ===
export type Limits = { now?: number; soon?: number; later?: number };

export type DbItem = {
  problem_id: string;
  rating: number;
  tags: string[];
  repetitions: number;
  ease: number;
  interval_days: number;
  next_due_at: string;
  last_outcome: Outcome | null;
  problem_title: string | null;
  problem_url: string | null;
  platform?: string;
};

// Default limits
export const DEFAULT_LIMITS: Required<Limits> = { now: 8, soon: 8, later: 8 };

// === Helpers ===
export function clampEase(e: number): 1 | 2 | 3 | 4 | 5 {
  if (e <= 1) return 1;
  if (e >= 5) return 5;
  return Math.round(e) as 1 | 2 | 3 | 4 | 5;
}

export function toSheetItem(r: DbItem): SheetItem {
  return {
    id: r.problem_id,
    problem: {
      id: r.problem_id,
      title: r.problem_title ?? r.problem_id,
      url: r.problem_url ?? '',
      rating: r.rating ?? 1200,
      tags: r.tags ?? [],
      platform: (r.platform as any) ?? 'Unknown',
      problemId: r.problem_id,
    },
    repetitions: r.repetitions ?? 0,
    ease: clampEase(r.ease ?? 3),
    intervalDays: r.interval_days ?? 0,
    nextDueAt: new Date(r.next_due_at),
    lastOutcome: r.last_outcome ?? undefined,
  };
}

// === Fetch adaptive sheet ===
export async function getAdaptiveSheet(
  supabase: SupabaseClient,
  userId: string,
  baseRating: number,
  tags: string[] = [],
  limits?: Limits
) {
  const lim = { ...DEFAULT_LIMITS, ...(limits || {}) };
  const nowIso = new Date().toISOString();
  const soonIso = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  const ratingMin = Math.max(800, baseRating - 200);
  const ratingMax = Math.min(3500, baseRating + 200);

  const buildQuery = (gt?: string, lte?: string, limit?: number) => {
    let q = supabase
      .from('adaptive_items')
      .select(
        'problem_id,rating,tags,repetitions,ease,interval_days,next_due_at,last_outcome,problem_title,problem_url,platform'
      )
      .eq('user_id', userId)
      .gte('rating', ratingMin)
      .lte('rating', ratingMax)
      .order('next_due_at', { ascending: true });

    if (gt) q = q.gt('next_due_at', gt);
    if (lte) q = q.lte('next_due_at', lte);
    if (limit) q = q.limit(limit);
    if (tags.length) q = q.overlaps('tags', tags);

    return q;
  };

  const [nowRes, soonRes, laterRes] = await Promise.all([
    buildQuery(undefined, nowIso, lim.now),
    buildQuery(nowIso, soonIso, lim.soon),
    buildQuery(soonIso, undefined, lim.later),
  ]);

  if (nowRes.error || soonRes.error || laterRes.error)
    throw nowRes.error || soonRes.error || laterRes.error;

  return {
    baseRating,
    groups: {
      dueNow: (nowRes.data || []).map(toSheetItem),
      dueSoon: (soonRes.data || []).map(toSheetItem),
      later: (laterRes.data || []).map(toSheetItem),
    },
    stats: {
      solvedRate: 0,
      streak: 0,
      lastInteractionAt: undefined,
      weakTags: {},
    },
  };
}

// === Update outcome ===
export async function updateOutcome(
  supabase: SupabaseClient,
  userId: string,
  problemId: string,
  outcome: Outcome,
  computeNext: (item: SheetItem, outcome: Outcome) => SheetItem
) {
  const { data, error: selError } = await supabase
    .from('adaptive_items')
    .select('*')
    .eq('user_id', userId)
    .eq('problem_id', problemId)
    .single();

  if (selError || !data) return { error: selError || new Error('Problem not found') };

  const row: DbItem = data as DbItem;
  const sheetItem = toSheetItem(row);
  const next = computeNext(sheetItem, outcome);

  const { error } = await supabase
    .from('adaptive_items')
    .update({
      repetitions: next.repetitions,
      ease: next.ease,
      interval_days: next.intervalDays,
      next_due_at: next.nextDueAt.toISOString(),
      last_outcome: outcome,
    })
    .eq('user_id', userId)
    .eq('problem_id', problemId);

  if (error) return { error };

  return { ok: true, nextDueAt: next.nextDueAt };
}

// === Snooze ===
export async function snooze(
  supabase: SupabaseClient,
  userId: string,
  problemId: string,
  minutes: number
) {
  const { data, error: selError } = await supabase
    .from('adaptive_items')
    .select('next_due_at')
    .eq('user_id', userId)
    .eq('problem_id', problemId)
    .single();

  if (selError || !data) return { error: selError || new Error('Problem not found') };

  const current = new Date(data.next_due_at).getTime();
  const next = new Date(Math.max(Date.now(), current) + minutes * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('adaptive_items')
    .update({ next_due_at: next, last_outcome: 'skipped' })
    .eq('user_id', userId)
    .eq('problem_id', problemId);

  if (error) return { error };

  return { ok: true, nextDueAt: next };
}
