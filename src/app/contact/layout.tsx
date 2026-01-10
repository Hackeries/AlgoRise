import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | AlgoRise',
  description:
    'Get in touch with the AlgoRise team. We typically respond within 24-48 hours.',
  openGraph: {
    title: 'Contact AlgoRise',
    description: 'Have questions? Reach out to the AlgoRise team.',
    type: 'website',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
