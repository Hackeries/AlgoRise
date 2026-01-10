"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Trophy, Clock, Target, TrendingUp, RotateCcw, CheckCircle, XCircle } from "lucide-react"
import type { SessionConfig, SessionProblem } from "./practice-session-client"

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m ${seconds % 60}s`
}

export function PracticeSessionResults({
  config,
  problems,
  startTime,
  endTime,
  onNewSession,
}: {
  config: SessionConfig
  problems: SessionProblem[]
  startTime: number
  endTime: number
  onNewSession: () => void
}) {
  const duration = endTime - startTime
  const solvedCount = problems.filter((p) => p.solved).length
  const accuracy = (solvedCount / problems.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-2xl sm:text-3xl font-bold">Session Complete!</h1>
        <p className="text-muted-foreground text-lg">Great work! Here's how you performed</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Trophy className="h-10 w-10 mx-auto text-yellow-600" />
                <p className="text-sm text-muted-foreground">Problems Solved</p>
                <p className="text-3xl font-bold">
                  {solvedCount}/{problems.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Clock className="h-10 w-10 mx-auto text-blue-600" />
                <p className="text-sm text-muted-foreground">Time Taken</p>
                <p className="text-3xl font-bold">{formatTime(duration)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Target className="h-10 w-10 mx-auto text-green-600" />
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-3xl font-bold">{accuracy.toFixed(0)}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <TrendingUp className="h-10 w-10 mx-auto text-purple-600" />
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-3xl font-bold">
                  {Math.round(problems.reduce((sum, p) => sum + p.rating, 0) / problems.length)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Problems List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Problem Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {problems.map((problem, index) => (
                <div key={problem.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3 flex-1">
                    {problem.solved ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {problem.index}. {problem.name}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          ★ {problem.rating}
                        </Badge>
                        {problem.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center gap-4"
      >
        <Button size="lg" onClick={onNewSession} className="px-8">
          <RotateCcw className="mr-2 h-5 w-5" />
          New Session
        </Button>
      </motion.div>
    </div>
  )
}
