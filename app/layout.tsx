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
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icon.jpg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.jpg', sizes: '180x180' }],
    shortcut: [{ url: '/favicon.ico' }],
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
    url: 'https://myalgorise.in',
    images: [
      {
        url: 'https://myalgorise.in/og-image.jpg',
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
    images: ['https://myalgorise.in/og-image.jpg'],
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
    google: 'JCWa22q5nbSX6y2DXX2AmDvufYj1CXzxngGGOZIXOqA',
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
        <link rel='canonical' href='https://myalgorise.in' />
        <meta
          name='theme-color'
          media='(prefers-color-scheme: light)'
          content='#06B6D4'
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
              url: 'https://myalgorise.in',
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
      </body>
    </html>
  );
}
