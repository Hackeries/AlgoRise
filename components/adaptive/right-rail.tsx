import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"

type AdaptiveSheetResponse = {
  baseRating: number
  groups: {
    dueNow: any[]
    dueSoon: any[]
    later: any[]
  }
  stats: {
    solvedRate: number
    streak: number
    lastInteractionAt?: string
    weakTags: Record<string, { attempts: number; fails: number }>
  }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function AdaptiveRightRailData({
  baseRating = 1500,
  tags = [],
}: {
  baseRating?: number
  tags?: string[]
}) {
  const params = new URLSearchParams()
  params.set("baseRating", String(baseRating))
  if (tags.length) params.set("tags", tags.join(","))
  const { data } = useSWR<AdaptiveSheetResponse>(`/api/adaptive-sheet?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
  })

  const totalCandidates =
    (data?.groups.dueNow?.length || 0) + (data?.groups.dueSoon?.length || 0) + (data?.groups.later?.length || 0)
  const solved = Math.round((data?.stats.solvedRate || 0) * Math.max(1, totalCandidates))
  const items = data?.stats?.weakTags
    ? Object.entries(data.stats.weakTags).map(([tag, v]) => {
        const acc = v.attempts > 0 ? Math.round(((v.attempts - v.fails) / v.attempts) * 100) : 0
        return { tag, acc }
      })
    : []

  return (
    <div className="flex flex-col gap-4">
      <ProgressTracker solved={solved} total={Math.max(1, totalCandidates)} streak={data?.stats.streak || 0} />
      <WeakTagHeatmap items={items} />
      <RecoveryCard show={true} delta={-48} />
    </div>
  )
}

export function ProgressTracker({
  solved = 12,
  total = 40,
  streak = 5,
}: {
  solved?: number
  total?: number
  streak?: number
}) {
  const pct = Math.round((solved / Math.max(total, 1)) * 100)
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {solved}/{total} solved ({pct}%)
        </div>
        <div className="h-2 w-full rounded bg-muted">
          <div className="h-2 rounded bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-sm">
          Streak: <span className="font-medium">{streak} days</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function WeakTagHeatmap({
  items = [
    { tag: "graphs", acc: 42 },
    { tag: "dp", acc: 38 },
    { tag: "math", acc: 55 },
    { tag: "greedy", acc: 61 },
  ],
}: {
  items?: { tag: string; acc: number }[]
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weak tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((it) => (
          <div key={it.tag} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{it.tag}</Badge>
            </div>
            <div className="flex-1">
              <div className="h-2 w-full rounded bg-muted">
                <div className="h-2 rounded bg-amber-500" style={{ width: `${Math.max(5, Math.min(it.acc, 100))}%` }} />
              </div>
            </div>
            <div className="w-10 text-right text-sm text-muted-foreground">{it.acc}%</div>
          </div>
        ))}
        <div className="text-xs text-muted-foreground">Lower % indicates a weaker tag.</div>
      </CardContent>
    </Card>
  )
}

export function RecoveryCard({
  show = true,
  delta = -48,
}: {
  show?: boolean
  delta?: number
}) {
  if (!show) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recovery mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          Recent rating change: <span className="text-red-400">{delta}</span>
        </p>
        <p>We recommend a confidence-boost set at −300 to −150 with favorite tags.</p>
        <p className="text-muted-foreground">This will be auto-generated after contests or dips.</p>
      </CardContent>
    </Card>
  )
}
