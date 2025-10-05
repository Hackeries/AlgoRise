import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdaptiveSheetResponse, Outcome } from '@/lib/types';
import { computeNext } from './sr';
import { fetchAdaptiveSheetDb, updateOutcomeDb, snoozeDb, DbItem, toSheetItem } from './adaptive-db';

/**
 * Get the adaptive sheet for a user.
 * Floors rating to nearest 100, applies ±200 bounds, clamps to [800, 3500].
 */
export async function getAdaptiveSheet(
  supabase: SupabaseClient,
  userId: string,
  currentRating: number,
  tags: string[] = []
): Promise<AdaptiveSheetResponse> {
  try {
    const baseRating = Math.floor(currentRating / 100) * 100;
    const res = await fetchAdaptiveSheetDb(supabase, userId, baseRating, tags);

    const ratingMin = Math.max(800, baseRating - 200);
    const ratingMax = Math.min(3500, baseRating + 200);

    const filterGroups = (items: typeof res.groups.dueNow) =>
      items.filter(p => p.problem.rating !== undefined && p.problem.rating >= ratingMin && p.problem.rating <= ratingMax);

    return {
      baseRating,
      groups: {
        dueNow: filterGroups(res.groups.dueNow),
        dueSoon: filterGroups(res.groups.dueSoon),
        later: filterGroups(res.groups.later),
      },
      stats: res.stats,
    };
  } catch (err) {
    console.error('Failed to fetch adaptive sheet:', err);
    const baseRating = Math.floor(currentRating / 100) * 100;
    return {
      baseRating,
      groups: { dueNow: [], dueSoon: [], later: [] },
      stats: { solvedRate: 0, streak: 0, lastInteractionAt: undefined, weakTags: {} },
    };
  }
}

/**
 * Update outcome for a problem.
 */
export async function updateOutcome(
  supabase: SupabaseClient,
  userId: string,
  problemId: string,
  outcome: Outcome,
  currentRating: number
): Promise<AdaptiveSheetResponse> {
  try {
    await updateOutcomeDb(supabase, userId, problemId, (row: DbItem) => {
      const sheetItem = toSheetItem(row);
      const next = computeNext(sheetItem, outcome);

      return {
        problem_id: next.id,
        rating: next.problem.rating ?? 1200,
        tags: next.problem.tags ?? [],
        repetitions: next.repetitions ?? 0,
        ease: next.ease ?? 2.5,
        interval_days: next.intervalDays ?? 0,
        next_due_at: new Date(next.nextDueAt).toISOString(),
        last_outcome: next.lastOutcome ?? null,
        problem_title: next.problem.title,
        problem_url: next.problem.url,
        platform: next.problem.platform,
      };
    });

    return await getAdaptiveSheet(supabase, userId, currentRating);
  } catch (err) {
    console.error('Failed to update outcome:', err);
    return await getAdaptiveSheet(supabase, userId, currentRating);
  }
}

/**
 * Snooze a problem for given minutes.
 */
export async function snooze(
  supabase: SupabaseClient,
  userId: string,
  problemId: string,
  minutes: number,
  currentRating: number
): Promise<AdaptiveSheetResponse> {
  try {
    await snoozeDb(supabase, userId, problemId, minutes);
    return await getAdaptiveSheet(supabase, userId, currentRating);
  } catch (err) {
    console.error('Failed to snooze problem:', err);
    return await getAdaptiveSheet(supabase, userId, currentRating);
  }
}
