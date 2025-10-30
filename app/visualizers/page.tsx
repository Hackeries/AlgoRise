import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VISUALIZERS } from '@/lib/visualizers';
import { ProductionVisualizer } from '@/components/visualizers/production-visualizer';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';

export default function VisualizersPage() {
  return (
    <main>
      <Container className='py-10'>
        <PageHeader
          title='Algorithm Visualizers'
          description='Master competitive programming algorithms with interactive step-by-step visualizations. Learn sorting, searching, dynamic programming, graphs, and more with real-time animations.'
        />

      {/* Production Visualizer */}
      <div className='mb-12'>
        <h2 className='text-2xl font-bold mb-4'>
          Interactive Algorithm Visualizer
        </h2>
        <ProductionVisualizer />
      </div>

      {/* Quick Links */}
      <div className='mb-8'>
        <h2 className='text-2xl font-bold mb-4'>Specialized Visualizers</h2>
        <p className='text-muted-foreground mb-6'>
          Learn complex algorithms visually, then jump straight into a curated
          practice set for that topic.
        </p>

        <div className='mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
          {VISUALIZERS.map((v, index) => (
            <Link key={v.slug} href={`/visualizers/${v.slug}`}>
              <Card className='h-full card-3d hover-shine transition-colors cursor-pointer group animate-fade-in' style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base group-hover:text-primary transition-colors'>{v.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground leading-relaxed'>{v.summary}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      </Container>
    </main>
  );
}