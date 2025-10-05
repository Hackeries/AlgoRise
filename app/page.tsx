import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VISUALIZERS } from "@/lib/visualizers"

export default function VisualizersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Visualizers</h1>
      <p className="mt-2 text-white/80 leading-relaxed">
        Learn complex algorithms visually, then jump straight into a curated practice set for that topic.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {VISUALIZERS.map((v) => (
          <Link key={v.slug} href={`/visualizers/${v.slug}`}>
            <Card className="h-full hover:border-white/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{v.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70">{v.summary}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
