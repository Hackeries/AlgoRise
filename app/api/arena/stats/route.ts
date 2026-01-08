import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create arena rating
    let { data: rating } = await supabase
      .from('arena_ratings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!rating) {
      // Create default rating for new user
      const { data: newRating } = await supabase
        .from('arena_ratings')
        .insert({ user_id: user.id })
        .select()
        .single()
      rating = newRating
    }

    const stats = {
      elo: rating?.elo_1v1 ?? 1200,
      tier: rating?.tier_1v1 ?? 'gold',
      matchesPlayed: rating?.matches_played_1v1 ?? 0,
      winRate: rating?.matches_played_1v1 
        ? Math.round((rating.matches_won_1v1 / rating.matches_played_1v1) * 100) 
        : 0,
      currentStreak: rating?.current_win_streak ?? 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Arena stats error:', error)
    // Return default stats on error
    return NextResponse.json({
      elo: 1200,
      tier: 'gold',
      matchesPlayed: 0,
      winRate: 0,
      currentStreak: 0,
    })
  }
}
