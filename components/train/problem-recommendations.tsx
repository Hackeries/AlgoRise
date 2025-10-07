"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCFVerification } from "@/lib/context/cf-verification"
import { ExternalLink, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Problem {
  contestId: number
  index: string
  name: string
  rating?: number
  tags: string[]
}

export function ProblemRecommendations() {
  const { isVerified, verificationData } = useCFVerification()
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecommendations = async () => {
    if (!verificationData) return

    setLoading(true)
    try {
      const userRating = verificationData.rating || 1200
      const minRating = Math.max(800, userRating - 200)
      const maxRating = userRating + 300

      const res = await fetch("https://codeforces.com/api/problemset.problems")
      const data = await res.json()

      if (data.status === "OK") {
        const filtered = data.result.problems
          .filter((p: Problem) => p.rating && p.rating >= minRating && p.rating <= maxRating)
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)

        setProblems(filtered)
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isVerified) {
      fetchRecommendations()
    }
  }, [isVerified, verificationData])

  if (!isVerified) {
    return null
  }

  return (
    <Card className="bg-neutral-900/80 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Recommended Problems</CardTitle>
          <CardDescription>Based on your current rating ({verificationData?.rating || 0})</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchRecommendations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 border border-gray-800 rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : problems.length > 0 ? (
            problems.map((problem) => (
              <div
                key={`${problem.contestId}${problem.index}`}
                className="p-3 border border-gray-800 rounded-lg hover:border-blue-500/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                      {problem.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      <span>
                        {problem.contestId}
                        {problem.index}
                      </span>
                      {problem.rating && (
                        <>
                          <span>•</span>
                          <span className="text-blue-400">{problem.rating}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {problem.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
                    <a
                      href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">No recommendations available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
