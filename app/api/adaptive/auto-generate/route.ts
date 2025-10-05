import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface AdaptiveSheetRow {
  user_id: string;
  problems: any[];
  updated_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'User not logged in' }, { status: 401 });
    }

    // Get CF handle and rating from profiles table
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('cf_handle, cf_rating')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile?.cf_handle) {
      return NextResponse.json({ error: 'CF handle not verified' }, { status: 400 });
    }

    // Cast to expected shape
    const cf_handle = (profile as any).cf_handle as string;
    const cf_rating = (profile as any).cf_rating as number | null;

    if (!cf_rating) {
      return NextResponse.json({ error: 'CF rating not found for user' }, { status: 400 });
    }

    const floor = Math.floor(cf_rating / 100) * 100;
    const minRating = Math.max(800, floor - 200);
    const maxRating = floor + 200;
    const count = 70;

    const problemsRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/problems?handle=${cf_handle}&rating=${floor}&count=${count}`
    );

    if (!problemsRes.ok) {
      const text = await problemsRes.text();
      throw new Error(`Failed to fetch problems: ${text}`);
    }

    const data = await problemsRes.json();

    // Upsert adaptive sheet
    const { error: upErr } = await supabase
      .from('adaptive_sheet')
      .upsert({
        user_id: user.id,
        problems: data.problems,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upErr) throw new Error(upErr.message);

    return NextResponse.json({
      ok: true,
      floor,
      ratingRange: { min: minRating, max: maxRating },
      problemsCount: data.problems.length,
      problems: data.problems,
    });

  } catch (error) {
    console.error('Error generating adaptive sheet:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}
