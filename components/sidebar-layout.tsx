"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth/auth-button"
import { Header } from "@/components/header"
import { useCFVerification } from "@/lib/context/cf-verification"
import { 
  BarChart3,
  Target,
  BookOpen,
  Trophy,
  Users,
  PieChart,
  Settings,
  User,
  Code2,
  Calendar
} from "lucide-react"

const menuItems = [
  { href: "/", label: "Today", icon: Calendar },
  { href: "/adaptive-sheet", label: "Adaptive Sheet", icon: Target },
  { href: "/paths", label: "Learning Path", icon: BookOpen },
  { href: "/contests", label: "Contests", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/visualizers", label: "Visualizers", icon: PieChart },
  { href: "/groups", label: "Groups", icon: Users },
]

const bottomMenuItems = [
  { href: "/settings", label: "Profile & Settings", icon: Settings },
]

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isVerified, verificationData } = useCFVerification()

  return (
    <div className="flex min-h-screen bg-[#0B1020]">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 bg-[#0B1020] flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-[#2563EB]" />
            <span className="font-semibold text-lg tracking-tight text-white">
              AlgoRise
            </span>
          </Link>
        </div>

        {/* Menu - Scrollable */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          <div className="mb-6">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
              MENU
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          {/* CF Verification Status */}
          {isVerified && verificationData && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs font-medium text-green-400">CF-verified</span>
              </div>
              <p className="text-sm text-white/90">{verificationData.handle}</p>
              <p className="text-xs text-white/60">Rating: {verificationData.rating}</p>
            </div>
          )}

          {/* Bottom Menu Items */}
          <nav className="space-y-1 mb-4">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-sm text-white/90">Ready to solve problems</span>
          </div>

          {/* Auth Button */}
          <div className="mt-4">
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Enhanced Header */}
        <Header />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          {children}
        </main>
      </div>
    </div>
  )
}