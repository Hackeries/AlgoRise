import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getVisualizer } from "@/lib/visualizers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SortingVisualizer } from "@/components/visualizers/sorting-visualizer"
import { GraphVisualizer } from "@/components/visualizers/graph-visualizer"

export default async function VisualizerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const v = getVisualizer(slug)
  if (!v) return notFound()

  const renderVisualizer = () => {
    switch (slug) {
      case 'sorting':
        return <SortingVisualizer />
      case 'graphs':
        return <GraphVisualizer />
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interactive visualizer for {v.title} is under development. 
                Check out the resources below to learn more about this topic.
              </p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <Link href="/visualizers" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-2 mb-6">
        <ArrowLeft size={16} /> Back to Visualizers
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{v.title}</h1>
        <p className="text-muted-foreground text-lg">{v.summary}</p>
      </header>

      <div className="space-y-8">
        {/* Interactive Visualizer */}
        <section>
          {renderVisualizer()}
        </section>

        {/* Resources */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Learning Resources</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {v.resources.map((r) => (
              <Card key={r.href} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{r.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={r.href} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-primary hover:underline font-medium"
                  >
                    Open resource →
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Practice Problems */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Practice Problems</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Ready to practice {v.title.toLowerCase()}? Try these curated problems:
              </p>
              <Link 
                href={`/adaptive-sheet?tags=${v.tags.join(',')}`}
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Practice {v.title} Problems
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
