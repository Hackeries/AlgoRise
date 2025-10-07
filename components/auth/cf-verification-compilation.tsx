"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ExternalLink, Copy, Trophy, Target, TrendingUp, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCFVerification } from "@/lib/context/cf-verification"

interface CFVerificationCompilationProps {
  onVerificationComplete?: (data: any) => void
  showTitle?: boolean
  compact?: boolean
}

export function CFVerificationCompilation({
  onVerificationComplete,
  showTitle = true,
  compact = false,
}: CFVerificationCompilationProps) {
  const { toast } = useToast()
  const { setVerificationData } = useCFVerification()

  const [step, setStep] = useState<"input" | "submit" | "verify" | "timeout" | "complete">("input")
  const [handle, setHandle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [codeSnippet, setCodeSnippet] = useState("")
  const [verificationId, setVerificationId] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes
  const [timerActive, setTimerActive] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerActive(false)
          setStep("timeout")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startVerification = async () => {
    if (!handle.trim()) {
      setError("Please enter your Codeforces handle")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/cf/verify/compilation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to start verification")
      }

      setCodeSnippet(data.codeSnippet)
      setVerificationId(data.verificationId)
      setStep("submit")
      setTimeRemaining(120)
      setTimerActive(true)

      toast({
        title: "Verification Started",
        description: "Copy the code and submit it on Codeforces",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkVerification = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/cf/verify/compilation/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Verification failed")
      }

      if (data.verified) {
        setTimerActive(false)
        setStep("complete")

        // Save verification data
        const verificationData = {
          handle: data.handle,
          rating: data.rating || 0,
          maxRating: data.maxRating || 0,
          rank: data.rank || "unrated",
          verifiedAt: new Date().toISOString(),
        }

        setVerificationData(verificationData)

        toast({
          title: "Verification Successful!",
          description: `Your Codeforces handle ${data.handle} has been verified`,
        })

        onVerificationComplete?.(verificationData)
      } else {
        toast({
          title: "Not Verified Yet",
          description: data.message || "Please submit the code and try again",
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Verification failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet)
    toast({
      title: "Code Copied",
      description: "Paste it in the Codeforces submission editor",
    })
  }

  const restartVerification = () => {
    setStep("input")
    setHandle("")
    setError(null)
    setCodeSnippet("")
    setVerificationId("")
    setTimeRemaining(120)
    setTimerActive(false)
  }

  if (step === "complete") {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Codeforces Verified
          </CardTitle>
          <CardDescription>Your Codeforces handle has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={restartVerification}>
            Verify Another Account
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Connect Codeforces Handle</CardTitle>
          <CardDescription>
            {step === "input" && "Enter your Codeforces Handle"}
            {step === "submit" && "Submit a compilation error"}
            {step === "verify" && "Verify your submission"}
            {step === "timeout" && "Verification Timed Out"}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {step === "input" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cf-handle">Codeforces Handle</Label>
              <Input
                id="cf-handle"
                placeholder="Enter your handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startVerification()}
              />
              <p className="text-sm text-muted-foreground">
                Don't have a Codeforces Account?{" "}
                <a
                  href="https://codeforces.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Create Now
                </a>
              </p>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <h4 className="font-semibold text-sm">Why connect your Codeforces handle?</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span>Automatically sync your Codeforces submissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span>Track your problem-solving progress in real time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span>See your name on leaderboards for that instant dopamine rush</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span>Stay motivated by comparing with your college peers</span>
                </li>
              </ul>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Codeforces handle is case-sensitive, enter it exactly as it appears on
                Codeforces.
              </AlertDescription>
            </Alert>

            <Button onClick={startVerification} disabled={loading || !handle.trim()} className="w-full">
              {loading ? "Starting..." : "Next"}
            </Button>
          </>
        )}

        {step === "submit" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Codeforces Handle:</p>
                <p className="text-lg font-bold">{handle}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Time remaining to submit:</p>
                <p className="text-2xl font-bold text-primary">{formatTime(timeRemaining)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">1. Submit a compilation error</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submit a solution that results in a compilation error for{" "}
                      <a
                        href="https://codeforces.com/problemset/problem/1869/A"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Problem 1869A <ExternalLink className="h-3 w-3" />
                      </a>{" "}
                      using your Codeforces account ({handle}). Go to the problem page, open the Submit tab, paste the
                      provided code into the editor, and click the Submit button.
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-xs text-muted-foreground">{codeSnippet.split("\n")[0]}</code>
                    <Button variant="outline" size="sm" onClick={copyCode}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Code
                    </Button>
                  </div>
                  <pre className="bg-black/80 text-green-400 p-3 rounded text-xs overflow-x-auto font-mono">
                    {codeSnippet}
                  </pre>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="font-semibold">2. Verify your submission</p>
                <p className="text-sm text-muted-foreground mt-1">
                  After submission, you will be redirected to the Status tab where the result of your submission will
                  appear. Wait until the verdict displays <strong>Compilation Error</strong>. Once it does, return to
                  this page and click Verify Now button to finish.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={restartVerification} className="flex-1">
                Cancel
              </Button>
              <Button onClick={checkVerification} disabled={loading} className="flex-1">
                {loading ? "Verifying..." : "Verify Now"}
              </Button>
            </div>
          </>
        )}

        {step === "timeout" && (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Verification Timed Out</strong>
                <p className="mt-1">
                  This could be because the submission wasn't made in time or there was an issue with the verification
                  process.
                </p>
              </AlertDescription>
            </Alert>

            <Button onClick={restartVerification} className="w-full">
              Restart Verification
            </Button>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
