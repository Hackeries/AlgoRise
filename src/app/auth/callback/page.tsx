"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, AlertCircle, RefreshCw, ArrowLeft, Code2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const MAX_SESSION_RETRIES = 3
const SESSION_RETRY_DELAY = 1000

const ERROR_MESSAGES: Record<string, { title: string; message: string; canRetry: boolean }> = {
  access_denied: {
    title: "Access Denied",
    message: "You denied access to your account. Please try again and grant the required permissions.",
    canRetry: true,
  },
  consent_required: {
    title: "Consent Required",
    message: "Please grant the required permissions to continue.",
    canRetry: true,
  },
  invalid_request: {
    title: "Request Expired",
    message: "The sign-in request has expired. Please try signing in again.",
    canRetry: true,
  },
  invalid_grant: {
    title: "Invalid Request",
    message: "The authorization code is invalid or has expired. Please try signing in again.",
    canRetry: true,
  },
  server_error: {
    title: "Server Error",
    message: "Our authentication service encountered an error. Please try again in a few moments.",
    canRetry: true,
  },
  temporarily_unavailable: {
    title: "Service Unavailable",
    message: "The authentication service is temporarily unavailable. Please try again shortly.",
    canRetry: true,
  },
  database_error: {
    title: "Account Setup Issue",
    message: "We encountered an issue setting up your account. Our team has been notified. Please try again.",
    canRetry: true,
  },
  email_exists: {
    title: "Email Already Registered",
    message: "This email is already associated with another account. Try signing in with a different method.",
    canRetry: false,
  },
  pkce_error: {
    title: "Session Error",
    message: "Session verification failed. Please clear your browser cookies and try signing in again.",
    canRetry: true,
  },
  network_error: {
    title: "Connection Error",
    message: "Network error occurred. Please check your internet connection and try again.",
    canRetry: true,
  },
  default: {
    title: "Sign-in Failed",
    message: "Something went wrong during sign-in. Please try again.",
    canRetry: true,
  },
}

function getErrorInfo(error: string): { title: string; message: string; canRetry: boolean } {
  const errorLower = error.toLowerCase()

  if (errorLower.includes("database") || errorLower.includes("saving new user")) {
    return ERROR_MESSAGES.database_error
  }
  if (errorLower.includes("access_denied")) {
    return ERROR_MESSAGES.access_denied
  }
  if (errorLower.includes("consent_required")) {
    return ERROR_MESSAGES.consent_required
  }
  if (errorLower.includes("invalid_request") || errorLower.includes("invalid_grant")) {
    return ERROR_MESSAGES.invalid_request
  }
  if (errorLower.includes("server_error")) {
    return ERROR_MESSAGES.server_error
  }
  if (errorLower.includes("temporarily_unavailable")) {
    return ERROR_MESSAGES.temporarily_unavailable
  }
  if (errorLower.includes("email") && errorLower.includes("already")) {
    return ERROR_MESSAGES.email_exists
  }
  if (errorLower.includes("verifier") || errorLower.includes("pkce")) {
    return ERROR_MESSAGES.pkce_error
  }
  if (errorLower.includes("network") || errorLower.includes("fetch")) {
    return ERROR_MESSAGES.network_error
  }

  return { ...ERROR_MESSAGES.default, message: error }
}

type AuthState = "loading" | "exchanging" | "verifying" | "creating_profile" | "success" | "error"

const STATE_MESSAGES: Record<AuthState, { title: string; subtitle: string }> = {
  loading: { title: "Initializing", subtitle: "Setting up your session..." },
  exchanging: { title: "Authenticating", subtitle: "Verifying your credentials..." },
  verifying: { title: "Verifying", subtitle: "Confirming your identity..." },
  creating_profile: { title: "Setting Up", subtitle: "Creating your profile..." },
  success: { title: "Success!", subtitle: "Redirecting you now..." },
  error: { title: "Error", subtitle: "Something went wrong" },
}

