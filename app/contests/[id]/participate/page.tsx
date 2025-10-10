"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Clock, ExternalLink, Trophy, CheckCircle, XCircle, AlertCircle, Maximize2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Problem {
  id: string
  contestId: number
  index: string
  name: string
  rating: number
}

interface Contest {
  id: string
  name: string
  description: string
  start_time: string
  duration_minutes: number
  problems: Problem[]
  status: "upcoming" | "live" | "ended"
  timeRemaining: number
  max_participants?: number
  shareUrl: string
}

interface Submission {
  problemId: string
  status: "AC" | "WA" | "TLE" | "RE" | "CE" | "PE" | "MLE"
  timestamp: string
  penalty: number
}

export default function ContestParticipationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [submissionStatus, setSubmissionStatus] = useState<string>("")
  const [contestEnded, setContestEnded] = useState(false)

  const { data, error, mutate } = useSWR<{ contest: Contest }>(
    params.id ? `/api/contests/${params.id}` : null,
    fetcher,
    { refreshInterval: 30000 },
  )

  const contest = data?.contest

  // Enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.log("Fullscreen not supported or denied")
      }
    }

    enterFullscreen()

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (!contest || contest.status !== "live") return

    const interval = setInterval(() => {
      mutate() // Refresh contest data to get updated time
    }, 1000)

    return () => clearInterval(interval)
  }, [contest, mutate])

  // Auto-end contest when time is up
  useEffect(() => {
    if (contest && contest.status === "live" && contest.timeRemaining <= 0) {
      setContestEnded(true)
    }
  }, [contest])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSubmission = async (status: string) => {
    if (!selectedProblem) return

    const submission: Submission = {
      problemId: selectedProblem.id,
      status: status as any,
      timestamp: new Date().toISOString(),
      penalty: status === "AC" ? 0 : 1200, // 20 minutes penalty for wrong submission
    }

    // Add to local submissions
    setSubmissions((prev) => [...prev, submission])

    try {
      // Submit to backend
      await fetch(`/api/contests/${params.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          status: status === "AC" ? "solved" : "failed",
          penalty: submission.penalty,
        }),
      })

      toast({
        title: status === "AC" ? "Accepted!" : "Wrong Answer",
        description: `Submission for ${selectedProblem.index}: ${selectedProblem.name}`,
        variant: status === "AC" ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit solution",
        variant: "destructive",
      })
    }

    setSelectedProblem(null)
  }

  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen()
    } catch (err) {
      console.log("Exit fullscreen failed")
    }
  }

  const getSubmissionStats = () => {
    const solved = submissions.filter((s) => s.status === "AC").length
    const total = contest?.problems.length || 0
    const totalPenalty = submissions.filter((s) => s.status === "AC").reduce((acc, s) => acc + s.penalty, 0)

    return { solved, total, penalty: totalPenalty }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800">Contest Not Found</h1>
          <Button onClick={() => router.push("/contests")} className="mt-4">
            Back to Contests
          </Button>
        </div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading contest...</div>
      </div>
    )
  }

  if (contest.status === "ended") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white px-6">
        <div className="text-center max-w-md">
          <Trophy className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Contest Ended</h1>
          <p className="text-white/70 mb-6">
            This contest has finished. You can go back to the contests list or view the leaderboard and details.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/contests")} className="flex-1 sm:flex-none">
              Back to Contests
            </Button>
            <Button
              onClick={() => router.push(`/contests/${contest.id}`)}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (contest.status === "upcoming") {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-blue-800">Contest Starting Soon</h1>
          <p className="text-blue-600 mt-2">Starts at: {new Date(contest.start_time).toLocaleString()}</p>
          <Button onClick={() => router.push("/contests")} className="mt-4">
            Back to Contests
          </Button>
        </div>
      </div>
    )
  }

  const stats = getSubmissionStats()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{contest.name}</h1>
            <Badge variant={contest.status === "live" ? "default" : "secondary"}>{contest.status.toUpperCase()}</Badge>
          </div>

          <div className="flex items-center gap-4">
            {contest.status === "live" && (
              <div className="flex items-center gap-2 text-green-400">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatTime(contest.timeRemaining)}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>
                {stats.solved}/{stats.total} solved
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exitFullscreen}
              className="text-white border-gray-600 hover:bg-gray-700 bg-transparent"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Problems List */}
        <div className="w-1/2 border-r border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Problems</h2>

          {!contest.problems || contest.problems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full text-gray-400">
              <AlertCircle className="h-8 w-8 mb-2 text-gray-500" />
              <p className="mb-2">No problems are available yet.</p>
              <p className="text-sm text-gray-500 mb-4">
                The host may not have added problems or the contest hasn&apos;t fully started. Please check back soon.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.refresh()}>
                  Refresh
                </Button>
                <Button variant="ghost" onClick={() => router.push("/contests")}>
                  Back to Contests
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {contest.problems.map((problem, index) => {
                const problemSubmissions = submissions.filter((s) => s.problemId === problem.id)
                const solved = problemSubmissions.some((s) => s.status === "AC")
                const attempted = problemSubmissions.length > 0

                return (
                  <Card
                    key={problem.id}
                    className={`bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors ${
                      solved ? "border-green-500" : attempted ? "border-yellow-500" : ""
                    }`}
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              solved ? "bg-green-600" : attempted ? "bg-yellow-600" : "bg-gray-600"
                            }`}
                          >
                            {problem.index}
                          </div>
                          <div>
                            <div className="font-medium">{problem.name}</div>
                            {/* <div className='text-sm text-gray-400'>
                              Rating: {problem.rating}
                            </div> */}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {solved && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {attempted && !solved && <XCircle className="h-5 w-5 text-yellow-500" />}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(
                                `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
                                "_blank",
                              )
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Submissions Panel */}
        <div className="w-1/2 p-6">
          <h2 className="text-lg font-semibold mb-4">Submissions</h2>
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {submissions.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No submissions yet. Click on a problem to start!</div>
            ) : (
              submissions
                .slice()
                .reverse()
                .map((submission, index) => {
                  const problem = contest.problems.find((p) => p.id === submission.problemId)
                  return (
                    <Card key={index} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={submission.status === "AC" ? "default" : "destructive"}>
                              {submission.status}
                            </Badge>
                            <span>
                              {problem?.index}. {problem?.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(submission.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </div>
        </div>
      </div>

      {/* Submission Dialog */}
      <Dialog open={!!selectedProblem} onOpenChange={() => setSelectedProblem(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Submit Solution for {selectedProblem?.index}. {selectedProblem?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-300">Have you solved this problem? Select the result of your submission:</p>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleSubmission("AC")} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Accepted (AC)
              </Button>
              <Button onClick={() => handleSubmission("WA")} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Wrong Answer (WA)
              </Button>
              <Button onClick={() => handleSubmission("TLE")} variant="destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                Time Limit Exceeded (TLE)
              </Button>
              <Button onClick={() => handleSubmission("RE")} variant="destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                Runtime Error (RE)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
