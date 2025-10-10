"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type CFUserRatingResp = {
  status: "OK" | "FAILED"
  result?: {
    contestId: number
    contestName: string
    handle: string
    rank: number
    ratingUpdateTimeSeconds: number
    oldRating: number
    newRating: number
  }[]
  comment?: string
}

function useCFUserRating(handle: string | null) {
  const shouldFetch = !!handle && handle.trim().length > 0
  const { data } = useSWR<CFUserRatingResp>(
    shouldFetch ? `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle!)}` : null,
    fetcher,
  )
  const points =
    data?.status === "OK"
      ? (data.result ?? []).map((r) => ({
          date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().slice(0, 10),
          rating: r.newRating,
        }))
      : []
  return { points }
}

export default function CompareHandles({
  defaultA = "",
  defaultB = "tourist",
}: { defaultA?: string; defaultB?: string }) {
  const [handleA, setHandleA] = useState(defaultA)
  const [handleB, setHandleB] = useState(defaultB)
  const [active, setActive] = useState(false)

  const { points: pointsA } = useCFUserRating(active ? handleA : null)
  const { points: pointsB } = useCFUserRating(active ? handleB : null)

  const merged = useMemo(() => {
    const byDate = new Map<string, { date: string; A?: number; B?: number }>()
    pointsA.forEach((p) => byDate.set(p.date, { date: p.date, A: p.rating, B: byDate.get(p.date)?.B }))
    pointsB.forEach((p) => byDate.set(p.date, { date: p.date, A: byDate.get(p.date)?.A, B: p.rating }))
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [pointsA, pointsB])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-balance">Compare Codeforces Rating</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input placeholder="Handle A (optional)" value={handleA} onChange={(e) => setHandleA(e.target.value)} />
          <Input placeholder="Handle B" value={handleB} onChange={(e) => setHandleB(e.target.value)} />
          <Button onClick={() => setActive(true)} className="w-full">
            Compare
          </Button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={merged}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="A"
                name={handleA || "A"}
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="B"
                name={handleB || "B"}
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export { CompareHandles }
