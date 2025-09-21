import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VISUALIZERS } from "@/lib/visualizers"
import ModernLanding from "@/components/landing-hero"
import PixelBlast from "@/components/bg/pixelblast"

export default function VisualizersPage() {
  return (
    <main className="w-full px-4 py-10">
      <div className="relative z-10 space-y-8">
        <ModernLanding />

        <section className="py-16 px-4 justify-center">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-[#63EDA1] mb-6 text-center">Explore</h1>
            <h3 className="text-2xl font-semibold text-white mb-6">Visualizers</h3>
            <p className="text-white/80 mb-8">
              Learn complex algorithms visually, then jump straight into a curated practice set for that topic.
            </p>

            <div className="relative">
              <div className="absolute inset-0 -z-10 w-full h-full">
                <PixelBlast color="#63EDA1"/>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 relative z-10">
                {VISUALIZERS.map((v) => (
                  <Link key={v.slug} href={`/visualizers/${v.slug}`} className='transform-gpu transition-transform duration-200 ease-in-out hover:scale-101'>
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{v.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-stone-400">{v.summary}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}