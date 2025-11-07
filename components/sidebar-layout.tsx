'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Sword,
  X,
  User,
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
const SIDEBAR_WIDTH_OPEN = 'w-64'; // 256px
const SIDEBAR_WIDTH_CLOSED = 'w-16'; // 64px
const SIDEBAR_WIDTH_MOBILE = 'w-[280px]'; // 280px

// ==================== UTILITIES ====================
const getRatingAbbreviation = (label: string): string =>
  RATING_TIERS[label] || label.split(' ')[0];

const getCFTier = (rating: number): CFTier => {
  if (rating < 1200)
    return {
      label: 'Newbie',
      color: 'text-gray-400',
      bg: 'bg-gray-900/20 border-gray-700/50',
    };
  if (rating < 1400)
    return {
      label: 'Pupil',
      color: 'text-green-400',
      bg: 'bg-green-900/20 border-green-700/50',
    };
  if (rating < 1600)
    return {
      label: 'Specialist',
      color: 'text-cyan-400',
      bg: 'bg-cyan-900/20 border-cyan-700/50',
    };
  if (rating < 1900)
    return {
      label: 'Expert',
      color: 'text-blue-400',
      bg: 'bg-blue-900/20 border-blue-700/50',
    };
  if (rating < 2100)
    return {
      label: 'Candidate Master',
      color: 'text-purple-400',
      bg: 'bg-purple-900/20 border-purple-700/50',
    };
  if (rating < 2300)
    return {
      label: 'Master',
      color: 'text-orange-400',
      bg: 'bg-orange-900/20 border-orange-700/50',
    };
  if (rating < 2400)
    return {
      label: 'International Master',
      color: 'text-red-400',
      bg: 'bg-red-900/20 border-red-700/50',
    };
  if (rating < 2600)
    return {
      label: 'Grandmaster',
      color: 'text-red-500',
      bg: 'bg-red-900/30 border-red-700/60',
    };
  if (rating < 3000)
    return {
      label: 'International GM',
      color: 'text-red-600',
      bg: 'bg-red-950/30 border-red-800/60',
    };
  return {
    label: 'Legendary GM',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30 border-yellow-700/60',
  };
};

const MOBILE_TABS = [
  { href: '/battle-arena', label: 'Battle', icon: Sword },
  { href: '/train', label: 'Problems', icon: FileText },
  { href: '/profile/overview', label: 'Profile', icon: User },
];

// ==================== SUB-COMPONENTS ====================
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
      'group relative flex items-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
      isOpen ? 'px-3 py-2 gap-3' : 'p-3 justify-center',
      isActive
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )}
    aria-current={isActive ? 'page' : undefined}
    title={!isOpen ? label : undefined}
  >
    <Icon className='h-5 w-5 shrink-0' aria-hidden='true' />
    {isOpen && <span className='text-sm font-medium truncate'>{label}</span>}
  </Link>
));
SidebarItem.displayName = 'SidebarItem';

const CFBadge = React.memo<{ cfData: CFData; isOpen: boolean }>(
  ({ cfData, isOpen }) => {
    const tier = useMemo(() => getCFTier(cfData.rating), [cfData.rating]);
    const displayLabel = useMemo(
      () => (isOpen ? tier.label : getRatingAbbreviation(tier.label)),
      [tier.label, isOpen]
    );

    if (isOpen) {
      return (
        <div
          className={cn(
            'p-3 rounded-md border transition-colors duration-200',
            tier.bg,
            tier.color
          )}
        >
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-semibold truncate'>{cfData.handle}</p>
            <div className='px-2 py-0.5 rounded bg-background/20'>
              <span className='text-xs font-mono'>{cfData.rating}</span>
            </div>
          </div>
          <p className='text-xs opacity-75 truncate'>{tier.label}</p>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'w-12 h-12 flex items-center justify-center rounded-md border transition-colors duration-200',
          tier.bg,
          tier.color,
          'text-xs font-semibold'
        )}
        title={`${cfData.handle} (${cfData.rating}) - ${tier.label}`}
      >
        {displayLabel}
      </div>
    );
  }
);
CFBadge.displayName = 'CFBadge';

