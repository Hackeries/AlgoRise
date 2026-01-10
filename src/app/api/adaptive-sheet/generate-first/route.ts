import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's CF rating from latest snapshot
    const { data: snapshot } = await supabase
      .from('cf_snapshots')
      .select('rating, cf_handle')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const userRating = snapshot?.rating || 1200;
    const cfHandle = snapshot?.cf_handle;

    // Generate first adaptive sheet with 3 problems
    const targetRatings = [
      Math.max(800, userRating - 300), // Confidence builder
      Math.max(800, userRating - 200), // Warm-up
      Math.max(800, userRating - 100), // Challenge
    ];

    const problems = targetRatings.map((rating, index) => ({
      id: `first-${index + 1}`,
      title: `${['Implementation', 'Math', 'Greedy'][index]} Practice`,
      rating,
      tags: [['implementation'], ['math'], ['greedy']][index],
      url: `https://codeforces.com/problemset?tags=${['implementation', 'math', 'greedy'][index]}&order=BY_RATING_ASC`,
      status: 'pending',
      difficulty_adjustment: 0,
    }));

    // Insert problems into adaptive_items
    const { error: insertError } = await supabase.from('adaptive_items').insert(
      problems.map(problem => ({
        user_id: user.id,
        problem_id: problem.id,
        title: problem.title,
        rating: problem.rating,
        tags: problem.tags,
        url: problem.url,
        status: 'pending',
        difficulty_adjustment: 0,
      }))
    );

    if (insertError) {
      console.error('Error inserting adaptive items:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate sheet' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      problems,
      message: 'First adaptive sheet generated successfully',
      userRating,
      cfHandle,
    });
  } catch (error) {
    console.error('Error generating first sheet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
