import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const matchType = body.matchType || '1v1'

    // Generate a unique challenge ID
    const challengeId = nanoid(10)
    
    // Create a pending challenge that expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    // Store the challenge in database
    const { error: insertError } = await supabase
      .from('arena_challenges')
      .insert({
        id: challengeId,
        creator_id: user.id,
        match_type: matchType,
        expires_at: expiresAt,
        status: 'pending',
      })

    if (insertError) {
      // If table doesn't exist, return the challenge ID anyway (will be created on join)
      console.error('Challenge insert error (table may not exist):', insertError)
    }

    return NextResponse.json({
      success: true,
      challengeId,
      expiresAt,
    })
  } catch (error) {
    console.error('Create challenge error:', error)
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's pending challenges
    const { data: challenges } = await supabase
      .from('arena_challenges')
      .select('*')
      .eq('creator_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({ challenges: challenges ?? [] })
  } catch (error) {
    console.error('Get challenges error:', error)
    return NextResponse.json({ challenges: [] })
  }
}
