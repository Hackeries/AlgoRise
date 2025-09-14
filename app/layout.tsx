import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { SiteNav } from "@/components/site-nav"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { PWARegister } from "@/components/pwa/register"
import { AuthProvider } from "@/lib/auth/context"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "AlgoRise",
  description: "Practice that adapts. Compete when it counts.",
  generator: "v0.app",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1020" />
      </head>
      <body className="min-h-dvh bg-[#0B1020] text-white font-sans">
        <AuthProvider>
          <SiteNav />
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
          <PWARegister />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
