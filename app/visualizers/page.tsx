import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VISUALIZERS } from "@/lib/visualizers";
import { ArrowRight } from "lucide-react";

export default function VisualizersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Algorithm Visualizers</h1>
        <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
          Visualize and understand key algorithms interactively — 
          from Sorting and Graphs to Dynamic Programming and Trees. 
          Each visualizer includes trusted learning resources and practice sets 
          from <span className="font-semibold">CP-Algorithms</span> and <span className="font-semibold">USACO Guide</span>.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {VISUALIZERS.map((v) => (
          <Link
            key={v.slug}
            href={`/visualizers/${v.slug}`}
            className="group"
          >
            <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {v.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {v.summary}
                </p>
                <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                  Explore Visualizer <ArrowRight size={16} className="ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}