"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AuthButton } from "@/components/auth/auth-button"

const links = [
  { href: "/train", label: "Train" },
  { href: "/paths", label: "Learning Paths" },
  { href: "/adaptive-sheet", label: "Adaptive Sheet" },
  { href: "/contests", label: "Contests" },
  { href: "/groups", label: "Groups" },
  { href: "/analytics", label: "Analytics" },
  { href: "/visualizers", label: "Visualizers" },
]

export function SiteNav() {
  const pathname = usePathname()

  return (
    <header className="w-full border-b border-white/10 bg-[#0B1020]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0B1020]/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            AlgoRise
            <span className="sr-only">AlgoRise Home</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn("text-sm text-white/80 hover:text-white transition-colors", active && "text-white")}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30"
            aria-label="CF verified handles available"
            title="CF-verified handles"
          >
            CF-verified
          </span>
          <Button className="bg-[#2563EB] hover:bg-[#1D4FD8]" asChild>
            <Link href="/train">Start Daily Training</Link>
          </Button>
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
