import CompareHandles from "@/components/analytics/compare-handles"
import LiveActivity from "@/components/analytics/live-activity"

export default function AnalyticsComparePage({
  searchParams,
}: {
  searchParams?: { a?: string; b?: string; h?: string }
}) {
  const a = searchParams?.a || "tourist"
  const b = searchParams?.b || "Benq"
  const h = searchParams?.h || a

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-balance">Compare Codeforces Handles</h1>
        <p className="text-muted-foreground">
          Use query params to customize: <code>?a=handle1&amp;b=handle2&amp;h=activityHandle</code>
        </p>
      </header>

      <section className="space-y-6">
        <CompareHandles defaultA={a} defaultB={b} />
        <LiveActivity defaultHandle={h} />
      </section>
    </main>
  )
}
