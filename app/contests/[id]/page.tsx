"use client"

import useSWR, { mutate } from "swr"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeUpdates } from "@/lib/hooks/use-real-time"
import { Copy, Play, Users, Clock, Calendar, Trophy, ExternalLink } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ContestDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id
  const { toast } = useToast()

  // Get contest details
  const { data: contestData } = useSWR<{
    contest: {
      id: string
      name: string
      description: string
      start_time: string
      duration_minutes: number
      problems: any[]
      status: 'upcoming' | 'live' | 'ended'
      timeRemaining: number
      max_participants?: number
      shareUrl: string
    }
  }>(id ? `/api/contests/${id}` : null, fetcher, {
    refreshInterval: 30000
  })

  // Get leaderboard data
  const { data: leaderboardData, isLoading } = useSWR<{
    leaderboard: {
      rank: number
      user_id: string
      solved?: number
      score?: number
      penalty?: number
      penalty_s?: number
    }[]
  }>(id ? `/api/contests/${id}/leaderboard` : null, fetcher, {
    refreshInterval: 5000, // Update every 5 seconds during contests
  })

  useRealtimeUpdates(id ? `/api/contests/${id}/leaderboard` : null, {
    refreshInterval: 5000, // Very frequent updates for live contests
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  const contest = contestData?.contest
  const lb = leaderboardData?.leaderboard ?? []
  const [problemId, setProblemId] = useState("")
  const [penalty, setPenalty] = useState("0")
  const [busy, setBusy] = useState(false)

  const copyShareLink = async () => {
    if (!contest?.shareUrl) return
    
    try {
      await navigator.clipboard.writeText(contest.shareUrl)
      toast({ title: "Copied!", description: "Share link copied to clipboard" })
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" })
    }
  }

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  async function join() {
    setBusy(true)
    try {
      const res = await fetch(`/api/contests/${id}/join`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to join")
      toast({ title: "Joined", description: "You have joined this contest." })
      await mutate(`/api/contests/${id}/leaderboard`)
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Join failed", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  async function submit(status: "solved" | "failed") {
    setBusy(true)
    try {
      const res = await fetch(`/api/contests/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, status, penalty: Number(penalty) || 0 }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Submit failed")
      toast({ title: "Submitted", description: `Marked ${status} for ${problemId || "problem"}.` })
      setProblemId("")
      await mutate(`/api/contests/${id}/leaderboard`)
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Submit failed", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  async function endContest() {
    setBusy(true)
    try {
      const res = await fetch(`/api/contests/${id}/end`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "End failed")
      toast({ title: "Contest ended", description: "Rating simulation computed." })
      await mutate(`/api/contests/${id}/leaderboard`)
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "End failed", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  if (!contest) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center">Loading contest details...</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Contest Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{contest.name}</h1>
            <p className="text-muted-foreground mt-1">{contest.description}</p>
          </div>
          <Badge variant={contest.status === 'live' ? 'default' : contest.status === 'upcoming' ? 'secondary' : 'outline'}>
            {contest.status.toUpperCase()}
          </Badge>
        </div>

        {/* Contest Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Start Time</div>
                  <div className="text-muted-foreground">
                    {new Date(contest.start_time).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Duration</div>
                  <div className="text-muted-foreground">{contest.duration_minutes} minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Problems</div>
                  <div className="text-muted-foreground">{contest.problems?.length || 0} problems</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Participants</div>
                  <div className="text-muted-foreground">
                    {lb.length}{contest.max_participants ? `/${contest.max_participants}` : ''}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          {contest.status === 'live' && (
            <Button 
              onClick={() => router.push(`/contests/${id}/participate`)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Participate in Contest
            </Button>
          )}
          
          {contest.status === 'upcoming' && (
            <Button 
              onClick={() => router.push(`/contests/${id}/participate`)}
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Contest Preview
            </Button>
          )}

          <Button onClick={copyShareLink} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy Share Link
          </Button>
        </div>

        {/* Time Remaining */}
        {contest.status === 'live' && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                <span className="text-lg font-mono">
                  Time remaining: {formatTime(contest.timeRemaining)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Problems List */}
        <Card>
          <CardHeader>
            <CardTitle>Problems</CardTitle>
            <CardDescription>Contest problems and their details</CardDescription>
          </CardHeader>
          <CardContent>
            {contest.problems && contest.problems.length > 0 ? (
              <div className="space-y-3">
                {contest.problems.map((problem: any) => (
                  <div 
                    key={problem.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {problem.index}
                      </div>
                      <div>
                        <div className="font-medium">{problem.name}</div>
                        <div className="text-sm text-muted-foreground">Rating: {problem.rating}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No problems available</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions for Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Join and test submissions (for testing purposes)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center gap-2">
              <Button onClick={join} disabled={busy}>
                Join Contest
              </Button>
              <Button variant="destructive" onClick={endContest} disabled={busy}>
                End Contest (Host Only)
              </Button>
            </div>
            <div className="grid gap-2">
              <Input
                placeholder="Problem ID (e.g., 1234A)"
                value={problemId}
                onChange={(e) => setProblemId(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Input placeholder="Penalty seconds" value={penalty} onChange={(e) => setPenalty(e.target.value)} />
                <Button onClick={() => submit("solved")} disabled={busy || !problemId.trim()}>
                  Mark Solved
                </Button>
                <Button variant="secondary" onClick={() => submit("failed")} disabled={busy || !problemId.trim()}>
                  Mark Failed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Auto-sorted by solved desc, penalty asc</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!isLoading && lb.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
            <ul className="grid gap-2">
              {lb.map((r) => (
                <li
                  key={`${r.user_id}-${r.rank}`}
                  className="flex items-center justify-between rounded-md border border-white/10 p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">Rank #{r.rank}</div>
                    <div className="text-muted-foreground">User: {r.user_id.slice(0, 8)}…</div>
                  </div>
                  <div className="text-sm text-right">
                    <div>Score: {typeof r.score === "number" ? r.score : (r.solved ?? 0)}</div>
                    <div>Penalty: {typeof r.penalty_s === "number" ? r.penalty_s : ((r as any).penalty ?? 0)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
