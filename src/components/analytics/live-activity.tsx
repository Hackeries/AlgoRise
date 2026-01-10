"use client"

import useSWR from "swr"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type CFRecentStatus = {
  status: "OK" | "FAILED"
  result?: { id: number; contestId: number; creationTimeSeconds: number; verdict?: string }[]
}

function bucketCounts(subs: { creationTimeSeconds: number }[], minutes = 10) {
  const now = Math.floor(Date.now() / 1000)
  const bins = Array.from({ length: minutes }).map((_, i) => {
    const start = now - (minutes - i) * 60
    const label = new Date(start * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return { label, count: 0 }
  })
  subs.forEach((s) => {
    const delta = now - s.creationTimeSeconds
    if (delta >= 0 && delta < minutes * 60) {
      const idx = minutes - 1 - Math.floor(delta / 60)
      if (idx >= 0 && idx < bins.length) bins[idx].count++
    }
  })
  return bins
}

export default function LiveActivity({ defaultHandle }: { defaultHandle?: string }) {
  const { data } = useSWR<CFRecentStatus>("https://codeforces.com/api/problemset.recentStatus?count=100", fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: false,
  })
  const subs = data?.status === "OK" ? (data.result ?? []) : []
  const chartData = bucketCounts(subs, 10)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-balance">Live CF Activity (last 10m)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f59e0b"
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

export { LiveActivity }
