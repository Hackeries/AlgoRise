import PlatformFeatures from '@/components/landing/platform-features';
import HowItWorks from '@/components/landing/how-it-works';
import ModernLanding from '@/components/landing-hero';
import PixelBlast from '@/components/bg/pixelblast';
import CFLevels from '@/components/landing/cf-levels';
import AdSenseAd from '@/components/ads/AdSenseAd';

export default function VisualizersPage() {
  return (
    <main className='relative w-full min-h-screen overflow-x-hidden'>
      {/* Background Animation */}
      <div className='absolute inset-0 -z-10'>
        <PixelBlast color='hsl(var(--accent))' />
      </div>

      {/* Hero Section */}
      <section className='relative z-5 w-full' aria-label='Hero Section'>
        <ModernLanding />
      </section>

      {/* Ad: Responsive banner between hero and levels */}
      <section className='relative z-5 w-full my-6 flex justify-center'>
        <AdSenseAd
          slot={"0000000000"}
          format='auto'
          responsive
          className='w-full max-w-7xl px-4'
          style={{ minHeight: 90 }}
        />
      </section>

      {/* Codeforces Levels Section */}
      <section className='relative z-5 w-full' aria-label='Codeforces Levels'>
        <CFLevels />
      </section>

      {/* How It Works Section */}
      <section className='relative z-5 w-full' aria-label='How It Works'>
        <HowItWorks />
      </section>

      {/* Platform Features Section */}
      <section className='relative z-5 w-full' aria-label='Platform Features'>
        <PlatformFeatures />
      </section>
    </main>
  );
}
