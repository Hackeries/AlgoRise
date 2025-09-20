"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, CheckCircle, StickyNote } from "lucide-react"

export type Problem = {
  id: string
  title: string
  url?: string
  rating: number
  tags: string[]
}

export function AdaptiveProblemCard({
  problem,
  onCompleted,
  onNotes,
  subtitle,
}: {
  problem: Problem
  onCompleted?: (p: Problem) => void
  onNotes?: (p: Problem) => void
  subtitle?: string
}) {
  const handleSolve = () => {
    if (problem.url) {
      window.open(problem.url, '_blank', 'noopener,noreferrer')
    }
  }

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
          <Button 
            className="bg-blue-600 hover:bg-blue-600/90 flex items-center gap-2" 
            onClick={handleSolve}
          >
            <ExternalLink className="h-4 w-4" />
            Solve
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => onCompleted?.(problem)}
          >
            <CheckCircle className="h-4 w-4" />
            Completed
          </Button>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            onClick={() => onNotes?.(problem)}
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
