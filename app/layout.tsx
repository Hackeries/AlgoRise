import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { PWARegister } from "@/components/pwa/register"
import { AuthProvider } from "@/lib/auth/context"
import { CFVerificationProvider } from "@/lib/context/cf-verification"
import { ThemeProvider } from "@/components/theme-provider"

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
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
})

export const metadata: Metadata = {
  title: "AlgoRise",
  description: "Practice that adapts. Compete when it counts.",
  generator: "v0.app",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${bricolage.variable} antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
      </head>
      <body className="min-h-dvh bg-background text-foreground font-sans theme-transition">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CFVerificationProvider>
              <SidebarLayout>
                <Suspense fallback={null}>{children}</Suspense>
              </SidebarLayout>
              <Toaster />
              <PWARegister />
              <Analytics />
            </CFVerificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
