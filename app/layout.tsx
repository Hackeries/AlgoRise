import type React from 'react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

import { PWARegister } from '@/components/pwa/register';
import { AuthProvider } from '@/lib/auth/context';
import { CFVerificationProvider } from '@/lib/context/cf-verification';
import { ToastContainer } from 'react-toastify';

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
  title: 'AlgoRise',
  description: 'Practice that adapts. Compete when it counts.',
  generator: 'v0.app',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='en'
      className={`${inter.variable} ${jetbrainsMono.variable} ${bricolage.variable} dark antialiased`}
    >
      <head>
        <link rel='manifest' href='/manifest.json' />
        <meta name='theme-color' content='#0B1020' />
      </head>
      <body className='min-h-dvh bg-[#0B1020] text-white font-sans'>
        <AuthProvider>
          <CFVerificationProvider>
            <SidebarLayout>
              <Suspense fallback={null}>{children}</Suspense>
            </SidebarLayout>
        <ToastContainer
              position='bottom-right'
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme='dark'
            />
            <PWARegister />
            <Analytics />
          </CFVerificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
