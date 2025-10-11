"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Clock, Calendar, Trophy, Share2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface Contest {
  id: string
  name: string
  description: string
  contest_mode: "practice" | "icpc"
  starts_at: string
  ends_at: string
  duration_minutes: number
  problem_count: number
  rating_min: number
  rating_max: number
  max_participants?: number
  status: string
  host_user_id: string
  allow_late_join?: boolean
  problems?: { id: string; contestId: number; index: string; name: string; rating: number }[]
  my_submissions?: Record<string, "solved" | "failed">
}

interface LeaderboardEntry {
  rank: number
  user_id: string
  solved: number
  penalty: number
}

export default function ContestDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [contest, setContest] = useState<Contest | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeUntilStart, setTimeUntilStart] = useState<string>("")
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showAttemptedOnly, setShowAttemptedOnly] = useState(false)

  useEffect(() => {
    fetchContestData()
    checkRegistration()
  }, [params.id])

  useEffect(() => {
    if (!contest) return

    const interval = setInterval(() => {
      const now = new Date()
      const start = new Date(contest.starts_at)
      const diff = start.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeUntilStart("Contest has started!")
        clearInterval(interval)
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        if (days > 0) {
          setTimeUntilStart(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        } else if (hours > 0) {
          setTimeUntilStart(`${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeUntilStart(`${minutes}m ${seconds}s`)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [contest])

  const fetchContestData = async () => {
    try {
      const response = await fetch(`/api/contests/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setContest(data.contest)
      }

      const leaderboardResponse = await fetch(`/api/contests/${params.id}/leaderboard`)
      if (leaderboardResponse.ok) {
        const data = await leaderboardResponse.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error("Error fetching contest:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkRegistration = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    setCurrentUserId(user.id)

    const { data } = await supabase
      .from("contest_participants")
      .select("id")
      .eq("contest_id", params.id)
      .eq("user_id", user.id)
      .maybeSingle()

    setIsRegistered(!!data)
  }

  const handleRegister = async () => {
    setRegistering(true)
    try {
      const response = await fetch(`/api/contests/${params.id}/join`, {
        method: "POST",
      })

      if (response.ok) {
        setIsRegistered(true)
        toast({
          title: "Registered!",
          description: "You have successfully registered for this contest.",
        })
        fetchContestData()
      } else {
        const error = await response.json()
        toast({
          title: "Registration Failed",
          description: error.error || "Failed to register for contest",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register for contest",
        variant: "destructive",
      })
    } finally {
      setRegistering(false)
    }
  }

  const handleJoinContest = () => {
    if (!contest) return

    const now = new Date()
    const start = new Date(contest.starts_at)
    const registrationClose = new Date(start.getTime() + 10 * 60 * 1000)

    if (now < start) {
      toast({
        title: "Too Early!",
        description: "Contest has not started yet. Please wait.",
        variant: "destructive",
      })
      return
    }

    if (now > registrationClose && !contest.allow_late_join) {
      toast({
        title: "Registration Closed",
        description: "Registration window has closed.",
        variant: "destructive",
      })
      return
    }

    router.push(`/contests/${params.id}/participate`)
  }

  const copyShareLink = () => {
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const link = `${base}/contests/${params.id}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied!",
      description: "Contest link copied to clipboard.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
          <p className="mt-2 text-white/60">Loading contest...</p>
        </div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Contest Not Found</h1>
          <Button onClick={() => router.push("/contests")} className="mt-4">
            Back to Contests
          </Button>
        </div>
      </div>
    )
  }

  const now = new Date()
  const start = new Date(contest.starts_at)
  const end = new Date(contest.ends_at)
  const hasStarted = now >= start
  const hasEnded = now >= end

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{contest.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={hasEnded ? "secondary" : hasStarted ? "default" : "outline"}>
                {hasEnded ? "Ended" : hasStarted ? "Live" : "Upcoming"}
              </Badge>
              <Badge variant="outline">{contest.contest_mode === "practice" ? "Practice Arena" : "ICPC Arena"}</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={copyShareLink}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {contest.description && <p className="text-white/70 leading-relaxed">{contest.description}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Contest Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Contest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/60">Start Time</span>
              <span className="font-medium">{new Date(contest.starts_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Duration</span>
              <span className="font-medium">
                {Math.floor(contest.duration_minutes / 60)}h {contest.duration_minutes % 60}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Problems</span>
              <span className="font-medium">{contest.problem_count}</span>
            </div>
            {contest.max_participants && (
              <div className="flex justify-between">
                <span className="text-white/60">Max Participants</span>
                <span className="font-medium">{contest.max_participants}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Countdown / Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {hasEnded ? "Contest Ended" : hasStarted ? "Contest Live" : "Countdown"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasEnded && !hasStarted && (
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-green-400 mb-2">{timeUntilStart}</div>
                <p className="text-white/60">Until contest starts</p>
              </div>
            )}
            {hasStarted && !hasEnded && (
              <div className="text-center py-6">
                <div className="text-2xl font-bold text-green-400 mb-4">Contest is Live!</div>
                {isRegistered ? (
                  <Button onClick={handleJoinContest} size="lg" className="w-full">
                    Join Contest Now
                  </Button>
                ) : (
                  <Button onClick={handleRegister} disabled={registering} size="lg" className="w-full">
                    {registering ? "Registering..." : "Register & Join"}
                  </Button>
                )}
              </div>
            )}
            {hasEnded && (
              <div className="text-center py-6">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <p className="text-white/60">View final leaderboard below</p>
              </div>
            )}
            {!hasStarted && !hasEnded && (
              <div className="mt-4">
                {isRegistered ? (
                  <div className="text-center">
                    <Badge variant="default" className="mb-2">
                      Registered
                    </Badge>
                    <p className="text-sm text-white/60">You will be able to join when the contest starts</p>
                  </div>
                ) : (
                  <Button onClick={handleRegister} disabled={registering} className="w-full">
                    {registering ? "Registering..." : "Register Now"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {contest.problems && contest.problems.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Problems
              <Badge variant="secondary">{contest.problems.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="attempted-only" className="text-sm text-white/70">
                Show attempted only
              </Label>
              <Switch id="attempted-only" checked={showAttemptedOnly} onCheckedChange={setShowAttemptedOnly} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(showAttemptedOnly
              ? contest.problems.filter((p) => {
                  const st = contest.my_submissions?.[p.id]
                  return st === "solved" || st === "failed"
                })
              : contest.problems
            ).map((p) => {
              const status = contest.my_submissions?.[p.id]
              const isSolved = status === "solved"
              const isFailed = status === "failed"
              return (
                <a
                  key={p.id}
                  href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`}
                  className="block"
                >
                  <div
                    className={`flex items-center justify-between rounded-md p-3 transition-colors ${
                      isSolved
                        ? "bg-green-600/20 border border-green-600/40"
                        : isFailed
                          ? "bg-red-600/20 border border-red-600/40"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden
                        className={`w-2 h-2 rounded-full ${
                          isSolved ? "bg-green-500" : isFailed ? "bg-red-500" : "bg-white/30"
                        }`}
                      />
                      <div>
                        <div className="font-medium">
                          {p.index}. {p.name}
                        </div>
                        <div className="text-xs text-white/60">
                          CF {p.contestId}/{p.index} • {p.rating ? `Rating ${p.rating}` : "Unrated"}
                        </div>
                      </div>
                    </div>
                    <div>
                      {isSolved ? (
                        <Badge className="bg-green-600 hover:bg-green-600 text-black">Solved</Badge>
                      ) : isFailed ? (
                        <Badge className="bg-red-600 hover:bg-red-600">Failed</Badge>
                      ) : (
                        <Badge variant="outline">Unattempted</Badge>
                      )}
                    </div>
                  </div>
                </a>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard {!hasStarted && "(Preview)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-white/60">No submissions yet. Be the first to participate!</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry) => (
                <div
                  key={entry.user_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1
                          ? "bg-yellow-500 text-black"
                          : entry.rank === 2
                            ? "bg-gray-400 text-black"
                            : entry.rank === 3
                              ? "bg-orange-600 text-white"
                              : "bg-white/10"
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <div>
                      <div className="font-medium">User {entry.user_id.slice(0, 8)}</div>
                      <div className="text-sm text-white/60">
                        {entry.solved} solved • {Math.floor(entry.penalty / 60)}m penalty
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{entry.solved}</div>
                    <div className="text-xs text-white/60">problems</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
