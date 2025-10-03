import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VISUALIZERS } from '@/lib/visualizers';
import ModernLanding from '@/components/landing-hero';
import PixelBlast from '@/components/bg/pixelblast';

export default function VisualizersPage() {
  return (
    <main className='relative w-full min-h-screen overflow-hidden'>
      {/* Background Animation */}
      <div className='absolute inset-0 -z-10'>
        <PixelBlast color='#63EDA1' />
      </div>

      {/* Hero Section */}
      <section className='relative z-10'>
        <ModernLanding />
      </section>

      {/* Explore Section */}
      <section className='relative z-10 py-16 px-4'>
        <div className='max-w-6xl mx-auto text-center'>
          <h1 className='text-4xl font-bold text-[#63EDA1] mb-6'>Explore</h1>
          <h3 className='text-2xl font-semibold text-white mb-6'>
            Visualizers
          </h3>
          <p className='text-white/80 mb-12'>
            Learn complex algorithms visually, then jump straight into a curated
            practice set for that topic.
          </p>

          <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3'>
            {VISUALIZERS.map(v => (
              <Link
                key={v.slug}
                href={`/visualizers/${v.slug}`}
                className='transform-gpu transition-transform duration-200 ease-in-out hover:scale-105'
              >
                <Card className='h-full text-indigo-300 bg-black/30 backdrop-blur-xl border border-white/10 hover:border-[#63EDA1]/50 transition-colors'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg'>{v.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-stone-400'>{v.summary}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
