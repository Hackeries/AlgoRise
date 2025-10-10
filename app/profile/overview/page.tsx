import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getProfile() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/profile`, { cache: "no-store" }).catch(
    () => null,
  )
  if (!res?.ok) return null
  return res.json().catch(() => null)
}

export default async function ProfileOverviewPage() {
  const data = await getProfile()
  const name = data?.name || data?.full_name || "Your Profile"
  const status = data?.status
  const college = data?.college_name || data?.college || null
  const year = data?.year || null
  const company = data?.company_name || data?.company || data?.custom_company || null
  const cf = data?.cf_handle || data?.cf || null

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{status || "—"}</span>
            </div>
            {status === "student" ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">College</span>
                  <span className="font-medium">{college || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Year</span>
                  <span className="font-medium">{year || "—"}</span>
                </div>
              </>
            ) : status === "working" ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Company</span>
                <span className="font-medium">{company || "—"}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Codeforces Handle</span>
              <span className="font-medium">{cf || "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
