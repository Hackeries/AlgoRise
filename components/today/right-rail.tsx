"use client"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { RatingSparkline } from "./rating-sparkline"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function RightRailToday() {
  // Streaks from server (Supabase)
  const { data: streakData } = useSWR<{ currentStreak: number; longestStreak: number; lastActiveDay: string | null }>(
    "/api/streaks",
    fetcher,
  )
  const currentStreak = streakData?.currentStreak ?? 0
  const longestStreak = streakData?.longestStreak ?? 0
  const lastActive = streakData?.lastActiveDay ? new Date(streakData.lastActiveDay) : null

  // rating delta preview (placeholder logic)
  const ratingDeltaPreview = useMemo(() => {
    if (currentStreak === 0) return "+0"
    if (currentStreak < 3) return "+4"
    if (currentStreak < 7) return "+8"
    return "+12"
  }, [currentStreak])

  // next contest countdown (placeholder)
  const [countdown, setCountdown] = useState("—")
  useEffect(() => {
    const target = new Date()
    target.setHours(target.getHours() + 36)
    const id = setInterval(() => {
      const diff = Math.max(0, target.getTime() - Date.now())
      const hrs = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      setCountdown(`${hrs}h ${mins}m`)
    }, 1000 * 30)
    return () => clearInterval(id)
  }, [])

  // Recovery visibility from profile API
  const { data: profile } = useSWR<{ ratingDelta: number; lastContestAt?: string; nextContestAt?: string }>(
    "/api/profile",
    fetcher,
  )
  const showRecovery = (profile?.ratingDelta ?? 0) < -150

  const recoveryTags = ["graphs", "dp"]
  const recoveryHref = `/adaptive-sheet?mode=recovery&tags=${encodeURIComponent(recoveryTags.join(","))}`

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-lg border border-gray-800 bg-neutral-950 p-4">
        <h4 className="text-sm font-semibold text-white">Streak</h4>
        <p className="mt-1 text-2xl font-bold text-white">{currentStreak}</p>
        <p className="mt-1 text-sm text-gray-300">Days active</p>
        <div className="mt-3 text-xs text-gray-400">
          <div>Longest streak: {longestStreak} days</div>
          <div>Last active: {lastActive ? lastActive.toLocaleDateString() : "—"}</div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-800 bg-neutral-950 p-4">
        <h4 className="text-sm font-semibold text-white">Rating delta (preview)</h4>
        <p className="mt-1 text-2xl font-bold text-green-400">{ratingDeltaPreview}</p>
        <p className="mt-1 text-sm text-gray-300">From recent practice</p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-neutral-950 p-4">
        <h4 className="text-sm font-semibold text-white">Next contest</h4>
        <p className="mt-1 text-2xl font-bold text-white">{countdown}</p>
        <p className="mt-1 text-sm text-gray-300">Private training contest</p>
      </div>

      {showRecovery ? (
        <div className="rounded-lg border border-amber-700/40 bg-amber-500/10 p-4">
          <h4 className="text-sm font-semibold text-amber-400">Recovery mode</h4>
          <p className="mt-1 text-sm text-amber-200">Bounce back with a confidence set (−300 to −150).</p>
          <p className="mt-1 text-xs text-amber-200/90">Recommended focus: Graphs, DP</p>
          <div className="mt-3">
            <RatingSparkline />
          </div>
          <a
            href={recoveryHref}
            className="mt-3 inline-block rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-400"
          >
            Start recovery
          </a>
        </div>
      ) : null}
    </aside>
  )
}
