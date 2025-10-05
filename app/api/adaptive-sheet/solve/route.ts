import { NextResponse } from 'next/server';
import { updateOutcome } from '@/lib/adaptive-store';
import { createClient } from '@/lib/supabase/server';
import { updateOutcomeDb, type DbItem } from '@/lib/adaptive-db';
import { computeNext } from '@/lib/sr';
import type { SheetItem, Platform, Outcome } from '@/lib/types';

// Make sure Outcome type includes these values:
// type Outcome = 'skipped' | 'reviewed' | 'solved' | 'completed';

export async function POST(req: Request) {
  const { problemId, action } = await req.json();

  if (!problemId) {
    return NextResponse.json({ error: 'problemId required' }, { status: 400 });
  }

  // Determine outcome from action; fallback to 'solved'
  const outcome = (action === 'completed' ? 'completed' : 'solved') as Outcome;

  try {
    const supabase = await createClient();
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Fetch Codeforces handle from profiles table
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('cf_handle')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile?.cf_handle) {
      return NextResponse.json({ error: 'CF handle not found' }, { status: 400 });
    }

    const cfHandle = profile.cf_handle;

    const res = await updateOutcomeDb(
      supabase,
      user.id,
      problemId,
      (row: DbItem) => {
        const sheetRow: SheetItem = {
          id: row.problem_id,
          problem: {
            id: row.problem_id,
            platform: 'codeforces' as Platform,
            problemId: row.problem_id,
            title: row.problem_title ?? row.problem_id,
            url: row.problem_url ?? '',
            rating: row.rating ?? undefined,
            tags: row.tags ?? [],
          },
          repetitions: row.repetitions ?? 0,
          ease: clampEase(row.ease ?? 3),
          intervalDays: row.interval_days ?? 0,
          nextDueAt: row.next_due_at ? new Date(row.next_due_at) : new Date(),
        };

        const next = computeNext(sheetRow, outcome);

        return {
          ...row,
          repetitions: next.repetitions,
          ease: next.ease,
          interval_days: next.intervalDays,
          next_due_at: next.nextDueAt.toISOString(),
          last_outcome: outcome,
        };
      }
    );

    if ('error' in res && res.error) throw res.error;

    return NextResponse.json({ ok: true, nextDueAt: res.nextDueAt }, { status: 200 });
  } catch (err) {
    console.error('Adaptive sheet update failed, falling back to demo:', err);
  }

  // In-memory fallback for demo
  const data = updateOutcome('demo', problemId, outcome);
  return NextResponse.json(data, { status: 200 });
}

// Helper: clamp numeric ease to 1 | 2 | 3 | 4 | 5
function clampEase(e: number): 1 | 2 | 3 | 4 | 5 {
  if (e <= 1) return 1;
  if (e >= 5) return 5;
  return Math.round(e) as 1 | 2 | 3 | 4 | 5;
}
