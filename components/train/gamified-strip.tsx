"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"

type ProgressResp = {
  streak?: number
  solvedThisWeek?: number
  totalSolved?: number
  daily?: { date: string; solved: number }[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function GamifiedStrip() {
  const { data } = useSWR<ProgressResp>("/api/cf/progress", fetcher, { revalidateOnFocus: false })

  const streak =
    data?.streak ??
    (Array.isArray(data?.daily)
      ? (() => {
          // naive streak: count trailing days with solved > 0
          const arr = [...data!.daily!]
          let count = 0
          for (let i = arr.length - 1; i >= 0; i--) {
            if ((arr[i].solved ?? 0) > 0) count++
            else break
          }
          return count
        })()
      : 0)

  const solvedThisWeek =
    data?.solvedThisWeek ??
    (Array.isArray(data?.daily) ? data!.daily!.slice(-7).reduce((a, d) => a + (d.solved || 0), 0) : 0)
  const totalSolved = data?.totalSolved ?? 0
  const xp = solvedThisWeek * 10

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className="rounded-lg border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60">Current Streak</div>
        <div className="mt-1 text-2xl font-semibold text-white">
          {streak} day{streak === 1 ? "" : "s"}
        </div>
        <div className="mt-1 text-sm text-white/70">+1 streak/day with any AC.</div>
      </Card>
      <Card className="rounded-lg border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60">XP (this week)</div>
        <div className="mt-1 text-2xl font-semibold text-white">{xp}</div>
        <div className="mt-1 text-sm text-white/70">10 XP per AC. Weekly reset Monday.</div>
      </Card>
      <Card className="rounded-lg border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60">Total Solved</div>
        <div className="mt-1 text-2xl font-semibold text-white">{totalSolved}</div>
        <div className="mt-1 text-sm text-white/70">Lifetime problems across your journey.</div>
      </Card>
    </div>
  )
}
