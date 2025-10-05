"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/context"
import { useRealtimeUpdates, useCrossTabSync } from "@/lib/hooks/use-real-time"

type Contest = {
  id: string
  name: string
  date: string
  type: "group" | "public"
}

export function RightRail() {
  const { user } = useAuth()
  const [streakData, setStreakData] = useState({ current: 0, calendar: [] as boolean[] })
  const [contests, setContests] = useState<Contest[]>([])
  const [cfHandle, setCfHandle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useRealtimeUpdates("/api/analytics/summary", {
    refreshInterval: 30000, // Update every 30 seconds
    revalidateOnFocus: true,
  })

  useRealtimeUpdates("/api/contests/upcoming", {
    refreshInterval: 60000, // Update every minute for contest times
    revalidateOnFocus: true,
  })

  useCrossTabSync("rg_streak_updated", () => {
    fetchData()
  })

  const fetchData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Fetch streak data
      const streakResponse = await fetch("/api/analytics/summary")
      const streakData = await streakResponse.json()

      // Generate streak calendar based on current streak
      const calendar = Array.from({ length: 21 }, (_, i) => {
        const dayIndex = 20 - i // Most recent day is at the end
        return dayIndex < (streakData.currentStreak || 0)
      })

      setStreakData({
        current: streakData.currentStreak || 0,
        calendar,
      })

      // Fetch upcoming contests
      const contestsResponse = await fetch("/api/contests/upcoming")
      if (contestsResponse.ok) {
        const contestsData = await contestsResponse.json()
        setContests(contestsData.contests || [])
      }

      // Check CF handle verification status
      const profileResponse = await fetch("/api/profile/cf-handle")
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setCfHandle(profileData.handle)
      }
    } catch (error) {
      console.error("Failed to fetch right rail data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Streak card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Streak</CardTitle>
          <CardDescription>
            {streakData.current > 0
              ? `${streakData.current} day${streakData.current === 1 ? "" : "s"} strong! Keep it going.`
              : "Complete one meaningful action today to start your streak."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div aria-label="Streak calendar" className="grid grid-cols-7 gap-1">
            {streakData.calendar.map((active, i) => (
              <div
                key={i}
                className={active ? "h-3 w-3 rounded bg-primary" : "h-3 w-3 rounded bg-muted"}
                title={active ? "Active day" : "Inactive day"}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating trend mini */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rating trend</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role="img"
            aria-label="Rating trend visualization"
            className="h-24 w-full rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground"
          >
            {cfHandle ? "Rating chart coming soon" : "Link CF handle to see rating trends"}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming contests */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Upcoming contests</CardTitle>
          <CardDescription>Private practice and school group events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {contests.length > 0 ? (
            contests.slice(0, 2).map((contest) => (
              <div key={contest.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{contest.name}</span>
                <Badge variant="outline">{contest.date}</Badge>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground py-2">No upcoming contests. Create one to get started!</div>
          )}
          <Button variant="outline" className="mt-2 w-full bg-transparent">
            Create contest
          </Button>
        </CardContent>
      </Card>

      {/* Verification status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">CF Handle</CardTitle>
          <CardDescription>Link and verify your Codeforces handle.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Badge variant={cfHandle ? "default" : "secondary"}>{cfHandle || "Not linked"}</Badge>
          <Button variant="outline" size="sm">
            {cfHandle ? "Update" : "Verify handle"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
