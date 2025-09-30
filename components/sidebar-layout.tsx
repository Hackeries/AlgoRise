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
  Code2,
  Calendar
} from "lucide-react"
import { motion } from "framer-motion"
// Responsive sidebar toggle
import { useState } from "react"

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Responsive sidebar toggle button
  const SidebarToggle = () => (
    <button
      className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
      aria-label="Open sidebar"
      onClick={() => setSidebarOpen(true)}
    >
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
    </button>
  )

  // Overlay for mobile sidebar
  const SidebarOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
        sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setSidebarOpen(false)}
    />
  )

  // Sidebar content
  // Sidebar content for both desktop and mobile
  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
    closed: { x: "-100%", opacity: 0, transition: { type: "spring" as const, stiffness: 300, damping: 35 } },
  }

  // Desktop: always visible, no animation. Mobile: animate in/out.
  const SidebarContent = (
    <div className="w-64 border-r border-white/10 bg-[#0B1020] flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Code2 className="h-6 w-6 text-[#2563EB] group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-lg tracking-tight text-white group-hover:text-[#2563EB] transition-colors">AlgoRise</span>
        </Link>
        {/* Close button for mobile */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </motion.button>
      </div>

      {/* Menu - Scrollable */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
        <div className="mb-6">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">MENU</p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
              return (
                <motion.li
                  key={item.href}
                  initial={false}
                  animate={isActive ? { scale: 1.04 } : { scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative"
                  style={{ zIndex: 1 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group border border-transparent relative overflow-hidden",
                      isActive
                        ? "text-[#2563EB] border-[#2563EB]/50 shadow"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20"
                    )}
                    style={{ zIndex: 2 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bg"
                        className="absolute inset-0 rounded-lg bg-[#2563EB]/15"
                        style={{ zIndex: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <Icon className={cn("h-4 w-4 transition-colors z-10", isActive ? "text-[#2563EB]" : "text-white/60 group-hover:text-white")} />
                    <span className="transition-colors z-10">{item.label}</span>
                  </Link>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        {/* CF Verification Status */}
        {isVerified && verificationData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-medium text-green-400">CF-verified</span>
            </div>
            <p className="text-sm text-white/90">{verificationData.handle}</p>
            <p className="text-xs text-white/60">Rating: {verificationData.rating}</p>
          </motion.div>
        )}

        {/* Bottom Menu Items */}
        <nav className="space-y-1 mb-4">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            return (
              <motion.div
                key={item.href}
                initial={false}
                animate={isActive ? { scale: 1.04 } : { scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
                style={{ zIndex: 1 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group border border-transparent relative overflow-hidden",
                    isActive
                      ? "text-[#2563EB] border-[#2563EB]/20 shadow"
                      : "text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20"
                  )}
                  style={{ zIndex: 2 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-lg bg-[#2563EB]/15"
                      style={{ zIndex: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon className={cn("h-4 w-4 transition-colors z-10", isActive ? "text-[#2563EB]" : "text-white/60 group-hover:text-white")} />
                  <span className="transition-colors z-10">{item.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* User Status */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm text-white/90">Ready to solve problems</span>
        </motion.div>

        {/* Auth Button */}
        <div className="mt-4">
          <AuthButton />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0B1020]">
      {/* Sidebar for desktop & mobile */}
      {/* Mobile sidebar overlay */}
      {/* Only show overlay and animation for mobile */}
      <motion.div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        initial={false}
        animate={sidebarOpen ? { opacity: 1, pointerEvents: "auto" } : { opacity: 0, pointerEvents: "none" }}
        transition={{ duration: 0.2 }}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar drawer for mobile, static for desktop */}
      <aside
        className={cn(
          "h-full",
          "fixed z-50 inset-y-0 left-0 md:static md:translate-x-0 transition-transform duration-200 ease-in-out"
        )}
        aria-label="Sidebar"
      >
        {/* Mobile: animate sidebar, Desktop: static */}
        <div className="hidden md:block h-full">
          {SidebarContent}
        </div>
        <motion.div
          className="block md:hidden h-full"
          initial={false}
          animate={sidebarOpen ? "open" : "closed"}
          variants={sidebarVariants}
          style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "16rem" }}
        >
          {SidebarContent}
        </motion.div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Enhanced Header */}
        <div className="flex items-center h-14 px-4 border-b border-white/10 bg-[#0B1020]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0B1020]/60 md:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </motion.button>
          <span className="ml-3 font-semibold text-lg tracking-tight text-white">AlgoRise</span>
        </div>
        <Header />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          {children}
        </main>
      </div>
    </div>
  )
}