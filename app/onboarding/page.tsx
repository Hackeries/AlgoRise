"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Circle, ArrowRight, Zap, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

type OnboardingStep = "cf-handle" | "generate-sheet" | "ready-to-train"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("cf-handle")
  const [cfHandle, setCfHandle] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle")
  const [userRating, setUserRating] = useState<number | null>(null)
  const [firstProblems, setFirstProblems] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const steps = [
    {
      id: "cf-handle",
      title: "Link CF Handle",
      description: "Connect your Codeforces account",
    },
    {
      id: "generate-sheet",
      title: "Generate Sheet",
      description: "Create your first adaptive sheet",
    },
    {
      id: "ready-to-train",
      title: "Start Training",
      description: "Begin your journey",
    },
  ]

  async function verifyCFHandle() {
    if (!cfHandle.trim()) return

    setIsVerifying(true)
    try {
      const response = await fetch("/api/cf/verify/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: cfHandle.trim() }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Verification failed")

      setVerificationStatus("success")
      setUserRating(data.rating || 1200)
      toast({
        title: "CF Handle Verified!",
        description: `Connected ${cfHandle} successfully`,
      })

      // Auto-advance to next step after 1 second
      setTimeout(() => {
        setCurrentStep("generate-sheet")
        generateFirstSheet()
      }, 1000)
    } catch (error: any) {
      setVerificationStatus("error")
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  async function generateFirstSheet() {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/adaptive-sheet/generate-first", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to generate sheet")

      setFirstProblems(data.problems || [])
      toast({
        title: "Adaptive Sheet Ready!",
        description: "Your first 3 problems are waiting",
      })

      // Auto-advance to final step
      setTimeout(() => {
        setCurrentStep("ready-to-train")
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  function completeOnboarding() {
    toast({
      title: "Welcome to AlgoRise!",
      description: "Your training journey begins now",
    })
    router.push("/train")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#1a1f3a] to-[#0B1020] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = steps.findIndex((s) => s.id === currentStep) > index

            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 ${isActive ? "text-blue-400" : isCompleted ? "text-green-400" : "text-muted-foreground"}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className={`h-5 w-5 ${isActive ? "fill-current" : ""}`} />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            )
          })}
        </div>

        {/* Step 1: CF Handle Verification */}
        {currentStep === "cf-handle" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">Verify your Codeforces handle</h2>
              <p className="text-muted-foreground mt-2">Verification is now done on your Profile page.</p>
            </div>

            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/profile?next=/onboarding&verify=cf">Go to Profile to Verify</Link>
            </Button>
          </div>
        )}

        {/* Step 2: Generate Sheet */}
        {currentStep === "generate-sheet" && (
          <Card className="border-amber-500/20 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                <Zap className="h-6 w-6 text-amber-400" />
              </div>
              <CardTitle className="text-2xl">Creating Your Adaptive Sheet</CardTitle>
              <CardDescription>Analyzing your profile to generate personalized problems...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                  Analyzing rating: {userRating}
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  Selecting optimal difficulty range
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></div>
                  Curating your first 3 problems
                </div>
              </div>

              {isGenerating && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-amber-500 h-2 rounded-full animate-pulse"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Ready to Train */}
        {currentStep === "ready-to-train" && (
          <Card className="border-green-500/20 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-2xl">You're All Set!</CardTitle>
              <CardDescription>Your personalized training is ready. Start with these 3 problems:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {firstProblems.slice(0, 3).map((problem, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-muted-foreground/20 bg-muted/20"
                  >
                    <div>
                      <div className="font-medium">{problem.title || `Problem ${index + 1}`}</div>
                      <div className="text-sm text-muted-foreground">
                        Rating: {problem.rating || userRating! - 200 + index * 100} •{" "}
                        {problem.tags?.[0] || "Implementation"}
                      </div>
                    </div>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">0</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{userRating}</div>
                  <div className="text-xs text-muted-foreground">CF Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">3</div>
                  <div className="text-xs text-muted-foreground">Problems Ready</div>
                </div>
              </div>

              <Button onClick={completeOnboarding} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Start Training Now
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Complete 1 problem today to start your streak!
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip option */}
        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/train">Skip onboarding</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