// ==================== MAIN COMPONENT ====================
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isVerified, verificationData } = useCFVerification();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [cfData, setCfData] = useState<CFData | null>(verificationData);
  const [loadingCF, setLoadingCF] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarId = 'primary-sidebar';

  // Detect mobile via matchMedia (less resize thrash)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const apply = (mql: MediaQueryList | MediaQueryListEvent) => {
      const mobile =
        'matches' in mql ? mql.matches : (mql as MediaQueryList).matches;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    apply(mq);
    const handler = (e: MediaQueryListEvent) => apply(e);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, isOpen]);

  // Close sidebar on outside click (mobile) and Escape
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside, {
      passive: true,
    });
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobile, isOpen]);

  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);

  // Fetch latest CF data (with abort + light caching)
  useEffect(() => {
    if (!verificationData?.handle) return;
    let active = true;
    const controller = new AbortController();

    const cacheKey = `cf-user:${verificationData.handle}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { data: CFData; ts: number };
        // 5 minutes TTL
        if (Date.now() - parsed.ts < 5 * 60_000) {
          setCfData(parsed.data);
          return;
        }
      } catch {
        // ignore parse errors
      }
    }

    const fetchCFData = async () => {
      try {
        setLoadingCF(true);
        const res = await fetch(
          `https://codeforces.com/api/user.info?handles=${encodeURIComponent(
            verificationData.handle
          )}`,
          { cache: 'no-store', signal: controller.signal }
        );
        const data = await res.json();
        if (!active) return;

        if (data.status === 'OK') {
          const user = data.result?.[0] ?? {};
          const next: CFData = {
            handle: verificationData.handle,
            rating: user.rating ?? 0,
            maxRating: user.maxRating ?? 0,
            rank: user.rank,
          };
          setCfData(next);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data: next, ts: Date.now() })
          );
        }
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          console.error('Failed to fetch CF data:', error);
        }
      } finally {
        if (active) setLoadingCF(false);
      }
    };

    fetchCFData();
    return () => {
      active = false;
      controller.abort();
    };
  }, [verificationData]);

  const sidebarWidthClass = useMemo(
    () =>
      isMobile
        ? SIDEBAR_WIDTH_MOBILE
        : isOpen
        ? SIDEBAR_WIDTH_OPEN
        : SIDEBAR_WIDTH_CLOSED,
    [isMobile, isOpen]
  );
  const mainMarginClass = useMemo(
    () => (isMobile ? 'ml-0' : isOpen ? 'ml-64' : 'ml-16'),
    [isMobile, isOpen]
  );

  const isActiveHref = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (href === '/') return pathname === '/';
      return pathname === href || pathname.startsWith(href + '/');
    },
    [pathname]
  );

  return (
    <div className='flex min-h-screen bg-background'>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          onClick={closeSidebar}
          className='fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in-0'
          aria-hidden='true'
        />
      )}

      {/* Sidebar */}
      <aside
        id={sidebarId}
        ref={sidebarRef}
        data-sidebar
        className={cn(
          'fixed top-0 left-0 h-screen z-50',
          'bg-card border-r border-border',
          'flex flex-col shadow-md',
          'transition-transform duration-200 will-change-transform',
          sidebarWidthClass,
          isMobile && !isOpen && '-translate-x-full'
        )}
        aria-label='Primary'
        // Use hidden instead of aria-hidden to satisfy validators
        hidden={isMobile && !isOpen}
      >
        {/* Header - menu button */}
        <div
          className={cn(
            'flex items-center border-b border-border p-3',
            isOpen ? 'justify-end' : 'justify-center'
          )}
        >
          <button
            onClick={toggleSidebar}
            className='p-2 rounded-md hover:bg-muted transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
            aria-label='Toggle sidebar'
            aria-controls={sidebarId}
            aria-expanded={isOpen ? 'true' : 'false'}
            aria-haspopup='true'
          >
            {isMobile && isOpen ? (
              <X className='h-5 w-5 shrink-0' aria-hidden='true' />
            ) : (
              <Menu className='h-5 w-5 shrink-0' aria-hidden='true' />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className='flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 scrollbar-thin'
          role='navigation'
          aria-label='Primary'
        >
          {MENU_ITEMS.map(item => (
            <SidebarItem
              key={item.href}
              {...item}
              isActive={isActiveHref(item.href)}
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
            {loadingCF ? (
              <div
                className={cn(
                  'p-3 rounded-md border',
                  'animate-pulse text-muted-foreground w-full',
                  !isOpen && 'w-12 h-12 p-0 flex items-center justify-center'
                )}
                aria-label='Loading Codeforces rating'
              >
                {isOpen ? (
                  <div className='h-4 w-24 bg-muted rounded' />
                ) : (
                  <div className='h-3 w-8 bg-muted rounded' />
                )}
              </div>
            ) : (
              <CFBadge cfData={cfData} isOpen={isOpen} />
            )}
          </div>
        )}
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-200',
          mainMarginClass
        )}
      >
        <Header onMobileMenuToggle={toggleSidebar} isMobile={isMobile} />
        <main className={cn('flex-1 overflow-auto', isMobile && 'pb-20')}>
          {children}
        </main>
        <Footer />
        {/* Mobile bottom nav */}
        {isMobile && !pathname?.startsWith('/battle-arena') && (
          <nav
            className='fixed bottom-0 inset-x-0 border-t border-border/60 bg-background/95 backdrop-blur shadow-lg'
            aria-label='Mobile bottom navigation'
          >
            <div className='mx-auto flex max-w-md items-center justify-between px-6 py-2'>
              {MOBILE_TABS.map(tab => {
                const Icon = tab.icon;
                const active = pathname?.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      'flex flex-col items-center gap-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md px-2 py-1',
                      active
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className='h-5 w-5 shrink-0' aria-hidden='true' />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}