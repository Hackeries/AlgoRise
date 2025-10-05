'use client'; // <- Important, must be at the very top

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getVisualizer } from '@/lib/visualizers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { SortingVisualizer } from '@/components/visualizers/sorting-visualizer';
import { BinarySearchVisualizer } from '@/components/visualizers/binary-search-visualizer';
import { GreedyVisualizer } from '@/components/visualizers/greedy-visualizer';
import { DPVisualizer } from '@/components/visualizers/dp-visualizer';
import { RecursionVisualizer } from '@/components/visualizers/recursion-visualizer';
import { GraphVisualizer } from '@/components/visualizers/graph-visualizer';
import { TreeVisualizer } from '@/components/visualizers/tree-visualizer';
import { SegmentTreeVisualizer } from '@/components/visualizers/segment-tree-visualizer';
// import { BitmaskVisualizer } from '@/components/visualizers/bitmask-visualizer';
import { UnionFindVisualizer } from '@/components/visualizers/union-find-visualizer';
import { StringVisualizer } from '@/components/visualizers/string-visualizer';
import { NumberTheoryVisualizer } from '@/components/visualizers/number-theory-visualizer';

interface VisualizerPageProps {
  params: {
    slug: string;
  };
}

export default function VisualizerDetailPage({ params }: VisualizerPageProps) {
  // In a client component, params is available directly
  const slug = params.slug;

  const v = getVisualizer(slug);
  if (!v) return notFound();

  const renderVisualizer = () => {
    switch (slug) {
      case 'sorting': return <SortingVisualizer />;
      case 'binary-search': return <BinarySearchVisualizer />;
      case 'greedy': return <GreedyVisualizer />;
      case 'dp': return <DPVisualizer />;
      case 'recursion': return <RecursionVisualizer />;
      case 'graphs': return <GraphVisualizer />;
      case 'trees': return <TreeVisualizer />;
      case 'segment-tree': return <SegmentTreeVisualizer />;
      // case 'bitmask': return <BitmaskVisualizer />;
      case 'union-find': return <UnionFindVisualizer />;
      case 'string': return <StringVisualizer />;
      case 'number-theory': return <NumberTheoryVisualizer />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interactive visualizer for <strong>{v.title}</strong> is under development.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const difficultyColor =
    v.difficulty === 'beginner'
      ? 'bg-green-100 text-green-700 border-green-300'
      : v.difficulty === 'intermediate'
      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
      : 'bg-red-100 text-red-700 border-red-300';

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <Link
        href="/visualizers"
        className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-2 mb-6"
      >
        <ArrowLeft size={16} /> Back to Visualizers
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-bold">{v.title}</h1>
          <Badge
            variant="outline"
            className={`text-sm font-medium border ${difficultyColor}`}
          >
            {v.difficulty.charAt(0).toUpperCase() + v.difficulty.slice(1)}
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg mt-2">{v.summary}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {v.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </header>

      <div className="space-y-10">
        <section>{renderVisualizer()}</section>

        {/* Learning Resources */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Learning Resources</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {v.resources.map(r => (
              <Card key={r.href} className="hover:shadow-md transition-shadow border border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{r.label}</CardTitle>
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
                Ready to practice <strong>{v.title}</strong>? Try curated problems related to this topic:
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
  );
}
