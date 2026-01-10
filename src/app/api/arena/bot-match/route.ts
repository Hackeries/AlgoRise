import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

type BotDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

const BOT_RATINGS: Record<BotDifficulty, { min: number; max: number }> = {
  beginner: { min: 800, max: 1000 },
  intermediate: { min: 1200, max: 1400 },
  advanced: { min: 1600, max: 1800 },
  expert: { min: 2000, max: 2200 },
}

const BOT_NAMES: Record<BotDifficulty, string[]> = {
  beginner: ['Rookie Bot', 'Learning Larry', 'Newbie Nick'],
  intermediate: ['Steady Steve', 'Balanced Betty', 'Middle Mike'],
  advanced: ['Sharp Sally', 'Pro Pete', 'Skilled Sam'],
  expert: ['Master Max', 'Elite Emma', 'Genius Gary'],
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const matchType = body.matchType || '1v1'
    const difficulty: BotDifficulty = body.difficulty || 'intermediate'

    // Validate difficulty
    if (!BOT_RATINGS[difficulty]) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
    }

    // Get player's rating for problem selection
    const { data: playerRating } = await supabase
      .from('arena_ratings')
      .select('elo_1v1')
      .eq('user_id', user.id)
      .single()

    const playerElo = playerRating?.elo_1v1 ?? 1200

    // Select problems based on average of player and bot rating
    const botRating = (BOT_RATINGS[difficulty].min + BOT_RATINGS[difficulty].max) / 2
    const avgRating = Math.round((playerElo + botRating) / 2)
    
    // Get suitable problems
    const problemIds = await selectMatchProblems(supabase, avgRating)

    // Generate bot name
    const botNames = BOT_NAMES[difficulty]
    const botName = botNames[Math.floor(Math.random() * botNames.length)]

    // Create match
    const matchId = nanoid(12)
    
    const { error: matchError } = await supabase
      .from('arena_matches')
      .insert({
        id: matchId,
        match_type: matchType,
        mode: 'bot',
        player1_id: user.id,
        player2_id: null, // No second player for bot matches
        state: 'live',
        problem_ids: problemIds,
        fog_of_progress: true,
        started_at: new Date().toISOString(),
        bot_config: {
          difficulty,
          rating: botRating,
          name: botName,
        },
      })

    if (matchError) {
      console.error('Match creation error:', matchError)
      // Still return a match ID for demo purposes
    }

    // Create player record
    await supabase.from('arena_players').insert({
      match_id: matchId,
      user_id: user.id,
    })

    return NextResponse.json({
      success: true,
      matchId,
      botName,
      botRating,
    })
  } catch (error) {
    console.error('Bot match error:', error)
    return NextResponse.json({ error: 'Failed to create bot match' }, { status: 500 })
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
    // Fallback demo problems
    return ['demo_problem_1', 'demo_problem_2', 'demo_problem_3']
  }

  // Randomly select 3 problems
  const shuffled = problems.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).map(p => p.id)
}
