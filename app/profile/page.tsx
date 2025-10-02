"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [handle, setHandle] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [verified, setVerified] = useState<boolean | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [maxRating, setMaxRating] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cfSettingsUrl = "https://codeforces.com/settings/social"

  // Fetch current verification status on mount
  useEffect(() => {
    const checkOnMount = async () => {
      setChecking(true)
      try {
        const res = await fetch("/api/cf/verify/check", { method: "POST" })
        const data = await res.json()
        if (res.ok) {
          // If a handle row exists and is verified
          if (data?.verified) {
            setVerified(true)
            if (typeof data.rating === "number") setRating(data.rating)
            if (typeof data.maxRating === "number") setMaxRating(data.maxRating)
          } else {
            // Row exists but not verified (or token not found)
            setVerified(false)
          }
        } else {
          // If no handle to verify yet, stay in initial state
          if (data?.error === "no handle to verify") {
            setVerified(null)
          } else {
            setError(data?.error || "Unable to check verification")
          }
        }
      } catch (e: any) {
        setError(e?.message || "Unable to check verification")
      } finally {
        setChecking(false)
      }
    }
    checkOnMount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canStart = useMemo(() => handle.trim().length >= 2, [handle])

  async function startVerification() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/cf/verify/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to start verification")
      setToken(data.token)
      setVerified(false)
      toast({
        title: "Verification started",
        description: "Copy the token and paste it into your Codeforces Organization field, then click Check.",
      })
    } catch (e: any) {
      setError(e?.message || "Failed to start verification")
      toast({ title: "Error", description: e?.message || "Failed to start verification", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function checkVerification() {
    setChecking(true)
    setError(null)
    try {
      const res = await fetch("/api/cf/verify/check", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        if (data?.error === "no handle to verify") {
          setVerified(null)
          setToken(null)
          throw new Error("No handle found. Please start verification first.")
        }
        throw new Error(data?.error || "Verification check failed")
      }
      if (data?.verified) {
        setVerified(true)
        setToken(null)
        setRating(typeof data.rating === "number" ? data.rating : null)
        setMaxRating(typeof data.maxRating === "number" ? data.maxRating : null)
        toast({ title: "Handle verified", description: "Your Codeforces handle is now verified." })
      } else {
        setVerified(false)
        toast({
          title: "Not verified yet",
          description: "Token not found in your Organization field. Paste it and try again.",
        })
      }
    } catch (e: any) {
      setError(e?.message || "Verification check failed")
      toast({ title: "Error", description: e?.message || "Verification check failed", variant: "destructive" })
    } finally {
      setChecking(false)
    }
  }

  function copyToken() {
    if (!token) return
    navigator.clipboard.writeText(token).then(() => {
      toast({ title: "Token copied", description: "Paste it into your Codeforces Organization field." })
    })
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-pretty text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Link and verify your Codeforces handle to earn a verified badge, improve recommendations, and appear on
          leaderboards.
        </p>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Codeforces Verification</CardTitle>
            <CardDescription>Link your CF handle and verify ownership with a one-time token.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Status Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status</span>
                {verified ? (
                  <Badge className="bg-green-600 hover:bg-green-600/90">Verified</Badge>
                ) : verified === false ? (
                  <Badge variant="secondary">Pending</Badge>
                ) : (
                  <Badge variant="outline">Not linked</Badge>
                )}
              </div>
              {verified && (rating || maxRating) ? (
                <div className="text-right text-sm text-muted-foreground">
                  {typeof rating === "number" && <div>Rating: {rating}</div>}
                  {typeof maxRating === "number" && <div>Max: {maxRating}</div>}
                </div>
              ) : null}
            </div>

            {/* Handle input */}
            <div className="grid gap-2">
              <Label htmlFor="handle">Codeforces Handle</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="handle"
                  placeholder="e.g. tourist"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
                <Button onClick={startVerification} disabled={!canStart || loading}>
                  {loading ? "Starting..." : "Start"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We’ll create a one-time token. Paste it in Codeforces → Settings → Social → Organization.
              </p>
            </div>

            {/* Token display */}
            {token && (
              <div className="grid gap-2 rounded-md border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Verification Token</div>
                    <div className="text-xs text-muted-foreground">
                      Paste this token into your CF Organization field, save, then click Check.
                    </div>
                  </div>
                  <Button variant="secondary" onClick={copyToken}>
                    Copy
                  </Button>
                </div>
                <code className="rounded bg-black/40 px-2 py-1 text-sm">{token}</code>
                <div className="flex items-center gap-2">
                  <Button asChild variant="link" className="px-0">
                    <Link href={cfSettingsUrl} target="_blank" rel="noreferrer">
                      Open Codeforces Settings
                    </Link>
                  </Button>
                  <Button onClick={checkVerification} disabled={checking}>
                    {checking ? "Checking..." : "Check"}
                  </Button>
                </div>
              </div>
            )}

            {/* Manual check / retry */}
            {!token && (
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={checkVerification} disabled={checking}>
                  {checking ? "Checking..." : "Check status"}
                </Button>
                <Button asChild variant="link" className="px-0">
                  <Link href={cfSettingsUrl} target="_blank" rel="noreferrer">
                    Open Codeforces Settings
                  </Link>
                </Button>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
        </Card>

        {/* Coming soon: profile preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Set your training defaults and notification preferences (coming soon).</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">We&apos;ll add preferences after verification is complete.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
