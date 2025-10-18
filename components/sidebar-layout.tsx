"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCFVerification } from "@/lib/context/cf-verification"
import { Home, Zap, FileText, Trophy, BookOpen, Users, BarChart3, Cpu, Menu } from "lucide-react"

// ------------------ CF Rating System ------------------
const getCFTier = (rating: number) => {
  if (rating < 1200) return { label: "Newbie", color: "text-gray-400", bg: "bg-gray-800" }
  if (rating < 1400) return { label: "Pupil", color: "text-green-400", bg: "bg-green-900/40" }
  if (rating < 1600)
    return {
      label: "Specialist",
      color: "text-cyan-400",
      bg: "bg-cyan-900/40",
    }
  if (rating < 1900) return { label: "Expert", color: "text-blue-400", bg: "bg-blue-900/40" }
  if (rating < 2100)
    return {
      label: "Candidate Master",
      color: "text-purple-400",
      bg: "bg-purple-900/40",
    }
  if (rating < 2300)
    return {
      label: "Master",
      color: "text-orange-400",
      bg: "bg-orange-900/40",
    }
  if (rating < 2400)
    return {
      label: "International Master",
      color: "text-red-400",
      bg: "bg-red-900/40",
    }
  if (rating < 2600) return { label: "Grandmaster", color: "text-red-500", bg: "bg-red-900/40" }
  if (rating < 3000)
    return {
      label: "International GM",
      color: "text-red-600",
      bg: "bg-red-950/40",
    }
  return {
    label: "Legendary GM",
    color: "text-yellow-400",
    bg: "bg-yellow-900/40",
  }
}

// ------------------ Menu Items ------------------
const menuItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/train", label: "Train", icon: Zap },
  { href: "/adaptive-sheet", label: "Practice Problems", icon: FileText },
  { href: "/contests", label: "Contests", icon: Trophy },
  { href: "/paths", label: "Learning Paths", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/visualizers", label: "Visualizers", icon: Cpu },
  { href: "/groups", label: "Groups", icon: Users },
]

// ------------------ Sidebar Item ------------------
const SidebarItem = ({
  href,
  label,
  icon: Icon,
  isActive,
  isOpen,
  delay,
}: {
  href: string
  label: string
  icon: React.ElementType
  isActive: boolean
  isOpen: boolean
  delay: number
}) => (
  <Link
    href={href}
    title={!isOpen ? label : undefined}
    className={cn(
      "relative flex items-center rounded-lg transition-all duration-200 cursor-pointer group w-full overflow-hidden",
      // Enhanced mobile touch targets
      isOpen ? "p-3 justify-start gap-3" : "p-2 justify-center",
      isActive
        ? "bg-[#2563EB]/40 text-[#2563EB] shadow-glow"
        : "text-white/70 hover:text-white hover:bg-[#2563EB]/20 hover:scale-105 active:scale-95",
    )}
    style={{ 
      transitionDelay: `${delay}ms`,
      maxWidth: '100%'
    }}
    aria-current={isActive ? "page" : undefined}
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    {isOpen && (
      <span className="text-sm font-medium transition-opacity duration-200 select-none truncate flex-1">
        {label}
      </span>
    )}
  </Link>
)

