'use client';

import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useCFVerification } from '@/lib/context/cf-verification';
import {
  Home,
  Zap,
  FileText,
  Trophy,
  BookOpen,
  Users,
  BarChart3,
  Cpu,
  Menu,
  TestTube,
  Sword,
  X,
} from 'lucide-react';

// ==================== TYPES ====================
interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface CFTier {
  label: string;
  color: string;
  bg: string;
}

interface CFData {
  handle: string;
  rating: number;
  maxRating?: number;
  rank?: string;
}

// ==================== CONSTANTS ====================
const MENU_ITEMS: MenuItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/train', label: 'Train', icon: Zap },
  { href: '/adaptive-sheet', label: 'Practice', icon: FileText },
  { href: '/contests', label: 'Contests', icon: Trophy },
  { href: '/battle-arena', label: 'Battle Arena', icon: Sword },
  { href: '/paths', label: 'Learning Paths', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/visualizers', label: 'Visualizers', icon: Cpu },
  { href: '/groups', label: 'Groups', icon: Users },
];

const RATING_TIERS: Record<string, string> = {
  'Candidate Master': 'CM',
  'International Master': 'IM',
  'International GM': 'IGM',
  'Legendary GM': 'LGM',
  Grandmaster: 'GM',
};

const MOBILE_BREAKPOINT = 768;
const SIDEBAR_WIDTH_OPEN = 256;
const SIDEBAR_WIDTH_CLOSED = 64;
const SIDEBAR_WIDTH_MOBILE = 280;

// ==================== UTILITIES ====================
const getRatingAbbreviation = (label: string): string => {
  return RATING_TIERS[label] || label.split(' ')[0];
};

const getCFTier = (rating: number): CFTier => {
  if (rating < 1200) {
    return {
      label: 'Newbie',
      color: 'text-gray-400',
      bg: 'bg-gray-900/20 border-gray-700/50',
    };
  }
  if (rating < 1400) {
    return {
      label: 'Pupil',
      color: 'text-green-400',
      bg: 'bg-green-900/20 border-green-700/50',
    };
  }
  if (rating < 1600) {
    return {
      label: 'Specialist',
      color: 'text-cyan-400',
      bg: 'bg-cyan-900/20 border-cyan-700/50',
    };
  }
  if (rating < 1900) {
    return {
      label: 'Expert',
      color: 'text-blue-400',
      bg: 'bg-blue-900/20 border-blue-700/50',
    };
  }
  if (rating < 2100) {
    return {
      label: 'Candidate Master',
      color: 'text-purple-400',
      bg: 'bg-purple-900/20 border-purple-700/50',
    };
  }
  if (rating < 2300) {
    return {
      label: 'Master',
      color: 'text-orange-400',
      bg: 'bg-orange-900/20 border-orange-700/50',
    };
  }
  if (rating < 2400) {
    return {
      label: 'International Master',
      color: 'text-red-400',
      bg: 'bg-red-900/20 border-red-700/50',
    };
  }
  if (rating < 2600) {
    return {
      label: 'Grandmaster',
      color: 'text-red-500',
      bg: 'bg-red-900/30 border-red-700/60',
    };
  }
  if (rating < 3000) {
    return {
      label: 'International GM',
      color: 'text-red-600',
      bg: 'bg-red-950/30 border-red-800/60',
    };
  }
  return {
    label: 'Legendary GM',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30 border-yellow-700/60',
  };
};

// ------------------ Menu Items ------------------
const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/train', label: 'Train', icon: Zap },
  { href: '/problem-generator', label: 'Problem Generator', icon: TestTube },
  { href: '/adaptive-sheet', label: 'Practice Problems', icon: FileText },
  { href: '/contests', label: 'Contests', icon: Trophy },
  { href: '/battle-arena', label: 'Battle Arena', icon: Sword },
  { href: '/paths', label: 'Learning Paths', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/visualizers', label: 'Visualizers', icon: Cpu },
  { href: '/groups', label: 'Groups', icon: Users },
];

// Sidebar Item Component
const SidebarItem = React.memo<{
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isOpen: boolean;
  onClick?: () => void;
}>(({ href, label, icon: Icon, isActive, isOpen, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      'group relative flex items-center rounded-xl transition-all duration-200',
      'hover:scale-[1.02] active:scale-95',
      isOpen ? 'px-3 py-3 gap-3' : 'p-3 justify-center',
      isActive
        ? 'bg-primary/15 text-primary shadow-lg shadow-primary/20'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
    )}
    aria-current={isActive ? 'page' : undefined}
    title={!isOpen ? label : undefined}
  >
    {/* Active indicator */}
    {isActive && (
      <motion.div
        layoutId='activeTab'
        className='absolute inset-0 bg-primary/10 rounded-xl'
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    )}

    <Icon
      className={cn(
        'h-5 w-5 flex-shrink-0 relative z-10',
        isActive && 'drop-shadow-[0_0_8px_currentColor]'
      )}
    />

    <AnimatePresence>
      {isOpen && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className='text-sm font-medium truncate relative z-10'
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>

    {/* Hover glow effect */}
    {!isActive && (
      <div className='absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 to-transparent' />
    )}
  </Link>
));

