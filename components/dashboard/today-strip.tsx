"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

type Problem = {
  id: string
  title: string
  rating: number
  tags: string[]
  url: string
}

export function TodayStrip() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch("/api/today-problems")
        const data = await response.json()
        setProblems(data.problems || [])
      } catch (error) {
        console.error("Failed to fetch today problems:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">Today</h1>
            <p className="text-sm text-muted-foreground">Loading your personalized problems...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-muted-foreground/10 animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">Today</h1>
          <p className="text-sm text-muted-foreground">
            Your daily set adapts to your rating and weak tags. Complete at least one item to extend your streak.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500 text-black hover:bg-amber-500">Streak: 7 days</Badge>
          <Badge variant="outline">Next due: 3</Badge>
        </div>
      </div>

      {/* Recommended problems */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {problems.map((p) => (
          <Card key={p.id} className="border-muted-foreground/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{p.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Rating {p.rating}</span>
                <span className="mx-1 text-muted-foreground/40" aria-hidden>
                  •
                </span>
                <div className="flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-end gap-2">
              <Button variant="ghost" className="text-muted-foreground" aria-label="Skip problem">
                Skip
              </Button>
              <Button variant="outline" asChild aria-label="Open learning resource">
                <Link href="/visualizers">Learn</Link>
              </Button>
              <Button asChild aria-label="Open problem to solve">
                <Link href={p.url} target="_blank" rel="noopener noreferrer">
                  Solve
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recovery mode callout */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recovery mode suggestion</CardTitle>
          <CardDescription>
            After a contest or a slump, we’ll queue confidence-boosters at −300 to −150 rating in your favorite tags.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-end">
          <Button variant="outline">Preview recovery set</Button>
        </CardContent>
      </Card>
    </div>
  )
}
