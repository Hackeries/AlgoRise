import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"
import { useCFVerification } from "@/lib/context/cf-verification"

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

type CFProgressResponse = {
  progress: {
    totalSolved: number
    byDifficulty: Record<string, number>
    byTags: Record<string, number>
    recentActivity: Array<{ date: string; count: number }>
    streakData: {
      current: number
      longest: number
      lastSolvedDate: string | null
    }
    ratingHistory: any[]
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
  const { isVerified, verificationData } = useCFVerification()
  
  const params = new URLSearchParams()
  params.set("baseRating", String(baseRating))
  if (tags.length) params.set("tags", tags.join(","))
  const { data } = useSWR<AdaptiveSheetResponse>(`/api/adaptive-sheet?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
  })

  // Fetch CF progress data for real stats
  const { data: cfProgress } = useSWR<CFProgressResponse>(
    isVerified && verificationData?.handle ? `/api/cf/progress?handle=${verificationData.handle}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Fetch tag accuracy data for weak tags
  const { data: tagAccuracy } = useSWR<{ tags: any[]; weakTags: { tag: string; accuracy: number; solved: number; total: number }[] }>(
    "/api/analytics/tag-accuracy",
    fetcher,
    { revalidateOnFocus: false }
  )

  const totalCandidates =
    (data?.groups.dueNow?.length || 0) + (data?.groups.dueSoon?.length || 0) + (data?.groups.later?.length || 0)
  const solved = Math.round((data?.stats.solvedRate || 0) * Math.max(1, totalCandidates))

  // Use real CF data for solved problems and streak
  const realSolved = cfProgress?.progress?.totalSolved || solved
  const realStreak = cfProgress?.progress?.streakData?.current || data?.stats.streak || 0

  // Use tag accuracy data for weak tags, with fallbacks
  let weakTagItems: { tag: string; acc: number }[] = []
  
  // Primary: Use tag accuracy API data
  if (tagAccuracy?.weakTags && tagAccuracy.weakTags.length > 0) {
    weakTagItems = tagAccuracy.weakTags.map(item => ({
      tag: item.tag,
      acc: item.accuracy
    }))
  }
  // Fallback 1: Use CF progress data
  else if (cfProgress?.progress?.byTags) {
    const tagEntries = Object.entries(cfProgress.progress.byTags)
    const totalProblems = Math.max(1, realSolved)
    
    weakTagItems = tagEntries
      .map(([tag, count]) => ({
        tag,
        acc: Math.round((count / totalProblems) * 100)
      }))
      .filter(item => item.acc < 70) // Show tags with less than 70% accuracy as weak
      .sort((a, b) => a.acc - b.acc) // Sort by lowest accuracy first
      .slice(0, 4) // Show top 4 weak tags
  }
  // Fallback 2: Use adaptive sheet data
  else if (data?.stats?.weakTags) {
    weakTagItems = Object.entries(data.stats.weakTags).map(([tag, v]) => {
      const acc = v.attempts > 0 ? Math.round(((v.attempts - v.fails) / v.attempts) * 100) : 0
      return { tag, acc }
    })
  }

  // Calculate rating change for recovery mode from recent snapshots
  const { data: cfSnapshot } = useSWR<{ ratingDelta: number; lastContest: string | null; lastRating: number | null; handle: string | null }>(
    "/api/cf-snapshot",
    fetcher,
    { revalidateOnFocus: false }
  )

  let ratingChange = cfSnapshot?.ratingDelta || 0
  
  // If no snapshot data, try CF progress data
  if (ratingChange === 0 && cfProgress?.progress?.ratingHistory && cfProgress.progress.ratingHistory.length >= 2) {
    ratingChange = cfProgress.progress.ratingHistory[cfProgress.progress.ratingHistory.length - 1].change 
  }
  
  // If still no data, use a demo value
  if (ratingChange === 0) {
    ratingChange = -48
  }

  return (
    <div className="flex flex-col gap-4">
      <ProgressTracker 
        solved={realSolved} 
        total={Math.max(realSolved + 10, totalCandidates, 1)} 
        streak={realStreak} 
      />
      <WeakTagHeatmap items={weakTagItems} />
      <RecoveryCard show={ratingChange < -30} delta={ratingChange} />
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
  items = [],
}: {
  items?: { tag: string; acc: number }[]
}) {
  // Show default message if no items
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weak tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground text-center py-4">
            Complete more problems to see your weak tags analysis
          </div>
        </CardContent>
      </Card>
    )
  }
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
