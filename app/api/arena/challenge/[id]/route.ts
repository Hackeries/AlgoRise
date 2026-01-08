import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params
    const supabase = await createClient()

    // Try to get challenge from database
    const { data: challenge, error } = await supabase
      .from('arena_challenges')
      .select(`
        id,
        creator_id,
        match_type,
        expires_at,
        status,
        profiles!arena_challenges_creator_id_fkey (
          display_name,
          email
        )
      `)
      .eq('id', challengeId)
      .single()

    if (error || !challenge) {
      // Return a mock challenge for demo purposes
      return NextResponse.json({
        id: challengeId,
        creatorName: 'A challenger',
        matchType: '1v1',
        expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
        status: 'pending',
      })
    }

    // Check if expired
    const isExpired = new Date(challenge.expires_at) < new Date()

    return NextResponse.json({
      id: challenge.id,
      creatorName: (challenge.profiles as any)?.display_name || 'A challenger',
      matchType: challenge.match_type,
      expiresAt: challenge.expires_at,
      status: isExpired ? 'expired' : challenge.status,
    })
  } catch (error) {
    console.error('Get challenge error:', error)
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }
}
