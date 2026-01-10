import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cancel any waiting matches created by this user
    await supabase
      .from('arena_matches')
      .update({ state: 'cancelled' })
      .eq('player1_id', user.id)
      .eq('state', 'waiting')
      .is('player2_id', null)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel matchmaking error:', error)
    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 })
  }
}
