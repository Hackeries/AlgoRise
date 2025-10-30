'use client';

import { Suspense, useState, useEffect } from 'react';
import PlatformFeatures from '@/components/landing/platform-features';
import HowItWorks from '@/components/landing/how-it-works';
import ModernLanding from '@/components/landing-hero';
import PixelBlast from '@/components/bg/pixelblast';
import CFLevels from '@/components/landing/cf-levels';
import AdSenseAd from '@/components/ads/AdSenseAd';

// Loading fallbacks
function SectionSkeleton() {
  return (
    <div className='w-full animate-pulse'>
      <div className='h-64 bg-muted/20 rounded-lg' />
    </div>
  );
}

// Ad Wrapper Component - Fixed with transparent background
function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Simulate ad load detection
    const timer = setTimeout(() => setAdLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!adLoaded) {
    return null; // Don't show anything while loading
  }

  return (
    <aside
      className='relative z-10 w-full my-8 sm:my-10 lg:my-12 flex justify-center animate-fade-in'
      aria-label='Advertisement'
    >
      <div className='w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Fixed: Changed bg-card/5 to bg-transparent */}
        <div className='rounded-lg overflow-hidden border border-border/10 bg-transparent backdrop-blur-sm ad-container-wrapper'>
          <AdSenseAd
            slot='0000000000'
            format='auto'
            responsive
            className='ad-banner-fixed'
          />
        </div>
      </div>
    </aside>
  );
}

export default function HomePage() {
  return (
    <main className='relative w-full min-h-screen overflow-x-hidden bg-background'>
      {/* Background Animation */}
      <div
        className='fixed inset-0 -z-10 pointer-events-none'
        aria-hidden='true'
      >
        <PixelBlast color='hsl(var(--accent))' />
      </div>

      {/* Hero Section */}
      <section
        className='relative z-10 w-full animate-fade-in'
        aria-labelledby='hero-heading'
      >
        <Suspense fallback={<SectionSkeleton />}>
          <ModernLanding />
        </Suspense>
      </section>

      {/* Responsive Ad Banner - Only shows when loaded */}
      <Suspense fallback={null}>
        <AdBanner />
      </Suspense>

      {/* Main Content Container */}
      <div className='relative z-10 space-y-16 sm:space-y-20 lg:space-y-24 pb-16 sm:pb-20 lg:pb-24'>
        {/* Codeforces Levels Section */}
        <section
          className='w-full scroll-mt-16'
          id='levels'
          aria-labelledby='levels-heading'
        >
          <Suspense fallback={<SectionSkeleton />}>
            <CFLevels />
          </Suspense>
        </section>

        {/* How It Works Section */}
        <section
          className='w-full scroll-mt-16'
          id='how-it-works'
          aria-labelledby='how-it-works-heading'
        >
          <Suspense fallback={<SectionSkeleton />}>
            <HowItWorks />
          </Suspense>
        </section>

        {/* Platform Features Section */}
        <section
          className='w-full scroll-mt-16'
          id='features'
          aria-labelledby='features-heading'
        >
          <Suspense fallback={<SectionSkeleton />}>
            <PlatformFeatures />
          </Suspense>
        </section>
      </div>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Competitive Programming Visualizers',
            description:
              'Interactive platform for learning competitive programming with visualizers and problem sets',
            applicationCategory: 'EducationalApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '1250',
            },
          }),
        }}
      />
    </main>
  );
}