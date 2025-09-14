"use client"

import useSWR, { mutate } from "swr"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeUpdates } from "@/lib/hooks/use-real-time"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ContestDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { toast } = useToast()

  const { data, isLoading } = useSWR<{
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

  const lb = data?.leaderboard ?? []
  const [problemId, setProblemId] = useState("")
  const [penalty, setPenalty] = useState("0")
  const [busy, setBusy] = useState(false)

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-pretty">Contest</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Join, submit problem results, and view the live leaderboard. Host can end the contest to compute rating deltas.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Join and submit solutions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center gap-2">
              <Button onClick={join} disabled={busy}>
                Join
              </Button>
              <Button variant="destructive" onClick={endContest} disabled={busy}>
                End (host only)
              </Button>
            </div>
            <div className="grid gap-2">
              <Input
                placeholder="Problem ID (e.g., CF-123A)"
                value={problemId}
                onChange={(e) => setProblemId(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Input placeholder="Penalty seconds" value={penalty} onChange={(e) => setPenalty(e.target.value)} />
                <Button onClick={() => submit("solved")} disabled={busy || !problemId.trim()}>
                  Solved
                </Button>
                <Button variant="secondary" onClick={() => submit("failed")} disabled={busy || !problemId.trim()}>
                  Failed
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
