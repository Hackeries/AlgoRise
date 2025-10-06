"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Contest {
  id: number
  name: string
  type: string
  phase: string
  durationSeconds: number
  startTimeSeconds: number
}

export function UpcomingContests() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch("https://codeforces.com/api/contest.list")
        const data = await res.json()

        if (data.status === "OK") {
          const upcoming = data.result.filter((c: Contest) => c.phase === "BEFORE").slice(0, 5)
          setContests(upcoming)
        }
      } catch (error) {
        console.error("Failed to fetch contests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContests()
  }, [])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    return `${hours}h`
  }

  const formatStartTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return `in ${days}d ${hours}h`
    } else if (hours > 0) {
      return `in ${hours}h`
    } else {
      return "soon"
    }
  }

  return (
    <Card className="bg-neutral-900/80 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl">Upcoming Contests</CardTitle>
        <CardDescription>Codeforces contests starting soon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 border border-gray-800 rounded-lg">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : contests.length > 0 ? (
            contests.map((contest) => (
              <div
                key={contest.id}
                className="p-3 border border-gray-800 rounded-lg hover:border-purple-500/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm truncate group-hover:text-purple-400 transition-colors">
                      {contest.name}
                    </h4>
                    <div className="flex flex-col gap-1 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatStartTime(contest.startTimeSeconds)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(contest.durationSeconds)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {contest.type}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
                    <a href={`https://codeforces.com/contest/${contest.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">No upcoming contests</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
