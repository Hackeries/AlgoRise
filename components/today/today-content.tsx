"use client"

import useSWR from "swr"
import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeUpdates, useCrossTabSync } from "@/lib/hooks/use-real-time"

type TodayProblem = {
  id: string
  title: string
  url: string
  rating: number
  tags: string[]
  next_due_at?: string
}

type AdaptiveResponse = {
  items: TodayProblem[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function isDueToday(iso?: string) {
  if (!iso) return false
  const due = new Date(iso)
  const now = new Date()
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  return due <= endOfDay
}

function formatRelative(iso?: string) {
  if (!iso) return "due"
  const due = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, due - now)
  const mins = Math.round(diff / 60000)
  if (mins <= 0) return "due now"
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  return `${hrs}h`
}

export function TodayContent() {
  const { data, isLoading, mutate } = useSWR<AdaptiveResponse>("/api/adaptive-sheet", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000, // Poll every minute for due time updates
  })

  useRealtimeUpdates("/api/adaptive-sheet", {
    refreshInterval: 60000, // Update every minute to refresh due times
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  const [streak, setStreak] = useState<number>(0)
  const { toast } = useToast()

  useCrossTabSync("rg_streak_updated", () => {
    const s = Number(localStorage.getItem("rg_streak") || "0")
    setStreak(isNaN(s) ? 0 : s)
  })

  useEffect(() => {
    // Calculate local streak for display
    const s = Number(localStorage.getItem("rg_streak") || "0")
    setStreak(isNaN(s) ? 0 : s)
  }, [])

  const todaySlice = useMemo(() => {
    const all = data?.items || []
    const dueToday = all.filter((it) => isDueToday(it.next_due_at))
    dueToday.sort((a, b) => {
      const da = a.next_due_at ? new Date(a.next_due_at).getTime() : 0
      const db = b.next_due_at ? new Date(b.next_due_at).getTime() : 0
      return da - db
    })
    return dueToday.slice(0, 3)
  }, [data])

  async function action(endpoint: "solve" | "skip" | "fail" | "snooze", id: string) {
    try {
      // optimistic remove
      await mutate(
        (prev) => {
          if (!prev) return prev
          return { ...prev, items: prev.items.filter((p) => p.id !== id) }
        },
        { revalidate: false },
      )
      await fetch(`/api/adaptive-sheet/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: id }),
      })
      await mutate()
      if (endpoint === "solve") {
        try {
          const res = await fetch("/api/streaks", { method: "POST", headers: { "Content-Type": "application/json" } })
          const payload = await res.json().catch(() => null)
          const next = typeof payload?.currentStreak === "number" ? payload.currentStreak : streak + 1
          setStreak(next)
          localStorage.setItem("rg_streak", String(next))
          localStorage.setItem("rg_streak_updated", Date.now().toString())
          toast({
            title: "Marked as solved — great job!",
            description: `Streak is now ${next} day${next === 1 ? "" : "s"}.`,
          })
          if (payload?.newLongest === true) {
            toast({
              title: "🏆 New longest streak!",
              description: `${next} days — keep the momentum!`,
            })
          }
        } catch {
          const next = streak + 1
          setStreak(next)
          localStorage.setItem("rg_streak", String(next))
          localStorage.setItem("rg_streak_updated", Date.now().toString())
          toast({
            title: "Marked as solved — great job!",
            description: `Streak is now ${next} day${next === 1 ? "" : "s"}.`,
          })
        }
      } else if (endpoint === "skip") {
        toast({
          title: "Skipped",
          description: "We'll resurface this later.",
        })
      } else if (endpoint === "fail") {
        toast({
          title: "Marked as failed",
          description: "Recovery mode will adapt your next set.",
        })
      } else if (endpoint === "snooze") {
        toast({
          title: "Snoozed",
          description: "We'll remind you again soon.",
        })
      }
    } catch (e) {
      await mutate() // rollback by refetch
      toast({
        title: "Something went wrong",
        description: "Please try that action again.",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Streak-aware banner */}
      <div className="rounded-lg border border-gray-800 bg-neutral-900/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-300">
              {streak > 0 ? `You're on a ${streak}-day streak.` : "Start your streak today."}
            </p>
            <h2 className="text-pretty text-lg font-semibold text-white">Keep your streak alive</h2>
          </div>
          <span className="rounded-full bg-blue-600/15 px-3 py-1 text-xs font-medium text-blue-400">Solve now</span>
        </div>
      </div>

      {/* Today problems */}
      <section aria-labelledby="today-heading" className="flex flex-col gap-4">
        <h3 id="today-heading" className="text-sm font-medium text-gray-200">
          Today’s picks
          <span className="ml-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
            {isLoading ? "…" : todaySlice.length}
          </span>
        </h3>

        {isLoading ? (
          <div className="text-sm text-gray-300">Loading your tasks…</div>
        ) : todaySlice.length === 0 ? (
          <div className="rounded-md border border-gray-800 bg-neutral-900/50 p-4 text-sm text-gray-300">
            You’re all caught up for today. Come back tomorrow or explore your Adaptive Sheet.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {todaySlice.map((p) => (
              <li key={p.id} className="rounded-lg border border-gray-800 bg-neutral-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-pretty text-base font-semibold text-white hover:text-blue-400"
                    >
                      {p.title}
                    </a>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                      <span className="rounded-full bg-gray-800 px-2 py-0.5">Rating {p.rating}</span>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-400">
                        due {formatRelative(p.next_due_at)}
                      </span>
                      {p.tags?.slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full bg-gray-800 px-2 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => action("solve", p.id)}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                    >
                      Solve
                    </button>
                    <button
                      onClick={() => action("skip", p.id)}
                      className="rounded-md border border-gray-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-neutral-800"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => action("fail", p.id)}
                      className="rounded-md border border-gray-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-neutral-800"
                    >
                      Mark Failed
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
