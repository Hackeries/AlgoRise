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
  X,
  User,
  Swords,
  ChevronLeft,
} from 'lucide-react';

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

const MENU_ITEMS: MenuItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/train', label: 'Train', icon: Zap },
  { href: '/adaptive-sheet', label: 'Practice', icon: FileText },
  { href: '/arena', label: 'Battle Arena', icon: Swords },
  { href: '/contests', label: 'Contests', icon: Trophy },
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

const getRatingAbbreviation = (label: string): string =>
  RATING_TIERS[label] || label.split(' ')[0];

const getCFTier = (rating: number): CFTier => {
  if (rating < 1200) return { label: 'Newbie', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' };
  if (rating < 1400) return { label: 'Pupil', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' };
  if (rating < 1600) return { label: 'Specialist', color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/30' };
  if (rating < 1900) return { label: 'Expert', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' };
  if (rating < 2100) return { label: 'Candidate Master', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' };
  if (rating < 2300) return { label: 'Master', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' };
  if (rating < 2400) return { label: 'International Master', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' };
  if (rating < 2600) return { label: 'Grandmaster', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/40' };
  if (rating < 3000) return { label: 'International GM', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/50' };
  return { label: 'Legendary GM', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/30' };
};

const MOBILE_TABS = [
  { href: '/train', label: 'Practice', icon: FileText },
  { href: '/profile/overview', label: 'Profile', icon: User },
];

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
      'group flex items-center rounded-lg transition-colors',
      isOpen ? 'px-3 py-2.5 gap-3' : 'p-3 justify-center',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )}
    aria-current={isActive ? 'page' : undefined}
    title={!isOpen ? label : undefined}
  >
    <Icon className="h-5 w-5 shrink-0" />
    {isOpen && <span className="text-sm font-medium">{label}</span>}
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
        <div className={cn('p-3 rounded-lg', tier.bg)}>
          <div className="flex items-center justify-between mb-1">
            <p className={cn('text-sm font-semibold truncate', tier.color)}>
              {cfData.handle}
            </p>
            <span className={cn('text-xs font-mono font-bold', tier.color)}>
              {cfData.rating}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{tier.label}</p>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-lg text-xs font-bold',
          tier.bg,
          tier.color
        )}
        title={`${cfData.handle} (${cfData.rating}) - ${tier.label}`}
      >
        {displayLabel.slice(0, 2)}
      </div>
    );
  }
);
CFBadge.displayName = 'CFBadge';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isVerified, verificationData } = useCFVerification();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [cfData, setCfData] = useState<CFData | null>(verificationData);
  const [loadingCF, setLoadingCF] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarId = 'primary-sidebar';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const apply = (mql: MediaQueryList | MediaQueryListEvent) => {
      const mobile = 'matches' in mql ? mql.matches : (mql as MediaQueryList).matches;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    apply(mq);
    const handler = (e: MediaQueryListEvent) => apply(e);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobile, isOpen]);

  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!verificationData?.handle) return;
    let active = true;
    const controller = new AbortController();

    const cacheKey = `cf-user:${verificationData.handle}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { data: CFData; ts: number };
        if (Date.now() - parsed.ts < 5 * 60_000) {
          setCfData(parsed.data);
          return;
        }
      } catch {
        // ignore
      }
    }

    const fetchCFData = async () => {
      try {
        setLoadingCF(true);
        const res = await fetch(
          `https://codeforces.com/api/user.info?handles=${encodeURIComponent(verificationData.handle)}`,
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
          sessionStorage.setItem(cacheKey, JSON.stringify({ data: next, ts: Date.now() }));
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

  const sidebarWidthClass = isMobile ? 'w-64' : isOpen ? 'w-56' : 'w-16';
  const mainMarginClass = isMobile ? 'ml-0' : isOpen ? 'ml-56' : 'ml-16';

  const isActiveHref = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (href === '/') return pathname === '/';
      return pathname === href || pathname.startsWith(href + '/');
    },
    [pathname]
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id={sidebarId}
        ref={sidebarRef}
        className={cn(
          'fixed top-0 left-0 h-screen z-50',
          'bg-card border-r border-border',
          'flex flex-col',
          'transition-all duration-200',
          sidebarWidthClass,
          isMobile && !isOpen && '-translate-x-full'
        )}
        aria-label="Primary"
        hidden={isMobile && !isOpen}
      >
        {/* Header */}
        <div className={cn('flex items-center h-14 border-b border-border px-3', isOpen ? 'justify-between' : 'justify-center')}>
          {isOpen && (
            <span className="text-lg font-bold text-primary">AlgoRise</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
            aria-controls={sidebarId}
            aria-expanded={isOpen}
          >
            {isMobile && isOpen ? (
              <X className="h-5 w-5" />
            ) : isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation">
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
          <div className={cn('border-t border-border p-3', !isOpen && 'flex justify-center')}>
            {loadingCF ? (
              <div className={cn('rounded-lg bg-muted animate-pulse', isOpen ? 'h-16 w-full' : 'w-10 h-10')} />
            ) : (
              <CFBadge cfData={cfData} isOpen={isOpen} />
            )}
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className={cn('flex-1 flex flex-col transition-all duration-200', mainMarginClass)}>
        <Header onMobileMenuToggle={toggleSidebar} isMobile={isMobile} />
        <main className={cn('flex-1 overflow-auto', isMobile && 'pb-20')}>
          {children}
        </main>
        <Footer />

        {/* Mobile bottom nav */}
        {isMobile && (
          <nav
            className="fixed bottom-0 inset-x-0 border-t border-border bg-card z-50"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto flex max-w-md items-center justify-around py-2">
              {MOBILE_TABS.map(tab => {
                const Icon = tab.icon;
                const active = pathname?.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
                      active
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{tab.label}</span>
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
