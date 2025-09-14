"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type Problem = {
  id: string
  title: string
  url?: string
  rating: number
  tags: string[]
}

export function AdaptiveProblemCard({
  problem,
  onSolve,
  onSkip,
  onLearn,
  subtitle,
  onFail,
  onSnooze,
}: {
  problem: Problem
  onSolve?: (p: Problem) => void
  onSkip?: (p: Problem) => void
  onLearn?: (p: Problem) => void
  subtitle?: string
  onFail?: (p: Problem) => void
  onSnooze?: (p: Problem) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold leading-tight">{problem.title}</CardTitle>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Rating {problem.rating}</Badge>
          {problem.tags.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 hover:bg-blue-600/90" onClick={() => onSolve?.(problem)}>
            Solve
          </Button>
          <Button variant="outline" onClick={() => onSkip?.(problem)}>
            Skip
          </Button>
          <Button variant="ghost" onClick={() => onLearn?.(problem)}>
            Learn
          </Button>
          {onFail ? (
            <Button variant="ghost" onClick={() => onFail?.(problem)}>
              Fail
            </Button>
          ) : null}
          {onSnooze ? (
            <Button variant="ghost" onClick={() => onSnooze?.(problem)}>
              Snooze
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
