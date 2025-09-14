"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { AdaptiveFilterBar, type FilterState } from "./filter-bar"
import { AdaptiveProblemCard } from "./problem-card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { tagToSlug } from "@/lib/visualizers"
import { useRealtimeUpdates } from "@/lib/hooks/use-real-time"

type Outcome = "solved" | "failed" | "skipped"

type Problem = {
  id: string
  title: string
  url?: string
  rating: number
  tags: string[]
}

type SheetItem = {
  id: string
  problem: Problem
  repetitions: number
  ease: number
  intervalDays: number
  nextDueAt: string // ISO
  lastOutcome?: Outcome
}

type AdaptiveSheetResponse = {
  baseRating: number
  groups: {
    dueNow: SheetItem[]
    dueSoon: SheetItem[]
    later: SheetItem[]
  }
  stats: {
    solvedRate: number
    streak: number
    lastInteractionAt?: string
    weakTags: Record<string, { attempts: number; fails: number }>
  }
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('JSON parse error. Response was:', text.substring(0, 200))
    throw new Error('Invalid JSON response')
  }
}

function fmtDue(dueIso: string) {
  const due = new Date(dueIso).getTime()
  const now = Date.now()
  const diff = due - now
  if (diff <= 0) return "Due now"
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `Due in ${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `Due in ${hrs}h`
  const days = Math.round(hrs / 24)
  return `Due in ${days}d`
}

export function AdaptiveSheetContent({
  controlledFilters,
  onFiltersChange,
  snoozeMinutes = 60,
  srMode = "standard",
  cfHandle,
}: {
  controlledFilters?: FilterState
  onFiltersChange?: (s: FilterState) => void
  snoozeMinutes?: number
  srMode?: "standard" | "aggressive"
  cfHandle?: string
}) {
  const [uncontrolled, setUncontrolled] = useState<FilterState>({ ratingBase: 1500, tags: [] })
  const filters = controlledFilters ?? uncontrolled
  const setFilters = onFiltersChange ?? setUncontrolled

  const { toast } = useToast()
  const router = useRouter()

  const LIMITS = { now: 8, soon: 8, later: 8 }

  const query = useMemo(() => {
    const params = new URLSearchParams()
    params.set("baseRating", String(filters.ratingBase))
    if (filters.tags.length) params.set("tags", filters.tags.join(","))
    if (cfHandle) params.set("handle", cfHandle)
    params.set("limitNow", String(LIMITS.now))
    params.set("limitSoon", String(LIMITS.soon))
    params.set("limitLater", String(LIMITS.later))
    return `/api/adaptive-sheet?${params.toString()}`
  }, [filters, cfHandle])

  const { data, isLoading, error, mutate } = useSWR<AdaptiveSheetResponse>(query, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000, // Update every 30 seconds to refresh due times
  })

  useRealtimeUpdates(query, {
    refreshInterval: 30000, // Update every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  function optimisticRemove(current: AdaptiveSheetResponse | undefined, id: string): AdaptiveSheetResponse | undefined {
    if (!current) return current
    const rm = (arr: SheetItem[]) => arr.filter((i) => i.id !== id)
    return {
      ...current,
      groups: {
        dueNow: rm(current.groups.dueNow),
        dueSoon: rm(current.groups.dueSoon),
        later: rm(current.groups.later),
      },
    }
  }

  async function postAction(path: string, body: any, itemId?: string) {
    try {
      await mutate(
        async (current) => {
          await fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
          const refreshed = await fetch(query).then((r) => r.json())
          return refreshed
        },
        {
          optimisticData: itemId ? optimisticRemove(data, itemId) : data,
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        },
      )
    } catch (e) {
      toast({
        title: "Action failed",
        description: "Please try again.",
      })
      throw e
    }
  }

  function handleSolve(item: SheetItem) {
    postAction(
      "/api/adaptive-sheet/solve",
      { problemId: item.id, baseRating: filters.ratingBase, tags: filters.tags },
      item.id,
    ).then(async () => {
      // base toast about next due
      toast({
        title: "Marked as solved — great job!",
        description: `Next review: ${fmtDue(item.nextDueAt)}`,
      })
      // streak update + milestone celebration
      try {
        const res = await fetch("/api/streaks", { method: "POST", headers: { "Content-Type": "application/json" } })
        const payload = await res.json().catch(() => null)
        if (payload?.newLongest === true && typeof payload?.currentStreak === "number") {
          toast({
            title: "🏆 New longest streak!",
            description: `${payload.currentStreak} days — keep the momentum!`,
          })
        }
      } catch {
        // no-op on failure
      }
    })
  }
  function handleSkip(item: SheetItem) {
    postAction("/api/adaptive-sheet/skip", { problemId: item.id }, item.id).then(() =>
      toast({
        title: "Skipped",
        description: "We’ll resurface this later.",
      }),
    )
  }
  function handleFail(item: SheetItem) {
    postAction("/api/adaptive-sheet/fail", { problemId: item.id }, item.id).then(() =>
      toast({
        title: "Marked as failed",
        description: "Recovery mode will adapt your next set.",
      }),
    )
  }
  function handleSnooze(item: SheetItem) {
    postAction("/api/adaptive-sheet/snooze", { problemId: item.id, minutes: snoozeMinutes }, item.id).then(() =>
      toast({
        title: "Snoozed",
        description: `Snoozed for ${snoozeMinutes}m.`,
      }),
    )
  }
  function handleLearn(item: SheetItem) {
    // Prefer visualizer deep-link using the first tag; fallback to visualizers index or problem URL.
    const primaryTag = item.problem.tags?.[0]
    if (primaryTag) {
      const slug = tagToSlug(primaryTag)
      router.push(`/visualizers/${slug}`)
      return
    }
    if (item.problem.url) {
      window.open(item.problem.url, "_blank", "noopener,noreferrer")
      return
    }
    router.push("/visualizers")
  }

  const sections = useMemo(() => {
    return [
      { key: "dueNow" as const, title: "Due now", items: data?.groups.dueNow ?? [] },
      { key: "dueSoon" as const, title: "Due soon", items: data?.groups.dueSoon ?? [] },
      { key: "later" as const, title: "Later", items: data?.groups.later ?? [] },
    ]
  }, [data])

  return (
    <div className="space-y-4">
      <AdaptiveFilterBar
        initialRatingBase={filters.ratingBase}
        initialTags={filters.tags}
        onChange={(s) => setFilters(s)}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading adaptive sheet…</p>
      ) : error ? (
        <p className="text-sm text-red-400">Failed to load adaptive sheet.</p>
      ) : sections.every((s) => s.items.length === 0) ? (
        <p className="text-sm text-muted-foreground">
          No problems match your filters. Try widening the window or clearing tags.
        </p>
      ) : (
        sections.map((section) =>
          section.items.length ? (
            <section key={section.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-muted-foreground">{section.title}</h2>
                <Badge variant="outline">{section.items.length}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.items.map((item) => (
                  <AdaptiveProblemCard
                    key={item.id}
                    problem={{
                      id: item.id,
                      title: item.problem.title,
                      url: item.problem.url,
                      rating: item.problem.rating,
                      tags: item.problem.tags,
                    }}
                    subtitle={fmtDue(item.nextDueAt)}
                    onSolve={() => handleSolve(item)}
                    onSkip={() => handleSkip(item)}
                    onFail={() => handleFail(item)}
                    onSnooze={() => handleSnooze(item)}
                    onLearn={() => handleLearn(item)}
                  />
                ))}
              </div>
            </section>
          ) : null,
        )
      )}
    </div>
  )
}
