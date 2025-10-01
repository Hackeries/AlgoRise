"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
    <div className="flex flex-col min-h-screen bg-[#0B1020]">
      <Header />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0B1020] flex flex-col h-[calc(100vh-theme(spacing.16))]">
          {/* Menu - Scrollable */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
            <div className="mb-6">
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
          </div>
        </div>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 h-[calc(100vh-theme(spacing.16))]">
          {children}
        </main>
      </div>
    </div>
  )
}