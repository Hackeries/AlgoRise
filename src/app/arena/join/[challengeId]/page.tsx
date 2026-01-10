'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Swords,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  UserCircle,
} from 'lucide-react'

interface ChallengeInfo {
  id: string
  creatorName: string
  matchType: '1v1' | '3v3'
  expiresAt: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
}

export default function JoinChallengePage({ params }: { params: Promise<{ challengeId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    
    fetchChallenge()
  }, [authLoading, resolvedParams.challengeId])

  const fetchChallenge = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/arena/challenge/${resolvedParams.challengeId}`)
      
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Challenge not found')
        return
      }
      
      const data = await res.json()
      setChallenge(data)
    } catch (err) {
      setError('Failed to load challenge')
    } finally {
      setLoading(false)
    }
  }

  const joinChallenge = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/arena/join/${resolvedParams.challengeId}`)
      return
    }

    setJoining(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/arena/challenge/${resolvedParams.challengeId}/join`, {
        method: 'POST',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join challenge')
      }
      
      const data = await res.json()
      router.push(`/arena/match/${data.matchId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge')
      setJoining(false)
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (error && !challenge) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-destructive/10">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Challenge Not Found</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button asChild>
                <Link href="/arena">Go to Arena</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (challenge?.status === 'expired') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-amber-500/10">
                <Clock className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold">Challenge Expired</h2>
              <p className="text-muted-foreground">This challenge link has expired.</p>
              <Button asChild>
                <Link href="/arena">Create New Challenge</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-full bg-primary/10 mb-4">
            <Swords className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Battle Challenge</CardTitle>
          <CardDescription>You've been challenged to a duel!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center gap-3">
              <UserCircle className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">{challenge?.creatorName || 'A challenger'}</p>
                <p className="text-sm text-muted-foreground">wants to battle you</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Match Type</span>
              <span className="font-medium">{challenge?.matchType || '1v1'} Duel</span>
            </div>
            
            {challenge?.expiresAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(challenge.expiresAt).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {!user ? (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Sign in to accept this challenge
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push(`/auth/login?redirect=/arena/join/${resolvedParams.challengeId}`)}
              >
                Sign In to Accept
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full" 
              size="lg"
              onClick={joinChallenge}
              disabled={joining}
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Swords className="h-4 w-4 mr-2" />
                  Accept Challenge
                </>
              )}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            By accepting, you'll start a real-time coding battle
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
