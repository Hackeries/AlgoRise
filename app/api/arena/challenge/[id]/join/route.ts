import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

async function ensureArenaRating(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: existing } = await supabase
    .from('arena_ratings')
    .select('user_id')
    .eq('user_id', userId)
    .single()

  if (!existing) {
    await supabase.from('arena_ratings').insert({
      user_id: userId,
      elo_1v1: 800,
      elo_3v3: 800,
      tier_1v1: 'bronze',
      tier_3v3: 'bronze',
      matches_played_1v1: 0,
      matches_played_3v3: 0,
      matches_won_1v1: 0,
      matches_won_3v3: 0,
      current_win_streak: 0,
      best_win_streak: 0,
      titles: [],
    }).select().single()
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure the joining user has arena rating record
    await ensureArenaRating(supabase, user.id)

    // Get challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('arena_challenges')
      .select('*')
      .eq('id', challengeId)
      .single()

    // If challenge doesn't exist in DB, create a demo match
    if (challengeError || !challenge) {
      const matchId = nanoid(12)
      
      // Create a demo match - ignore errors if table doesn't exist
      const { error: matchInsertError } = await supabase.from('arena_matches').insert({
        id: matchId,
        match_type: '1v1',
        mode: 'friendly',
        player1_id: user.id,
        player2_id: null,
        state: 'waiting',
        problem_ids: ['demo_problem_1', 'demo_problem_2', 'demo_problem_3'],
        fog_of_progress: true,
      })

      if (matchInsertError) {
        console.error('Match insert error:', matchInsertError)
      }

      return NextResponse.json({
        success: true,
        matchId,
        message: 'Match created',
      })
    }

    // Check if expired
    if (new Date(challenge.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Challenge has expired' }, { status: 400 })
    }

    // Check if already accepted
    if (challenge.status !== 'pending') {
      return NextResponse.json({ error: 'Challenge is no longer available' }, { status: 400 })
    }

    // Check if user is trying to join their own challenge
    if (challenge.creator_id === user.id) {
      return NextResponse.json({ error: 'Cannot join your own challenge' }, { status: 400 })
    }

    // Ensure both players have arena ratings
    await ensureArenaRating(supabase, challenge.creator_id)

    // Get player ratings for problem selection
    const { data: creatorRating } = await supabase
      .from('arena_ratings')
      .select('elo_1v1')
      .eq('user_id', challenge.creator_id)
      .single()

    const { data: joinerRating } = await supabase
      .from('arena_ratings')
      .select('elo_1v1')
      .eq('user_id', user.id)
      .single()

    const avgElo = Math.round(
      ((creatorRating?.elo_1v1 ?? 800) + (joinerRating?.elo_1v1 ?? 800)) / 2
    )

    // Select problems
    const problemIds = await selectMatchProblems(supabase, avgElo)

    // Create match
    const matchId = nanoid(12)
    
    const { error: matchError } = await supabase
      .from('arena_matches')
      .insert({
        id: matchId,
        match_type: challenge.match_type,
        mode: 'friendly',
        player1_id: challenge.creator_id,
        player2_id: user.id,
        state: 'live',
        problem_ids: problemIds,
        fog_of_progress: true,
        started_at: new Date().toISOString(),
      })

    if (matchError) {
      console.error('Match creation error:', matchError)
    }

    // Update challenge status
    await supabase
      .from('arena_challenges')
      .update({ status: 'accepted', match_id: matchId })
      .eq('id', challengeId)

    // Create player records
    await supabase.from('arena_players').insert([
      { match_id: matchId, user_id: challenge.creator_id },
      { match_id: matchId, user_id: user.id },
    ])

    return NextResponse.json({
      success: true,
      matchId,
      message: 'Challenge accepted!',
    })
  } catch (error) {
    console.error('Join challenge error:', error)
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 })
  }
}

async function selectMatchProblems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  targetRating: number
): Promise<string[]> {
  const ratingRange = 300

  const { data: problems } = await supabase
    .from('problems')
    .select('id')
    .gte('difficulty_rating', targetRating - ratingRange)
    .lte('difficulty_rating', targetRating + ratingRange)
    .eq('is_active', true)
    .limit(10)

  if (!problems || problems.length === 0) {
    return ['demo_problem_1', 'demo_problem_2', 'demo_problem_3']
  }

  const shuffled = problems.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).map(p => p.id)
}
