// app/profile/overview/page.tsx
import type React from "react"
import Link from "next/link"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"
import LinksEditor from "@/components/profile/links-editor"
import { ReportBugButton } from "@/components/report-bug-button"

function formatYear(year: string | null): string {
  if (!year) return "—"
  const yearNum = Number.parseInt(year)
  if (isNaN(yearNum)) return year

  const suffix = yearNum === 1 ? "st" : yearNum === 2 ? "nd" : yearNum === 3 ? "rd" : "th"
  return `${yearNum}${suffix} Year`
}

function formatDegreeType(degreeType: string | null): string {
  if (!degreeType) return ""

  const degreeMap: Record<string, string> = {
    btech: "B.Tech / B.E.",
    mtech: "M.Tech / M.E.",
    bsc: "B.Sc.",
    msc: "M.Sc.",
    bca: "BCA",
    mca: "MCA",
    mba: "MBA",
    phd: "Ph.D.",
    other: "Other",
  }

  return degreeMap[degreeType] || degreeType
}

function calculateProfileStrength(data: any): number {
  const checks = [
    // Core requirements (60% weight)
    { check: !!data?.cf_verified, weight: 20 }, // CF verification is critical
    { check: !!data?.status, weight: 10 }, // Status selected

    // Status-specific requirements (30% weight)
    ...(data?.status === "student"
      ? [
          { check: !!data?.degree_type, weight: 10 },
          { check: !!data?.college_id, weight: 10 },
          { check: !!data?.year, weight: 10 },
        ]
      : data?.status === "working"
        ? [{ check: !!data?.company_id, weight: 30 }]
        : [{ check: false, weight: 30 }]),

    // Optional enhancements (10% weight - 2.5% each)
    { check: !!data?.leetcode_handle, weight: 2.5 },
    { check: !!data?.codechef_handle, weight: 2.5 },
    { check: !!data?.atcoder_handle, weight: 2.5 },
    { check: !!data?.gfg_handle, weight: 2.5 },
  ]

  const totalWeight = checks.reduce((sum, item) => sum + (item.check ? item.weight : 0), 0)
  return Math.round(totalWeight)
}

// Fetch profile data from API (SSR-safe)
async function getProfile() {
  try {
    // Await cookies if your Next.js version requires it
    const cookieStore = await cookies() // type is inferred automatically

    // Map cookies; define type inline for TS
    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ")

    const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || ""
    const url = base ? `${base}/api/profile` : "/api/profile"

    const res = await fetch(url, {
      cache: "no-store",
      headers: { cookie: cookieHeader },
    })

    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error("Failed to fetch profile:", err)
    return null
  }
}

// Reusable row component
interface ProfileRowProps {
  label: React.ReactNode
  value?: string | null
}
function ProfileRow({ label, value }: ProfileRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value || "—"}</span>
    </div>
  )
}

// Main page component
export default async function ProfileOverviewPage() {
  const data = await getProfile()

  const name = data?.name || data?.full_name || "Your Profile"
  const status = data?.status as "student" | "working" | null
  const degreeType = data?.degree_type || null
  const college = data?.college_name || data?.college || null
  const year = data?.year || null
  const company = data?.company_name || data?.company || data?.custom_company || null
  const cf = data?.cf_handle || data?.cf || null
  const cfVerified = data?.cf_verified || false
  const lc = data?.leetcode_handle || null
  const cc = data?.codechef_handle || null
  const ac = data?.atcoder_handle || null
  const gfg = data?.gfg_handle || null

  const completion = calculateProfileStrength(data)

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Overview</h1>
            <p className="text-muted-foreground mt-1">View and manage your profile information</p>
          </div>
          <ReportBugButton variant="outline" section="Profile" />
        </div>

        {/* Progress / Strength */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Profile Strength: {completion}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded bg-muted overflow-hidden" aria-label="Profile completion progress">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completion}%` }}
                role="progressbar"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {completion >= 100
                ? "Profile Complete! You're all set to connect, learn, and shine."
                : completion >= 90
                  ? "Almost there! Add more coding profiles to reach 100%."
                  : completion >= 60
                    ? "Good progress! Complete your profile details to unlock full potential."
                    : "Complete your profile to unlock personalized recommendations."}
            </p>
          </CardContent>
        </Card>

        {/* About + Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">{name}</CardTitle>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium capitalize">{status || "—"}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Codeforces</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cf || "—"}</span>
                    {cf ? (
                      cfVerified ? (
                        <Badge className="bg-green-600 hover:bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" /> Unverified
                        </Badge>
                      )
                    ) : null}
                  </div>
                </div>

                {status === "student" && degreeType && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Degree</div>
                    <div className="font-medium">{formatDegreeType(degreeType)}</div>
                  </div>
                )}

                {status === "student" && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">College</div>
                    <div className="font-medium">{college || "—"}</div>
                  </div>
                )}

                {status === "working" && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Company</div>
                    <div className="font-medium">{company || "—"}</div>
                  </div>
                )}

                {status === "student" && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Year</div>
                    <div className="font-medium">{formatYear(year)}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href="/adaptive-sheet">
                <Button className="w-full">Open Adaptive Sheet</Button>
              </Link>
              <Link href="/paths">
                <Button variant="secondary" className="w-full">
                  Browse Learning Paths
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Coding Profiles / Links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Coding Profiles</CardTitle>
            <LinksEditor
              defaultValues={{ leetcode: lc || "", codechef: cc || "", atcoder: ac || "", gfg: gfg || "" }}
            />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {/* Codeforces */}
            {cf ? (
              <a
                href={`https://codeforces.com/profile/${encodeURIComponent(cf)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-muted hover:bg-muted/80 transition"
              >
                <span className="font-medium">Codeforces</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Badge variant="outline">Add Codeforces</Badge>
            )}

            {lc ? (
              <a
                href={`https://leetcode.com/${encodeURIComponent(lc)}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-muted hover:bg-muted/80 transition"
              >
                <span className="font-medium">LeetCode</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Badge variant="outline">Add LeetCode</Badge>
            )}

            {cc ? (
              <a
                href={`https://www.codechef.com/users/${encodeURIComponent(cc)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-muted hover:bg-muted/80 transition"
              >
                <span className="font-medium">CodeChef</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Badge variant="outline">Add CodeChef</Badge>
            )}

            {ac ? (
              <a
                href={`https://atcoder.jp/users/${encodeURIComponent(ac)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-muted hover:bg-muted/80 transition"
              >
                <span className="font-medium">AtCoder</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Badge variant="outline">Add AtCoder</Badge>
            )}

            {gfg ? (
              <a
                href={`https://auth.geeksforgeeks.org/user/${encodeURIComponent(gfg)}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-muted hover:bg-muted/80 transition"
              >
                <span className="font-medium">GfG</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Badge variant="outline">Add GfG</Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
