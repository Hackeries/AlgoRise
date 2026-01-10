import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArenaMatchClient } from './client'

interface PageProps {
  params: Promise<{ matchId: string }>
}

export default async function ArenaMatchPage({ params }: PageProps) {
  const { matchId } = await params
  const supabase = await createClient()

  // check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(`/auth/login?redirect=/arena/match/${matchId}`)
  }

  // fetch match details
  const { data: match, error: matchError } = await supabase
    .from('arena_matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    notFound()
  }

  // check if user is participant
  const { data: player } = await supabase
    .from('arena_players')
    .select('*')
    .eq('match_id', matchId)
    .eq('user_id', user.id)
    .single()

  if (!player) {
    // user is not in this match
    redirect('/arena')
  }

  // get match problems
  const { data: problems } = await supabase
    .from('problems')
    .select('id, title, difficulty, rating')
    .in('id', match.problem_ids || [])

  return (
    <ArenaMatchClient
      matchId={matchId}
      userId={user.id}
      initialMatch={match}
      initialPlayer={player}
      problems={problems || []}
    />
  )
}
