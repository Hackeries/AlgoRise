import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VISUALIZERS } from '@/lib/visualizers';
import { ProductionVisualizer } from '@/components/visualizers/production-visualizer';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';

export default function VisualizersPage() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-background via-background to-muted/20'>
      <Container className='py-10'>
        {/* Enhanced Hero Section */}
        <div className='relative overflow-hidden rounded-2xl glass-intense p-8 sm:p-10 mb-10 hover-lift'>
          <div className='absolute inset-0 -z-10'>
            <div className='absolute top-0 right-0 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[100px] animate-pulse' />
            <div className='absolute bottom-0 left-0 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[100px] animate-pulse' style={{ animationDelay: '1s' }} />
          </div>
          <div className='text-center'>
            <h1 className='text-4xl sm:text-5xl font-bold tracking-tight gradient-text mb-4'>
              Algorithm Visualizers
            </h1>
            <p className='text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl mx-auto'>
              <span className='font-semibold text-foreground'>Master competitive programming</span> algorithms with interactive step-by-step visualizations. Learn sorting, searching, dynamic programming, graphs, and more with real-time animations.
            </p>
          </div>
        </div>

      {/* Production Visualizer */}
      <div className='mb-12'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30'>
            <svg className='w-6 h-6 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
            </svg>
          </div>
          <div>
            <h2 className='text-2xl sm:text-3xl font-bold'>
              Interactive Algorithm Visualizer
            </h2>
            <p className='text-sm text-muted-foreground'>Watch algorithms come to life</p>
          </div>
        </div>
        <ProductionVisualizer />
      </div>

      {/* Quick Links */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30'>
            <svg className='w-6 h-6 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' />
            </svg>
          </div>
          <div>
            <h2 className='text-2xl sm:text-3xl font-bold'>Specialized Visualizers</h2>
            <p className='text-sm text-muted-foreground'>Deep dive into specific algorithms</p>
          </div>
        </div>
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