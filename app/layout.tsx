import type React from 'react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SidebarLayout } from '@/components/sidebar-layout';
import { FloatingBugReport } from '@/components/floating-bug-report';
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { PWARegister } from '@/components/pwa/register';
import { AuthProvider } from '@/lib/auth/context';
import { CFVerificationProvider } from '@/lib/context/cf-verification';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';

// Google Fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: 'AlgoRise - Master Competitive Programming & Algorithms',
  description:
    'Practice that adapts. Compete when it counts. Master algorithms and data structures with personalized learning paths, real-time contests, and AI-powered analytics.',
  keywords: [
    'competitive programming',
    'algorithms',
    'data structures',
    'coding practice',
    'online judge',
    'codeforces',
    'programming contests',
    'algorithm learning',
    'coding interview prep',
    'DSA practice',
  ],
  authors: [{ name: 'AlgoRise Team' }],
  creator: 'AlgoRise',
  publisher: 'AlgoRise',
  generator: 'Next.js',
  referrer: 'strict-origin-when-cross-origin',
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2306B6D4'/><stop offset='50%25' stop-color='%238B5CF6'/><stop offset='100%25' stop-color='%23EC4899'/></linearGradient><filter id='glow'><feGaussianBlur stdDeviation='2' result='coloredBlur'/><feMerge><feMergeNode in='coloredBlur'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs><g transform='translate(50,50)'><circle cx='0' cy='0' r='42' stroke='url(%23g)' stroke-width='2.5' opacity='0.4' fill='none'/><circle cx='0' cy='-16' r='5.5' fill='%2363EDA1' filter='url(%23glow)'/><line x1='0' y1='-10' x2='-16' y2='8' stroke='%2306B6D4' stroke-width='4' stroke-linecap='round' filter='url(%23glow)'/><circle cx='-16' cy='8' r='5' fill='%2306B6D4' filter='url(%23glow)'/><line x1='-16' y1='13' x2='-24' y2='22' stroke='%2306B6D4' stroke-width='3' stroke-linecap='round' opacity='0.8'/><circle cx='-24' cy='22' r='4' fill='%230EA5E9'/><line x1='-16' y1='13' x2='-8' y2='22' stroke='%2306B6D4' stroke-width='3' stroke-linecap='round' opacity='0.8'/><circle cx='-8' cy='22' r='4' fill='%230EA5E9'/><line x1='0' y1='-10' x2='16' y2='8' stroke='%238B5CF6' stroke-width='4' stroke-linecap='round' filter='url(%23glow)'/><circle cx='16' cy='8' r='5' fill='%238B5CF6' filter='url(%23glow)'/><line x1='16' y1='13' x2='8' y2='22' stroke='%238B5CF6' stroke-width='3' stroke-linecap='round' opacity='0.8'/><circle cx='8' cy='22' r='4' fill='%23A855F7'/><line x1='16' y1='13' x2='24' y2='22' stroke='%238B5CF6' stroke-width='3' stroke-linecap='round' opacity='0.8'/><circle cx='24' cy='22' r='4' fill='%23EC4899'/><path d='M 0,-24 L 0,-32 M -4,-28 L 0,-32 L 4,-28' stroke='%23FBBF24' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round' filter='url(%23glow)'/><circle cx='0' cy='0' r='46' stroke='url(%23g)' stroke-width='1' opacity='0.2' fill='none'/></g></svg>",
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2306B6D4'/><stop offset='50%25' stop-color='%238B5CF6'/><stop offset='100%25' stop-color='%23EC4899'/></linearGradient><filter id='glow'><feGaussianBlur stdDeviation='2' result='coloredBlur'/><feMerge><feMergeNode in='coloredBlur'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs><g transform='translate(50,50)'><circle cx='0' cy='0' r='42' stroke='url(%23g)' stroke-width='2.5' opacity='0.4' fill='none'/><circle cx='0' cy='-16' r='5.5' fill='%2363EDA1' filter='url(%23glow)'/><line x1='0' y1='-10' x2='-16' y2='8' stroke='%2306B6D4' stroke-width='4' stroke-linecap='round' filter='url(%23glow)'/><circle cx='-16' cy='8' r='5' fill='%2306B6D4' filter='url(%23glow)'/><line x1='-16' y1='13' x2='-24' y2='22' stroke='%2306B6D4' stroke-width='3' stroke-linecap='round' opacity='0.8'/><circle cx='-24' cy='22' r='4' fill='%230EA5E9'/><line x1='-16' y1='13' x2='-8' y2='22' stroke='%2306B6D4' stroke-width='3' stroke-linecap='round' opacity='0.8'/><circle cx='-8' cy='22' r='4' fill='%230EA5E9'/><line x1='0' y1='-10' x2='16' y2='8' stroke='%238B5CF6' stroke-width='4' stroke-linecap='round' filter='url(%23glow)'/><circle cx='16' cy='8' r='5' fill='%238B5CF6' filter='url(%23glow)'/><line x1='16' y1='13' x2='8' y2='22' stroke='%238B5CF6' stroke-width='3' stroke-linecap='round' opacity='0.8'/><circle cx='8' cy='22' r='4' fill='%23A855F7'/><line x1='16' y1='13' x2='24' y2='22' stroke='%238B5CF6' stroke-width='3' stroke-linecap='round' opacity='0.8'/><circle cx='24' cy='22' r='4' fill='%23EC4899'/><path d='M 0,-24 L 0,-32 M -4,-28 L 0,-32 L 4,-28' stroke='%23FBBF24' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round' filter='url(%23glow)'/><circle cx='0' cy='0' r='46' stroke='url(%23g)' stroke-width='1' opacity='0.2' fill='none'/></g></svg>",
        sizes: '180x180',
      },
    ],
  },
  manifest: '/manifest.json',
  applicationName: 'AlgoRise',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AlgoRise',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'AlgoRise - Master Competitive Programming & Algorithms',
    description:
      'Practice that adapts. Compete when it counts. Master algorithms and data structures with personalized learning paths.',
    type: 'website',
    siteName: 'AlgoRise',
    locale: 'en_US',
    url: 'https://www.myalgorise.in',
    images: [
      {
        url: 'https://www.myalgorise.in/icon.jpg',
        width: 1200,
        height: 630,
        alt: 'AlgoRise - Master Competitive Programming',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlgoRise - Master Competitive Programming & Algorithms',
    description: 'Practice that adapts. Compete when it counts.',
    creator: '@AlgoRise',
    images: ['https://www.myalgorise.in/icon.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'FzQ8R74xq-NjMuu3KFbCtufhcXytBa9CPIO2lRZFx7A',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${bricolage.variable} antialiased`}
    >
      <head>
        <link rel='manifest' href='/manifest.json' />
        <link rel='canonical' href='https://www.myalgorise.in' />
        <meta
          name='theme-color'
          media='(prefers-color-scheme: light)'
          content='#0084FF'
        />
        <meta
          name='theme-color'
          media='(prefers-color-scheme: dark)'
          content='#0a0a0a'
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'AlgoRise',
              description:
                'Master competitive programming with adaptive practice, real-time contests, and AI-powered analytics.',
              url: 'https://www.myalgorise.in',
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
      </head>
      <body
        suppressHydrationWarning
        className='min-h-dvh bg-background text-foreground font-sans theme-transition'
      >
        <ErrorBoundary>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            <AuthProvider>
              <CFVerificationProvider>
                <SidebarLayout>
                  <Suspense fallback={null}>{children}</Suspense>
                </SidebarLayout>
                <FloatingBugReport />
                <Toaster />
                <PWARegister />
                <Analytics />
              </CFVerificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}