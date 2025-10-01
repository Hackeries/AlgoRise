import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VISUALIZERS } from "@/lib/visualizers";


import PixelBlast from "@/components/bg/pixelblast"; 
import ModernLanding from "@/components/landing-hero"; 


export default function VisualizersPage() {
  return (

    <main className="relative w-full min-h-screen overflow-hidden">
      
      {/* Background Animation */}
      <div className="absolute inset-0 -z-10">
        <PixelBlast color="#63EDA1" />
      </div>

      {/* Main content container */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        
        {/* Visualizers Section */}
        <section>
          <h1 className="text-4xl font-bold text-white mb-6 text-center">Visualizers</h1>
          <p className="text-white/80 mb-12 text-center">
            Learn complex algorithms visually, then jump straight into a curated
            practice set for that topic.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {VISUALIZERS.map((v) => (
              <Link
                key={v.slug}
                href={`/visualizers/${v.slug}`}
                className="transform-gpu transition-transform duration-200 ease-in-out hover:scale-105"
              >
                <Card className="h-full text-indigo-300 bg-black/30 backdrop-blur-xl border border-white/10 hover:border-[#63EDA1]/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{v.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-stone-400">{v.summary}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <ModernLanding />
        </section>

      </div>
    </main>
  );
}
