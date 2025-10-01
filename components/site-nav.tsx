"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/auth/auth-button";
import { useCFVerification } from "@/lib/context/cf-verification";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/train", label: "Train" },
  { href: "/paths", label: "Learning Paths" },
  { href: "/adaptive-sheet", label: "Adaptive Sheet" },
  { href: "/contests", label: "Contests" },
  { href: "/groups", label: "Groups" },
  { href: "/analytics", label: "Analytics" },
  { href: "/visualizers", label: "Visualizers" },
];

export function SiteNav() {
  const pathname = usePathname();
  const { isVerified, verificationData } = useCFVerification();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B1020]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0B1020]/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
        >
          AlgoRise
          <span className="sr-only">AlgoRise Home</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative text-sm text-white/70 hover:text-white transition-colors",
                  active && "text-white font-medium"
                )}
              >
                {l.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isVerified && verificationData && (
            <span
              className="hidden sm:inline-flex items-center rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/30"
              title={`CF-verified: ${verificationData.handle} (${verificationData.rating})`}
            >
              ✅ {verificationData.handle}
            </span>
          )}
          <Button
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20"
            asChild
          >
            <Link href="/train">Start Training</Link>
          </Button>
          <AuthButton />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-[#0B1020] border-t border-white/10 p-4 space-y-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block text-white/80 hover:text-white transition-colors",
                pathname?.startsWith(l.href) && "text-white font-medium"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
