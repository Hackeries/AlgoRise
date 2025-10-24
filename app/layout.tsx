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
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stopColor='%2300D9FF'/><stop offset='100%' stopColor='%2300B8D4'/></linearGradient></defs><path d='M 12 48 L 28 12 L 32 12 L 48 48 M 20 32 L 40 32' stroke='url(%23g)' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/><path d='M 36 12 L 52 12 Q 56 12 56 18 Q 56 24 52 24 L 36 24 M 52 24 L 56 48' stroke='url(%23g)' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/><circle cx='20' cy='56' r='2' fill='url(%23g)'/><circle cx='44' cy='56' r='2' fill='url(%23g)'/></svg>",
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stopColor='%2300D9FF'/><stop offset='100%' stopColor='%2300B8D4'/></linearGradient></defs><path d='M 12 48 L 28 12 L 32 12 L 48 48 M 20 32 L 40 32' stroke='url(%23g)' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/><path d='M 36 12 L 52 12 Q 56 12 56 18 Q 56 24 52 24 L 36 24 M 52 24 L 56 48' stroke='url(%23g)' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/><circle cx='20' cy='56' r='2' fill='url(%23g)'/><circle cx='44' cy='56' r='2' fill='url(%23g)'/></svg>",
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
        url: 'https://www.myalgorise.in/icon.webp',
        width: 1200,
        height: 630,
        alt: 'AlgoRise - Master Competitive Programming',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlgoRise - Master Competitive Programming & Algorithms',
    description: 'Practice that adapts. Compete when it counts.',
    creator: '@AlgoRise',
    images: ['https://www.myalgorise.in/icon.webp'],
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
        className='min-h-dvh bg-background text-foreground font-sans theme-transition antialiased selection:bg-primary selection:text-primary-foreground'
      >
        <ErrorBoundary>
          <ThemeProvider>
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