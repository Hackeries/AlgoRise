"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const MAX_SESSION_RETRIES = 3
const SESSION_RETRY_DELAY = 1000

const getUserFriendlyError = (error: string): string => {
  if (error.includes("access_denied") || error.includes("consent_required")) {
    return "You denied access to your account. Please try again and grant the required permissions."
  }
  if (error.includes("invalid_request") || error.includes("invalid_grant")) {
    return "The sign-in request has expired. Please try signing in again."
  }
  if (error.includes("temporarily_unavailable") || error.includes("server_error")) {
    return "The authentication service is temporarily unavailable. Please try again in a few moments."
  }
  if (error.includes("email") && error.includes("already")) {
    return "This email is already associated with another account. Try signing in with a different method."
  }
  if (error.includes("verifier") || error.includes("PKCE")) {
    return "Session verification failed. Please try signing in again from the login page."
  }
  if (error.includes("network") || error.includes("fetch")) {
    return "Network error occurred. Please check your internet connection and try again."
  }
  return error
}

export default function AuthCallback() {
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = () => {
    setError(null)
    setRetryCount((prev) => prev + 1)
    setIsRetrying(true)
  }

  const handleBackToLogin = () => {
    window.location.replace("/auth/login")
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
        setIsRetrying(false)
        const supabase = createClient()

        const providerError = params.get("error")
        const providerErrorDesc = params.get("error_description")
        if (providerError || providerErrorDesc) {
          const errorMessage = providerErrorDesc || providerError || "Unknown authentication error"
          throw new Error(getUserFriendlyError(errorMessage))
        }

        const hasCode = params.get("code") || params.get("access_token")
        if (!hasCode) {
          throw new Error("Missing authorization code. Please start the sign-in process again from the login page.")
        }

        if (typeof window !== "undefined" && hasCode) {
          let exchangeAttempt = 0
          let exchangeSuccess = false

          while (exchangeAttempt < MAX_SESSION_RETRIES && !exchangeSuccess) {
            try {
              const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)
              if (exchangeError) {
                if (!exchangeError.message.includes("verifier") && !exchangeError.message.includes("PKCE")) {
                  if (exchangeAttempt === MAX_SESSION_RETRIES - 1) {
                    throw new Error(getUserFriendlyError(exchangeError.message))
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

        const sessionEstablished = await attemptSessionEstablishment(supabase)

        const { data: finalSession } = await supabase.auth.getSession()
        if (!finalSession.session?.user) {
          if (!sessionEstablished) {
            throw new Error("Unable to establish session after multiple attempts. Please try signing in again.")
          }
          throw new Error("Session verification failed. Please try signing in again.")
        }

        let redirectTarget = "/profile"
        try {
          const currentUserId = finalSession.session?.user?.id;
          if (currentUserId) {
            const { data: cf } = await supabase
              .from('cf_handles')
              .select('verified')
              .eq('user_id', currentUserId)
              .single();

            const { data: prof } = await supabase
              .from('profiles')
              .select('status')
              .eq('user_id', currentUserId)
              .single();

            // If user has verified CF handle and profile status, they're an existing user
            if (cf?.verified && prof?.status) {
              redirectTarget = '/profile/overview';
            } else {
              redirectTarget = '/profile';
            }
          } else {
            redirectTarget = "/profile"
          }
        } catch {
          // New user or incomplete profile - redirect to /profile
          redirectTarget = "/profile"
        }

        // Respect explicit "next" only if present and safe; else use computed redirect
        const userNext = sanitizeNext(params.get("next"))
        const finalNext = userNext === "/profile" ? redirectTarget : userNext

        if (mounted) window.location.replace(finalNext)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Authentication failed. Please try again."
        if (mounted) setError(getUserFriendlyError(msg))
      }
    })()

    return () => {
      mounted = false
    }
  }, [params, retryCount])

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Sign-in Failed</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleRetry} disabled={isRetrying} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              Try Again
            </Button>
            <Button onClick={handleBackToLogin}>Back to Login</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">Completing sign-in…</p>
          <p className="text-xs text-muted-foreground">Please wait while we verify your account</p>
        </div>
      </div>
    </div>
  )
}
