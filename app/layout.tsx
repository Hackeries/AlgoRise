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

// Metadata for SEO, social, PWA
export const metadata: Metadata = {
  title: 'AlgoRise - Master Competitive Programming',
  description:
    'Practice that adapts. Compete when it counts. Master algorithms and data structures with personalized learning paths.',
  generator: 'Next.js',
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
  openGraph: {
    title: 'AlgoRise - Master Competitive Programming',
    description:
      'Practice that adapts. Compete when it counts. Master algorithms and data structures with personalized learning paths.',
    type: 'website',
    siteName: 'AlgoRise',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlgoRise - Master Competitive Programming',
    description: 'Practice that adapts. Compete when it counts.',
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${bricolage.variable} antialiased`}
    >
      <head>
        <link rel='manifest' href='/manifest.json' />
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
      </head>
      <body className='min-h-dvh bg-background text-foreground font-sans theme-transition'>
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