'use client'

import { Suspense, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import PlatformFeatures from '@/components/landing/platform-features'
import HowItWorks from '@/components/landing/how-it-works'
import ModernLanding from '@/components/landing-hero'
import CFLevels from '@/components/landing/cf-levels'
import AdSenseAd from '@/components/ads/AdSenseAd'

// load pixelblast only on client to avoid hydration errors
// also skip on mobile devices for performance
const PixelBlast = dynamic(() => import('@/components/bg/pixelblast'), {
  ssr: false,
  loading: () => null,
})

function SectionSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-64 bg-muted/20 rounded-lg" />
    </div>
  )
}

function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAdLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!adLoaded) return null

  return (
    <aside
      className="relative z-10 w-full my-8 sm:my-10 lg:my-12 flex justify-center animate-fade-in"
      aria-label="Advertisement"
    >
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg overflow-hidden border border-border/10 bg-transparent backdrop-blur-sm">
          <AdSenseAd slot="0000000000" format="auto" responsive className="ad-banner-fixed" />
        </div>
      </div>
    </aside>
  )
}

// check if device is mobile to skip heavy animations
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

export default function HomePage() {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-background">
      {/* background animation only on desktop */}
      {mounted && !isMobile && (
        <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
          <PixelBlast color="hsl(var(--accent))" />
        </div>
      )}

      {/* hero section */}
      <section className="relative z-10 w-full animate-fade-in" aria-labelledby="hero-heading">
        <Suspense fallback={<SectionSkeleton />}>
          <ModernLanding />
        </Suspense>
      </section>

      {/* ad banner */}
      <Suspense fallback={null}>
        <AdBanner />
      </Suspense>

      {/* main content */}
      <div className="relative z-10 space-y-16 sm:space-y-20 lg:space-y-24 pb-16 sm:pb-20 lg:pb-24">
        <section className="w-full scroll-mt-16" id="levels" aria-labelledby="levels-heading">
          <Suspense fallback={<SectionSkeleton />}>
            <CFLevels />
          </Suspense>
        </section>

        <section className="w-full scroll-mt-16" id="how-it-works" aria-labelledby="how-it-works-heading">
          <Suspense fallback={<SectionSkeleton />}>
            <HowItWorks />
          </Suspense>
        </section>

        <section className="w-full scroll-mt-16" id="features" aria-labelledby="features-heading">
          <Suspense fallback={<SectionSkeleton />}>
            <PlatformFeatures />
          </Suspense>
        </section>
      </div>
    </main>
  )
}
