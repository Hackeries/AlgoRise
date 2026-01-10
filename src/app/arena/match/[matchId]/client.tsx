'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Swords, Clock, Trophy, Zap, AlertTriangle } from 'lucide-react'
import type { ArenaMatch, ArenaPlayer, MatchState } from '@/types/arena'
import { MATCH_DURATION_MINUTES, PRESSURE_PHASE_MINUTES } from '@/types/arena'

interface Problem {
  id: string
  title: string
  difficulty?: string
  rating?: number
}

interface ArenaMatchClientProps {
  matchId: string
  userId: string
  initialMatch: ArenaMatch
  initialPlayer: ArenaPlayer
  problems: Problem[]
}

export function ArenaMatchClient({
  matchId,
  userId,
  initialMatch,
  initialPlayer,
  problems,
}: ArenaMatchClientProps) {
  const router = useRouter()
  const [match, setMatch] = useState<ArenaMatch>(initialMatch)
  const [player, setPlayer] = useState<ArenaPlayer>(initialPlayer)
  const [timeRemaining, setTimeRemaining] = useState(MATCH_DURATION_MINUTES * 60)
  const [isPressurePhase, setIsPressurePhase] = useState(false)
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [error, setError] = useState('')

  // calculate time remaining based on match start
  useEffect(() => {
    if (!match.started_at) return

    const startTime = new Date(match.started_at).getTime()
    const endTime = startTime + MATCH_DURATION_MINUTES * 60 * 1000

    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
      setTimeRemaining(remaining)

      // check pressure phase
      const pressureStart = endTime - PRESSURE_PHASE_MINUTES * 60 * 1000
      setIsPressurePhase(now >= pressureStart)

      // check if match ended
      if (remaining <= 0 && match.state === 'live') {
        router.push(`/arena/match/${matchId}/results`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [match.started_at, match.state, matchId, router])

  // format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // handle problem navigation
  const goToNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1)
    }
  }

  const goToPrevProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1)
    }
  }

  // waiting state
  if (match.state === 'waiting') {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="text-center">
          <CardContent className="py-16">
            <Swords className="h-16 w-16 mx-auto mb-6 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold mb-4">Waiting for Opponent</h2>
            <p className="text-muted-foreground mb-8">
              The match will begin once your opponent joins
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/arena')}>
                Cancel Match
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // match finished
  if (match.state === 'finished') {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="text-center">
          <CardContent className="py-16">
            <Trophy className="h-16 w-16 mx-auto mb-6 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">Match Complete</h2>
            <Button onClick={() => router.push(`/arena/match/${matchId}/results`)}>
              View Results
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentProblem = problems[currentProblemIndex]
  const solvedProblems = player.problems_solved || []

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4">
      {/* header with timer */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Swords className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Arena Match</h1>
            <p className="text-sm text-muted-foreground">1v1 Battle</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          isPressurePhase ? 'bg-red-500/20 text-red-500' : 'bg-muted'
        }`}>
          <Clock className="h-5 w-5" />
          <span className="text-2xl font-mono font-bold">{formatTime(timeRemaining)}</span>
          {isPressurePhase && (
            <Badge variant="destructive" className="ml-2">
              <Zap className="h-3 w-3 mr-1" />
              Pressure Phase
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Score:</span>
          <span className="text-2xl font-bold">{player.score || 0}</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>{solvedProblems.length} / {problems.length} solved</span>
          <span>{Math.round((solvedProblems.length / problems.length) * 100)}%</span>
        </div>
        <Progress value={(solvedProblems.length / problems.length) * 100} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* problem list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Problems</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {problems.map((problem, index) => {
              const isSolved = solvedProblems.includes(problem.id)
              const isCurrent = index === currentProblemIndex

              return (
                <button
                  key={problem.id}
                  onClick={() => setCurrentProblemIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isSolved
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Problem {index + 1}</span>
                    {isSolved && <Trophy className="h-4 w-4" />}
                  </div>
                  {problem.rating && (
                    <span className="text-xs opacity-70">{problem.rating}</span>
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* problem content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentProblem?.title || 'Loading...'}</CardTitle>
              {currentProblem?.rating && (
                <Badge variant="outline">{currentProblem.rating}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="mb-4">Problem content loads here</p>
                <p className="text-sm">
                  Solve the problem on Codeforces and submit your solution
                </p>
                <Button className="mt-4" asChild>
                  <a
                    href={`https://codeforces.com/problemset/problem/${currentProblem?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open on Codeforces
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={goToPrevProblem}
                disabled={currentProblemIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={goToNextProblem}
                disabled={currentProblemIndex === problems.length - 1}
              >
                Next Problem
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
