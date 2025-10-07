"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useCFVerification } from "@/lib/context/cf-verification"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Submission {
  id: number
  contestId: number
  problem: {
    contestId: number
    index: string
    name: string
    rating?: number
  }
  verdict: string
  creationTimeSeconds: number
  timeConsumedMillis: number
}

export function RecentActivity() {
  const { isVerified, verificationData } = useCFVerification()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentSubmissions = async () => {
      if (!verificationData) return

      try {
        const res = await fetch(
          `https://codeforces.com/api/user.status?handle=${verificationData.handle}&from=1&count=10`,
        )
        const data = await res.json()

        if (data.status === "OK") {
          setSubmissions(data.result)
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isVerified) {
      fetchRecentSubmissions()
    }
  }, [isVerified, verificationData])

  const getVerdictIcon = (verdict: string) => {
    if (verdict === "OK") {
      return <CheckCircle2 className="h-4 w-4 text-green-400" />
    } else {
      return <XCircle className="h-4 w-4 text-red-400" />
    }
  }

  const getVerdictColor = (verdict: string) => {
    if (verdict === "OK") return "text-green-400"
    if (verdict.includes("WRONG")) return "text-red-400"
    return "text-yellow-400"
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "just now"
  }

  if (!isVerified) {
    return null
  }

  return (
    <Card className="bg-neutral-900/80 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
        <CardDescription>Your latest submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 border border-gray-800 rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : submissions.length > 0 ? (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className="p-3 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {getVerdictIcon(submission.verdict)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm truncate">{submission.problem.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>
                          {submission.problem.contestId}
                          {submission.problem.index}
                        </span>
                        {submission.problem.rating && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400">{submission.problem.rating}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className={getVerdictColor(submission.verdict)}>{submission.verdict}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(submission.creationTimeSeconds)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">No recent submissions</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
