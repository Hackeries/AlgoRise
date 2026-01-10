import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About AlgoRise | Competitive Programming Platform',
  description:
    'Learn about AlgoRise - the adaptive competitive programming platform helping programmers level up through structured, personalized practice.',
  openGraph: {
    title: 'About AlgoRise',
    description:
      'Helping competitive programmers level up through structured, adaptive practice',
    type: 'website',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
