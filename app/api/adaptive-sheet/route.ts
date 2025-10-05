import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateOutcome, getAdaptiveSheet } from '@/lib/adaptive-db';
import { computeNext } from '@/lib/sr';
import type { Outcome } from '@/lib/types';

// Only these two outcomes are allowed
type SimpleOutcome = 'solved' | 'completed';

// ✅ --- GET handler: fetch adaptive sheet problems ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get('handle');
    const baseRating = Number(searchParams.get('baseRating') || 1200);

    if (!handle) {
      return NextResponse.json({ error: 'Missing Codeforces handle' }, { status: 400 });
    }

    const supabase = await createClient();

    // 🔹 Lookup user by handle to get UUID
    const { data: userData, error: userErr } = await supabase
      .from('users')       // make sure your users table exists
      .select('id')
      .eq('handle', handle)
      .single();

    if (userErr || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userData.id; // UUID

    // 🔹 Fetch adaptive sheet using UUID
    const sheet = await getAdaptiveSheet(supabase, userId, baseRating);

    return NextResponse.json(sheet);
  } catch (err: any) {
    console.error('Adaptive sheet fetch error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ✅ --- POST handler: mark problem as solved/completed ---
export async function POST(req: Request) {
  try {
    const { problemId, outcome } = (await req.json()) as {
      problemId: string;
      outcome: SimpleOutcome;
    };

    if (!problemId || !outcome) {
      return NextResponse.json({ error: 'problemId and outcome required' }, { status: 400 });
    }

    if (!['solved', 'completed'].includes(outcome)) {
      return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const res = await updateOutcome(
      supabase,
      user.id,
      problemId,
      outcome as Outcome,
      computeNext // ✅ pass your SR function here
    );

    if ('error' in res && res.error) throw res.error;

    return NextResponse.json({ ok: true, nextDueAt: res.nextDueAt }, { status: 200 });
  } catch (err) {
    console.error('Adaptive sheet update failed:', err);
    return NextResponse.json({ error: (err as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
