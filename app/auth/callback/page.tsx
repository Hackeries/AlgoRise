"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Ensure the "next" path is safe and defaults to /profile
    const sanitizeNext = (raw: string | null) => {
      const dec = raw ?? ""
      return dec.startsWith("/") ? dec : "/profile"
    }

    ;(async () => {
      try {
        const supabase = createClient()

        // Check if OAuth provider returned an error
        const providerError = params.get("error") || params.get("error_description")
        if (providerError) {
          throw new Error(`OAuth provider error: ${providerError}`)
        }

        // Get the code or access_token from callback URL
        const hasCode = params.get("code") || params.get("access_token")
        if (!hasCode) {
          throw new Error("Missing authorization code in callback URL")
        }

        // Check if PKCE code verifier exists in sessionStorage
        let hasPkce = false
        if (typeof window !== "undefined") {
          try {
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i)?.toLowerCase() || ""
              if (key.includes("verifier") || key.includes("pkce")) {
                hasPkce = true
                break
              }
            }
          } catch {}
        }

        // Exchange the code for a session if PKCE exists
        if (typeof window !== "undefined" && hasCode && hasPkce) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (exchangeError) {
            throw new Error(`Failed to exchange code for session: ${exchangeError.message}`)
          }
        } else if (!hasPkce) {
          throw new Error("Missing code verifier for PKCE. Make sure you start and finish sign-in on the same domain.")
        }

        // Wait until a valid session is established
        let attempts = 0
        while (attempts < 6) {
          const { data, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) throw sessionError
          if (data.session?.user) break
          await new Promise((resolve) => setTimeout(resolve, 250))
          attempts++
        }

        // Redirect user to next page (default: /profile)
        const next = sanitizeNext(params.get("next"))
        if (mounted) window.location.replace(next)
      } catch (e) {
        // Display user-friendly error messages
        const msg = e instanceof Error ? e.message : "Authentication failed"
        if (mounted) setError(msg)
      }
    })()

    return () => {
      mounted = false
    }
  }, [params])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {error ? <span>Sign-in failed: {error}</span> : <span>Completing sign-in…</span>}
      </div>
    </div>
  )
}
