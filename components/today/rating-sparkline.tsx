"use client"

import useSWR from "swr"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type Point = { rating: number; at: string }
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function RatingSparkline() {
  const { data, error, isLoading } = useSWR("/api/cf-snapshot/history", fetcher, { revalidateOnFocus: false })

  if (isLoading) return <div className="text-xs text-muted-foreground">Loading rating…</div>
  if (error || !data?.ok) return <div className="text-xs text-muted-foreground">No rating data</div>

  const points: Point[] = data.data ?? []
  if (!points.length) return <div className="text-xs text-muted-foreground">No contests yet</div>

  return (
    <div className="w-full h-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points}>
          <defs>
            <linearGradient id="rgSpark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="at" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }}
            labelFormatter={(v) => new Date(v).toLocaleDateString()}
            formatter={(value) => [`${value}`, "Rating"]}
          />
          <Area type="monotone" dataKey="rating" stroke="#2563EB" fill="url(#rgSpark)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