export default function AuthCallback() {
  const params = useSearchParams()
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [error, setError] = useState<{ title: string; message: string; canRetry: boolean } | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = () => {
    setError(null)
    setAuthState("loading")
    setRetryCount((prev) => prev + 1)
  }

  useEffect(() => {
    let mounted = true

    const sanitizeNext = (raw: string | null) => {
      const dec = raw ?? ""
      return dec.startsWith("/") ? dec : "/profile"
    }

    const attemptSessionEstablishment = async (
      supabase: ReturnType<typeof createClient>,
      attempt: number = 0
    ): Promise<boolean> => {
      const maxAttempts = 10
      let currentAttempt = attempt

      while (currentAttempt < maxAttempts) {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (data.session?.user) return true
        await new Promise((resolve) => setTimeout(resolve, 300))
        currentAttempt++
      }
      return false
    }

    ;(async () => {
      try {
        const supabase = createClient()

        // Check for provider errors in URL
        const providerError = params.get("error")
        const providerErrorDesc = params.get("error_description")
        if (providerError || providerErrorDesc) {
          const errorMessage = providerErrorDesc || providerError || "Unknown authentication error"
          throw new Error(errorMessage)
        }

        const hasCode = params.get("code") || params.get("access_token")
        if (!hasCode) {
          throw new Error("Missing authorization code. Please start the sign-in process again from the login page.")
        }

        // Exchange code for session
        if (mounted) setAuthState("exchanging")

        if (typeof window !== "undefined" && hasCode) {
          let exchangeAttempt = 0
          let exchangeSuccess = false

          while (exchangeAttempt < MAX_SESSION_RETRIES && !exchangeSuccess) {
            try {
              const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)
              if (exchangeError) {
                // PKCE errors might be okay if session already exists
                if (!exchangeError.message.includes("verifier") && !exchangeError.message.includes("PKCE")) {
                  if (exchangeAttempt === MAX_SESSION_RETRIES - 1) {
                    throw new Error(exchangeError.message)
                  }
                  await new Promise((resolve) => setTimeout(resolve, SESSION_RETRY_DELAY * (exchangeAttempt + 1)))
                  exchangeAttempt++
                  continue
                }
              }
              exchangeSuccess = true
            } catch (e) {
              if (exchangeAttempt === MAX_SESSION_RETRIES - 1) {
                throw e
              }
              await new Promise((resolve) => setTimeout(resolve, SESSION_RETRY_DELAY * (exchangeAttempt + 1)))
              exchangeAttempt++
            }
          }
        }

        // Verify session
        if (mounted) setAuthState("verifying")
        const sessionEstablished = await attemptSessionEstablishment(supabase)

        const { data: finalSession } = await supabase.auth.getSession()
        if (!finalSession.session?.user) {
          if (!sessionEstablished) {
            throw new Error("Unable to establish session after multiple attempts. Please try signing in again.")
          }
          throw new Error("Session verification failed. Please try signing in again.")
        }

        // Ensure profile exists
        if (mounted) setAuthState("creating_profile")
        try {
          const response = await fetch("/api/auth/ensure-profile", { 
            method: "POST",
            credentials: "include",
          })
          if (!response.ok) {
            console.error("Failed to ensure profile:", await response.text())
          }
        } catch (ensureProfileError) {
          console.error("Failed to ensure profile:", ensureProfileError)
        }

        // Determine redirect target
        let redirectTarget = "/profile"
        try {
          const currentUserId = finalSession.session?.user?.id
          if (currentUserId) {
            const { data: cf } = await supabase
              .from("cf_handles")
              .select("verified")
              .eq("user_id", currentUserId)
              .single()

            const { data: prof } = await supabase
              .from("profiles")
              .select("status")
              .eq("id", currentUserId)
              .single()

            if (cf?.verified && prof?.status) {
              redirectTarget = "/profile/overview"
            }
          }
        } catch {
          // New user or incomplete profile - redirect to /profile
        }

        // Success state before redirect
        if (mounted) setAuthState("success")

        const userNext = sanitizeNext(params.get("next"))
        const finalNext = userNext === "/profile" ? redirectTarget : userNext

        // Small delay to show success state
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (mounted) window.location.replace(finalNext)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Authentication failed. Please try again."
        if (mounted) {
          setError(getErrorInfo(msg))
          setAuthState("error")
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [params, retryCount])

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
        <Card className="w-full max-w-md shadow-xl border-destructive/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">{error.title}</CardTitle>
            <CardDescription className="text-base mt-2">{error.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex flex-col gap-3">
              {error.canRetry && (
                <Button onClick={handleRetry} variant="default" className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Button asChild variant={error.canRetry ? "outline" : "default"} className="w-full gap-2">
                <Link href="/auth/login">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                If this problem persists, please contact support or try a different sign-in method.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading/Progress state
  const stateInfo = STATE_MESSAGES[authState]
  const isSuccess = authState === "success"

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-6">
            <div className="p-3 rounded-2xl bg-primary/10 inline-flex">
              <Code2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">{stateInfo.title}</CardTitle>
          <CardDescription className="text-base">{stateInfo.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            {/* Progress indicator */}
            <div className="relative">
              {isSuccess ? (
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Progress steps */}
            <div className="w-full space-y-2">
              <ProgressStep
                label="Authenticating"
                status={getStepStatus("exchanging", authState)}
              />
              <ProgressStep
                label="Verifying session"
                status={getStepStatus("verifying", authState)}
              />
              <ProgressStep
                label="Setting up profile"
                status={getStepStatus("creating_profile", authState)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type StepStatus = "pending" | "active" | "complete"

function getStepStatus(step: AuthState, currentState: AuthState): StepStatus {
  const order: AuthState[] = ["loading", "exchanging", "verifying", "creating_profile", "success"]
  const stepIndex = order.indexOf(step)
  const currentIndex = order.indexOf(currentState)

  if (currentIndex > stepIndex) return "complete"
  if (currentIndex === stepIndex) return "active"
  return "pending"
}

function ProgressStep({ label, status }: { label: string; status: StepStatus }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50">
      <div className="flex-shrink-0">
        {status === "complete" && (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        )}
        {status === "active" && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Loader2 className="h-3 w-3 text-primary-foreground animate-spin" />
          </div>
        )}
        {status === "pending" && (
          <div className="w-5 h-5 rounded-full bg-muted-foreground/20" />
        )}
      </div>
      <span
        className={`text-sm ${
          status === "complete"
            ? "text-green-600 dark:text-green-400"
            : status === "active"
              ? "text-foreground font-medium"
              : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  )
}