const SidebarFooter = ({
  cfData,
  isOpen,
}: {
  cfData: any;
  isOpen: boolean;
}) => {
  if (!cfData) return null;
  const tier = getCFTier(cfData.rating);
  return (
    <div
      className={cn(
        'cursor-pointer transition-transform duration-150 hover:scale-105 flex items-center w-full overflow-hidden',
        isOpen ? 'gap-2' : 'justify-center' 
      )}
      title={`${cfData.handle} (${cfData.rating})`}
    >
      {isOpen ? (
        <div className={`p-3 rounded-xl border ${tier.bg} ${tier.color} w-full overflow-hidden`}>
          <p className='text-sm font-bold truncate'>{cfData.handle}</p>
          <p className='text-xs truncate'>
            {tier.label} · {cfData.rating}
          </p>
        </div>
      ) : (
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-full border ${tier.bg} ${tier.color} text-[10px] font-bold flex-shrink-0`}
        >
          {tier.label.split(' ')[0]}
        </div>
      )}
    </div>
  );
};


// ------------------ Sidebar Layout ------------------
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isVerified, verificationData } = useCFVerification()
  const [isOpen, setIsOpen] = useState(false) // Start closed on mobile
  const [isMobile, setIsMobile] = useState(false)
  const [cfData, setCfData] = useState(verificationData)

  // Handle mobile detection and responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  useEffect(() => {
    const fetchLatestCFData = async () => {
      if (verificationData?.handle) {
        try {
          const res = await fetch(`https://codeforces.com/api/user.info?handles=${verificationData.handle}`)
          const data = await res.json()
          if (data.status === "OK") {
            const user = data.result[0]
            setCfData({
              ...verificationData,
              rating: user.rating || 0,
              maxRating: user.maxRating || 0,
              rank: user.rank,
            })
          }
        } catch (err) {
          console.error("Failed to fetch CF data:", err)
        }
      }
    }
    fetchLatestCFData()
  }, [verificationData])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen) {
        const sidebar = document.querySelector('[data-sidebar]')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, isOpen])

  return (
    <div className='flex min-h-screen bg-background text-foreground'>
      <AnimatePresence>
        {/* Mobile Overlay - Removed blur for better performance */}
        {isMobile && isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        data-sidebar
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col bg-card/95 backdrop-blur-md border-r border-border/50 shadow-2xl',
          // Enhanced mobile styling
          isMobile 
            ? 'w-72' // Slightly wider on mobile for better touch targets
            : isOpen 
              ? 'w-64' 
              : 'w-16'
        )}
        initial={isMobile ? { x: -288 } : false}
        animate={
          isMobile 
            ? { x: isOpen ? 0 : -288 }
            : { width: isOpen ? 256 : 64 }
        }
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.3 
        }}
        style={{
          overflowX: 'hidden',
          overflowY: 'hidden'
        }}
      >
        {/* Hamburger - Enhanced for mobile */}
        <div
          className={cn(
            'flex items-center p-4 border-b border-border/30',
            isOpen ? 'justify-between' : 'justify-center'
          )}
        >
          {isOpen && isMobile && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">AR</span>
              </div>
              <span className="font-semibold text-foreground">AlgoRise</span>
            </div>
          )}
          
          <button
            className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors duration-200'
            onClick={() => setIsOpen(!isOpen)}
            aria-label='Toggle sidebar'
          >
            <Menu className='h-5 w-5' />
          </button>
        </div>

        {/* Menu - Enhanced spacing for mobile */}
        <nav className={cn(
          'flex-1 mt-4 overflow-x-hidden overflow-y-auto',
          isMobile ? 'px-3 space-y-1' : 'px-4 space-y-2'
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
        }}
        >
          {menuItems.map((item, idx) => (
            <SidebarItem
              key={item.href}
              {...item}
              isActive={
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href))
              }
              isOpen={isOpen}
              delay={idx * 30}
            />
          ))}
        </nav>

        {/* Footer */}
        {isVerified && (
          <div className={cn(
            'border-t border-border/30 flex flex-col items-start overflow-hidden',
            isMobile ? 'p-3' : 'p-4'
          )}>
            <div className="w-full overflow-hidden">
              <SidebarFooter cfData={cfData} isOpen={isOpen} />
            </div>
            
            {/* Mobile hint */}
            {isMobile && isOpen && (
              <motion.div 
                className="w-full mt-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1">
                  <span>Tap outside to close</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          // Mobile: no margin (sidebar overlays), Desktop: margin based on sidebar state
          isMobile 
            ? 'ml-0' 
            : isOpen 
              ? 'ml-64' 
              : 'ml-16'
        )}
      >
        <Header onMobileMenuToggle={() => setIsOpen(!isOpen)} isMobile={isMobile} />
        <main className='flex-1 overflow-y-auto p-2 sm:p-4'>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
