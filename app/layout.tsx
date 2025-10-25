import type { Metadata } from 'next';
import Script from 'next/script';
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

// Fonts
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
    'codeforces',
    'leetcode',
    'ICPC',
    'coding practice',
  ],
  authors: [{ name: 'AlgoRise Team' }],
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AlgoRise',
  },
  openGraph: {
    title: 'AlgoRise - Master Competitive Programming',
    description: 'Practice that adapts. Compete when it counts.',
    url: 'https://www.myalgorise.in',
    siteName: 'AlgoRise',
    images: [
      {
        url: 'https://www.myalgorise.in/icon.webp',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlgoRise - Master Competitive Programming',
    description: 'Practice that adapts. Compete when it counts.',
    images: ['https://www.myalgorise.in/icon.webp'],
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${bricolage.variable}`}
    >
      <head>
        <link rel='canonical' href='https://www.myalgorise.in' />

        {/* Google AdSense */}
        <Script
          id='adsense'
          async
          strategy='afterInteractive'
          src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3173433370339000'
          crossOrigin='anonymous'
        />

        {/* AdSense Transparency Fix */}
        <style>
          {`
            ins.adsbygoogle,
            .adsbygoogle,
            .adsbygoogle iframe {
              background: transparent !important;
            }
            ins.adsbygoogle[data-ad-status="unfilled"] {
              display: none !important;
            }
          `}
        </style>

        {/* Structured Data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'AlgoRise',
              url: 'https://www.myalgorise.in',
              applicationCategory: 'EducationalApplication',
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
        className='min-h-screen bg-background text-foreground antialiased'
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
