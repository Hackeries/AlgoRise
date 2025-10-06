"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, CheckCircle, Clock, Trophy, Target, Flame } from "lucide-react"
import type { SessionConfig, SessionProblem } from "./practice-session-client"

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  }
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
}

export function PracticeSessionActive({
  config,
  problems,
  startTime,
  onEndSession,
  onUpdateProblems,
}: {
  config: SessionConfig
  problems: SessionProblem[]
  startTime: number
  onEndSession: () => void
  onUpdateProblems: (problems: SessionProblem[]) => void
}) {
  const [elapsed, setElapsed] = useState(0)
  const [timeWarning, setTimeWarning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsedMs = now - startTime
      setElapsed(elapsedMs)

      // Show warning when 5 minutes left
      if (config.duration > 0) {
        const remaining = config.duration * 60 * 1000 - elapsedMs
        if (remaining <= 5 * 60 * 1000 && remaining > 0) {
          setTimeWarning(true)
        }
        if (remaining <= 0) {
          onEndSession()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, config.duration, onEndSession])

  const solvedCount = problems.filter((p) => p.solved).length
  const progress = (solvedCount / problems.length) * 100

  const handleMarkSolved = (problemId: string) => {
    const updated = problems.map((p) => (p.id === problemId ? { ...p, solved: true, solvedAt: Date.now() } : p))
    onUpdateProblems(updated)
  }

  const getRemainingTime = () => {
    if (config.duration === 0) return null
    const remaining = config.duration * 60 * 1000 - elapsed
    return Math.max(0, remaining)
  }

  const remainingTime = getRemainingTime()

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {solvedCount}/{problems.length}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <Progress value={progress} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Elapsed</p>
                <p className="text-2xl font-bold">{formatTime(elapsed)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {remainingTime !== null && (
          <Card className={`border-2 ${timeWarning ? "border-red-300 bg-red-50" : ""}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Time Left</p>
                  <p className={`text-2xl font-bold ${timeWarning ? "text-red-600" : ""}`}>
                    {formatTime(remainingTime)}
                  </p>
                </div>
                <Flame className={`h-8 w-8 ${timeWarning ? "text-red-600" : "text-orange-600"}`} />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <p className="text-lg font-bold">
                  {config.ratingMin}-{config.ratingMax}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Problems Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {problems.map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <Card
                className={`border-2 transition-all duration-300 ${
                  problem.solved ? "border-green-300 bg-green-50" : "hover:border-primary/30"
                }`}
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg leading-tight">
                        {problem.index}. {problem.name}
                      </h3>
                      {problem.solved && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="font-semibold">
                        ★ {problem.rating}
                      </Badge>
                      {problem.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() =>
                        window.open(
                          `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
                          "_blank",
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Solve
                    </Button>
                    {!problem.solved && (
                      <Button variant="outline" onClick={() => handleMarkSolved(problem.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* End Session Button */}
      <div className="flex justify-center pt-6">
        <Button size="lg" variant="outline" onClick={onEndSession} className="px-8">
          End Session
        </Button>
      </div>
    </div>
  )
}
