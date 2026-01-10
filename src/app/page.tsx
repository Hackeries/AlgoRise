'use client'

import { Suspense } from 'react'
import PlatformFeatures from '@/components/landing/platform-features'
import HowItWorks from '@/components/landing/how-it-works'
import ModernLanding from '@/components/landing-hero'
import CFLevels from '@/components/landing/cf-levels'
import ProductShowcase from '@/components/landing/product-showcase'
import StatsSection from '@/components/landing/stats-section'

function SectionSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-64 bg-muted/20 rounded-lg" />
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-background">
      {/* Hero Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <ModernLanding />
      </Suspense>

      {/* Stats / Social Proof */}
      <Suspense fallback={<SectionSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Product Showcase Carousel */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProductShowcase />
      </Suspense>

      {/* Codeforces Level Roadmap */}
      <Suspense fallback={<SectionSkeleton />}>
        <CFLevels />
      </Suspense>

      {/* How It Works */}
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorks />
      </Suspense>

      {/* Features */}
      <Suspense fallback={<SectionSkeleton />}>
        <PlatformFeatures />
      </Suspense>
    </main>
  )
}
