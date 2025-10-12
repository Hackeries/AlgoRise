import PlatformFeatures from '@/components/landing/platform-features';
import HowItWorks from '@/components/landing/how-it-works';
import ModernLanding from '@/components/landing-hero';
import PixelBlast from '@/components/bg/pixelblast';
import CFLevels from '@/components/landing/cf-levels';

export default function VisualizersPage() {
  return (
    <main className='relative w-full min-h-screen overflow-hidden'>
      {/* Background Animation */}
      <div className='absolute inset-0 -z-10'>
        <PixelBlast color='#63EDA1' />
      </div>

      {/* Hero Section */}
      <section className='relative z-5 py-1' aria-label='Hero Section'>
        <ModernLanding />
      </section>

      {/* Codeforces Levels Section */}
      <section className='relative z-5 py-1' aria-label='Codeforces Levels'>
        <CFLevels />
      </section>

      {/* How It Works Section */}
      <section className='relative z-5 py-1' aria-label='How It Works'>
        <HowItWorks />
      </section>

      {/* Platform Features Section */}
      <section className='relative z-5 py-1' aria-label='Platform Features'>
        <PlatformFeatures />
      </section>
    </main>
  );
}