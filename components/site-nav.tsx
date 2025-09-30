"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AuthButton } from "@/components/auth/auth-button"
import { useCFVerification } from "@/lib/context/cf-verification"

const links = [
  { href: "/train", label: "Train" },
  { href: "/paths", label: "Learning Paths" },
  { href: "/adaptive-sheet", label: "Adaptive Sheet" },
  { href: "/contests", label: "Contests" },
  { href: "/groups", label: "Groups" },
  { href: "/analytics", label: "Analytics" },
  { href: "/visualizers", label: "Visualizers" },
]

import { useState } from "react"

export function SiteNav() {
  const pathname = usePathname()
  const { isVerified, verificationData } = useCFVerification()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Mobile nav toggle
  const MobileNavToggle = () => (
    <button
      className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-colors"
      aria-label="Open navigation menu"
      tabIndex={0}
      onClick={() => setMobileNavOpen(true)}
    >
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="25" y2="12" /><line x1="3" y1="6" x2="25" y2="6" /><line x1="3" y1="18" x2="25" y2="18" /></svg>
    </button>
  )

  // Overlay for mobile nav
  const MobileNavOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 md:hidden",
        mobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      aria-hidden={!mobileNavOpen}
      onClick={() => setMobileNavOpen(false)}
    />
  )

  // Mobile nav drawer
  const MobileNavDrawer = () => (
    <nav
      className={cn(
        "fixed z-50 top-0 left-0 w-64 h-full bg-[#0B1020] border-r border-white/10 flex flex-col p-6 gap-6 transform transition-transform duration-200 ease-in-out md:hidden",
        mobileNavOpen ? "translate-x-0" : "-translate-x-full"
      )}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="font-semibold text-lg tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]" onClick={() => setMobileNavOpen(false)}>
          AlgoRise
        </Link>
        <button
          className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-colors"
          aria-label="Close navigation menu"
          tabIndex={0}
          onClick={() => setMobileNavOpen(false)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {links.map((l) => {
          const active = pathname?.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-2 rounded-lg text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]",
                active
                  ? "bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              tabIndex={0}
              onClick={() => setMobileNavOpen(false)}
            >
              {l.label}
            </Link>
          )
        })}
      </div>
      <div className="mt-auto flex flex-col gap-3">
        {isVerified && verificationData && (
          <span
            className="inline-flex items-center rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/30"
            aria-label={`CF verified as ${verificationData.handle}`}
            title={`CF-verified: ${verificationData.handle} (${verificationData.rating})`}
          >
            CF-verified: {verificationData.handle}
          </span>
        )}
        <Button className="bg-[#2563EB] hover:bg-[#1D4FD8] w-full" asChild>
          <Link href="/train" tabIndex={0} onClick={() => setMobileNavOpen(false)}>Start Daily Training</Link>
        </Button>
        <AuthButton />
      </div>
    </nav>
  )

  return (
    <header className="w-full border-b border-white/10 bg-[#0B1020]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0B1020]/60 sticky top-0 z-30">
      {MobileNavOverlay()}
      {MobileNavDrawer()}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-6">
          {MobileNavToggle()}
          <Link href="/" className="font-semibold tracking-tight text-white text-base md:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]">
            AlgoRise
            <span className="sr-only">AlgoRise Home</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 lg:gap-4">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]",
                    active
                      ? "bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20 shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                  tabIndex={0}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {isVerified && verificationData && (
            <span
              className="hidden sm:inline-flex items-center rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/30"
              aria-label={`CF verified as ${verificationData.handle}`}
              title={`CF-verified: ${verificationData.handle} (${verificationData.rating})`}
            >
              CF-verified: {verificationData.handle}
            </span>
          )}
          <Button className="bg-[#2563EB] hover:bg-[#1D4FD8] hidden sm:inline-flex" asChild>
            <Link href="/train" tabIndex={0}>Start Daily Training</Link>
          </Button>
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
