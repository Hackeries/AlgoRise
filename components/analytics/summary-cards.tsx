"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Summary = {
  currentStreak?: number
  longestStreak?: number
  problemsSolved?: number
  avgTimeMins?: number
  ratingChange?: number
} | null

export function SummaryCards({ summary }: { summary: Summary }) {
  const s = summary || {}
  const items = [
    { label: "Current streak", value: s.currentStreak ?? 0 },
    { label: "Longest streak", value: s.longestStreak ?? 0 },
    { label: "Problems solved", value: s.problemsSolved ?? 0 },
    {
      label: "Rating change",
      value: (s.ratingChange ?? 0) >= 0 ? `+${s.ratingChange ?? 0}` : `${s.ratingChange ?? 0}`,
    },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{it.label}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{it.value}</CardContent>
        </Card>
      ))}
    </div>
  )
}