SidebarItem.displayName = 'SidebarItem';

// CF Badge Component
const CFBadge = React.memo<{
  cfData: CFData;
  isOpen: boolean;
}>(({ cfData, isOpen }) => {
  const tier = useMemo(() => getCFTier(cfData.rating), [cfData.rating]);
  const displayLabel = useMemo(
    () => (isOpen ? tier.label : getRatingAbbreviation(tier.label)),
    [tier.label, isOpen]
  );

  if (isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-4 rounded-xl border-2 backdrop-blur-sm',
          'transition-all duration-300 hover:scale-[1.02]',
          tier.bg,
          tier.color
        )}
      >
        <div className='flex items-center justify-between mb-2'>
          <p className='text-sm font-bold truncate'>{cfData.handle}</p>
          <div className='px-2 py-0.5 rounded-md bg-background/30 backdrop-blur-sm'>
            <span className='text-xs font-mono'>{cfData.rating}</span>
          </div>
        </div>
        <p className='text-xs opacity-80 truncate'>{tier.label}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'w-14 h-14 flex items-center justify-center rounded-xl border-2',
        'transition-all duration-300 backdrop-blur-sm',
        tier.bg,
        tier.color,
        'text-xs font-bold'
      )}
      title={`${cfData.handle} (${cfData.rating}) - ${tier.label}`}
    >
      {displayLabel}
    </motion.div>
  );
});

CFBadge.displayName = 'CFBadge';

// ==================== MAIN COMPONENT ====================
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isVerified, verificationData } = useCFVerification();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [cfData, setCfData] = useState<CFData | null>(verificationData);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch latest CF data
  useEffect(() => {
    if (!verificationData?.handle) return;

    const fetchCFData = async () => {
      try {
        const res = await fetch(
          `https://codeforces.com/api/user.info?handles=${verificationData.handle}`,
          { cache: 'no-store' }
        );
        const data = await res.json();

        if (data.status === 'OK') {
          const user = data.result[0];
          setCfData({
            handle: verificationData.handle,
            rating: user.rating || 0,
            maxRating: user.maxRating || 0,
            rank: user.rank,
          });
        }
      } catch (error) {
        console.error('Failed to fetch CF data:', error);
      }
    };

    fetchCFData();
  }, [verificationData]);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.querySelector('[data-sidebar]');
      const target = e.target as Node;

      if (sidebar && !sidebar.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);

  const sidebarWidth = useMemo(() => {
    if (isMobile) return SIDEBAR_WIDTH_MOBILE;
    return isOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED;
  }, [isMobile, isOpen]);

  return (
    <div className='flex min-h-screen bg-background'>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden'
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        data-sidebar
        initial={isMobile ? { x: -sidebarWidth } : false}
        animate={
          isMobile ? { x: isOpen ? 0 : -sidebarWidth } : { width: sidebarWidth }
        }
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed top-0 left-0 h-screen z-50',
          'bg-card/80 backdrop-blur-xl border-r border-border/50',
          'flex flex-col shadow-2xl'
        )}
        style={{ width: sidebarWidth }}
      >
        {/* Header - Logo removed, only menu button */}
        <div
          className={cn(
            'flex items-center border-b border-border/50 p-4',
            isOpen ? 'justify-end' : 'justify-center'
          )}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className='p-2 rounded-lg hover:bg-muted/80 transition-colors'
            aria-label='Toggle sidebar'
          >
            {isMobile && isOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 scrollbar-thin'>
          {MENU_ITEMS.map(item => (
            <SidebarItem
              key={item.href}
              {...item}
              isActive={
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href))
              }
              isOpen={isOpen}
              onClick={isMobile ? closeSidebar : undefined}
            />
          ))}
        </nav>

        {/* CF Badge Footer */}
        {isVerified && cfData && (
          <div
            className={cn(
              'border-t border-border/50 p-4',
              !isOpen && 'flex justify-center'
            )}
          >
            <CFBadge cfData={cfData} isOpen={isOpen} />
          </div>
        )}
      </motion.aside>

      {/* Main content */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          isMobile ? 'ml-0' : isOpen ? `ml-64` : 'ml-16'
        )}
      >
        <Header onMobileMenuToggle={toggleSidebar} isMobile={isMobile} />
        <main className='flex-1 overflow-auto'>{children}</main>
        <Footer />
      </div>
    </div>
  );
}