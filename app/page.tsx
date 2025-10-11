import PlatformFeatures from '@/components/landing/platform-features';
import HowItWorks from '@/components/landing/how-it-works';
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

      <HowItWorks />

      <PlatformFeatures />
    </main>
  );
}
