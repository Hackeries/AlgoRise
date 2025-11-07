'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { useSearch } from '@/hooks/use-search';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Container } from '@/components/ui/container';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  Search,
  X,
  CreditCard,
  HelpCircle,
  Menu,
  Sparkles,
} from 'lucide-react';

// Components
import { AlgoRiseLogo } from '@/components/algorise-logo';
import { AuthModal } from '@/components/auth/auth-modal';

// ==================== TYPES ====================
interface Notification {
  id: number | string;
  text: string;
  read: boolean;
  href?: string;
}

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isMobile?: boolean;
}

// ==================== CUSTOM HOOKS ====================
const useHeaderScroll = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange(latest => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  return { isScrolled };
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [backendUnread, setBackendUnread] = useState<number | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      const data = await res.json();
      // Support both shapes: [] OR { notifications: [], unreadCount: number }
      const list: Notification[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
        ? data.notifications
        : [];
      setNotifications(list);
      if (typeof data?.unreadCount === 'number') {
        setBackendUnread(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setBackendUnread(0);
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const computedUnread = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const unreadCount = backendUnread ?? computedUnread;

  return { notifications, unreadCount, markAllRead };
};

// ==================== SUB-COMPONENTS ====================

// Modern Search Bar
const ModernSearchBar = React.memo<{
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  suggestions: any[];
  results: any[];
  showSuggestions: boolean;
  showResults: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onResultClick: (result: any) => void;
  searchLoading: boolean;
}>(
  ({
    searchQuery,
    onSearchChange,
    onClear,
    onSubmit,
    suggestions,
    results,
    showSuggestions,
    showResults,
    onSuggestionClick,
    onResultClick,
    searchLoading,
  }) => {
    const searchRef = useRef<HTMLDivElement>(null);

    return (
      <div className='relative w-full max-w-md' ref={searchRef}>
        <motion.div
          className='relative group'
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className='absolute -inset-0.5 bg-linear-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300' />
          <div className='relative flex items-center'>
            <Search className='absolute left-4 h-4 w-4 text-muted-foreground z-10' />
            <Input
              type='text'
              placeholder='Search anything...'
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSubmit();
                if (e.key === 'Escape') onClear();
              }}
              className='w-full h-11 pl-11 pr-10 bg-background/60 backdrop-blur-xl border-border/50 rounded-xl focus:bg-background/80 focus:border-primary/50 transition-all duration-300 shadow-sm'
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  type='button'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={onClear}
                  className='absolute right-3 p-1 hover:bg-muted/80 rounded-md transition-colors z-10'
                >
                  <X className='h-3.5 w-3.5 text-muted-foreground' />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {(showSuggestions || showResults) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50'
            >
              {searchLoading ? (
                <div className='p-8 flex flex-col items-center justify-center gap-3'>
                  <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                  <p className='text-sm text-muted-foreground'>Searching...</p>
                </div>
              ) : showSuggestions && suggestions.length > 0 ? (
                <div className='max-h-80 overflow-y-auto'>
                  {suggestions.map((suggestion, idx) => (
                    <motion.button
                      type='button'
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => onSuggestionClick(suggestion.suggestion)}
                      className='w-full px-4 py-3 hover:bg-muted/60 transition-colors flex items-center gap-3 group text-left'
                    >
                      <div className='p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors'>
                        <Search className='h-4 w-4' />
                      </div>
                      <div className='flex-1 text-left'>
                        <p className='text-sm font-medium'>
                          {suggestion.suggestion}
                        </p>
                        <p className='text-xs text-muted-foreground capitalize'>
                          {suggestion.type}
                        </p>
                      </div>
                      {suggestion.frequency > 1 && (
                        <Badge variant='secondary' className='text-xs'>
                          {suggestion.frequency}
                        </Badge>
                      )}
                    </motion.button>
                  ))}
                  <div className='border-t border-border mt-2 pt-2'>
                    <button
                      type='button'
                      onClick={onSubmit}
                      className='w-full px-4 py-2 text-center text-primary hover:bg-muted/40 text-sm transition-colors'
                    >
                      Search for "{searchQuery}" →
                    </button>
                  </div>
                </div>
              ) : showResults && results.length > 0 ? (
                <div className='max-h-80 overflow-y-auto'>
                  {results.map((result, idx) => (
                    <motion.button
                      type='button'
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => onResultClick(result)}
                      className='w-full px-4 py-3 hover:bg-muted/60 transition-colors text-left'
                    >
                      <div className='flex items-start gap-3'>
                        <Badge className='mt-0.5 bg-primary/10 text-primary border-primary/30'>
                          {result.type}
                        </Badge>
                        <div className='flex-1'>
                          <p className='text-sm font-medium'>{result.title}</p>
                          {result.subtitle && (
                            <p className='text-xs text-muted-foreground mt-0.5'>
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

ModernSearchBar.displayName = 'ModernSearchBar';

// Notifications Dropdown
const NotificationsDropdown = React.memo<{
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
}>(({ notifications, unreadCount, onMarkAllRead }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative p-2.5 rounded-xl transition-all duration-300',
          'hover:bg-muted/80 backdrop-blur-sm',
          unreadCount > 0 && 'bg-primary/10 hover:bg-primary/20'
        )}
        aria-label='Notifications'
      >
        <Bell className={cn('h-5 w-5', unreadCount > 0 && 'text-primary')} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className='absolute -top-1 -right-1'
            >
              <div className='relative'>
                <div className='h-5 w-5 bg-linear-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
                <div className='absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30' />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      className='w-80 bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl rounded-2xl overflow-hidden'
      align='end'
      sideOffset={12}
    >
      {/* Header with gradient */}
      <div className='p-4 bg-linear-to-r from-primary/10 via-purple-500/10 to-primary/10 border-b border-border/30'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='p-2 bg-primary/20 rounded-lg'>
              <Bell className='h-4 w-4 text-primary' />
            </div>
            <span className='font-semibold'>Notifications</span>
            {unreadCount > 0 && (
              <Badge className='bg-primary/20 text-primary border-primary/30'>
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              size='sm'
              variant='ghost'
              className='text-xs text-primary hover:bg-primary/10'
              onClick={onMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className='max-h-80 overflow-y-auto'>
        {notifications.length > 0 ? (
          notifications.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                'p-4 hover:bg-muted/60 transition-all duration-200 border-l-2',
                !n.read
                  ? 'border-l-primary bg-primary/5'
                  : 'border-l-transparent'
              )}
            >
              <div className='flex items-start gap-3'>
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    !n.read ? 'bg-primary/20 text-primary' : 'bg-muted/50'
                  )}
                >
                  <Bell className='h-3.5 w-3.5' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className={cn('text-sm', !n.read && 'font-medium')}>
                    {n.href ? (
                      <Link
                        href={n.href}
                        className='hover:text-primary transition-colors'
                      >
                        {n.text}
                      </Link>
                    ) : (
                      n.text
                    )}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>Just now</p>
                </div>
                {!n.read && (
                  <div className='w-2 h-2 bg-primary rounded-full mt-2' />
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className='p-12 text-center'>
            <div className='w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Bell className='h-7 w-7 text-muted-foreground/50' />
            </div>
            <p className='text-sm font-medium mb-1'>No notifications yet</p>
            <p className='text-xs text-muted-foreground'>
              We'll notify you when something happens
            </p>
          </div>
        )}
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
));

NotificationsDropdown.displayName = 'NotificationsDropdown';

// User Dropdown
const UserDropdown = React.memo<{
  user: any;
  userInitials: string;
  onSignOut: () => void;
}>(({ user, userInitials, onSignOut }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className='relative'
        aria-label='User menu'
      >
        <Avatar className='h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background'>
          <AvatarFallback className='bg-linear-to-br from-primary to-primary/60 text-primary-foreground font-semibold'>
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </motion.button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      className='w-64 bg-card/95 backdrop-blur-2xl border-border/50 rounded-xl'
      align='end'
      sideOffset={12}
    >
      <div className='p-4 border-b border-border/30'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-12 w-12'>
            <AvatarFallback className='bg-linear-to-br from-primary to-primary/60 text-primary-foreground text-base font-semibold'>
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='font-semibold truncate'>
              {user.email?.split('@')[0]}
            </p>
            <p className='text-xs text-muted-foreground truncate'>
              {user.email}
            </p>
          </div>
        </div>
      </div>
      <DropdownMenuItem asChild>
        <Link
          href='/profile/overview'
          className='flex items-center gap-2 cursor-pointer'
        >
          <User className='h-4 w-4' /> Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link
          href='/pricing'
          className='flex items-center gap-2 cursor-pointer'
        >
          <CreditCard className='h-4 w-4' /> Subscriptions
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className='flex items-center gap-2 text-red-400 cursor-pointer hover:bg-red-500/10'
        onSelect={onSignOut}
      >
        <LogOut className='h-4 w-4' /> Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));

UserDropdown.displayName = 'UserDropdown';

// Theme Toggle with Animation
const ThemeToggle = React.memo<{
  theme: string | undefined;
  onToggle: () => void;
}>(({ theme, onToggle }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onToggle}
    className='p-2.5 rounded-xl hover:bg-muted/80 transition-colors backdrop-blur-sm'
    aria-label='Toggle theme'
  >
    <AnimatePresence mode='wait'>
      {theme === 'dark' ? (
        <motion.div
          key='sun'
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Sun className='h-5 w-5 text-amber-500' />
        </motion.div>
      ) : (
        <motion.div
          key='moon'
          initial={{ rotate: 90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Moon className='h-5 w-5 text-blue-500' />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
));

ThemeToggle.displayName = 'ThemeToggle';

// ==================== MAIN COMPONENT ====================
export function Header({ onMobileMenuToggle, isMobile }: HeaderProps = {}) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const { isScrolled } = useHeaderScroll();

  const [isMounted, setIsMounted] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Search state
  const {
    results,
    suggestions,
    loading: searchLoading,
    search,
    getSuggestions,
    clearResults,
  } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isLandingPage = pathname === '/';
  const effectiveTheme = theme === 'system' ? resolvedTheme || 'light' : theme;
  const userInitials = useMemo(
    () => user?.email?.[0]?.toUpperCase() ?? 'U',
    [user]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  }, [effectiveTheme, setTheme]);

  // Search handlers
  const handleSearchChange = useCallback(
    async (value: string) => {
      setSearchQuery(value);
      if (value.trim().length >= 2) {
        setShowSuggestions(true);
        setShowSearchResults(false);
        await getSuggestions(value);
      } else {
        setShowSuggestions(false);
        setShowSearchResults(false);
        clearResults();
      }
    },
    [getSuggestions, clearResults]
  );

  const handleSearchSubmit = useCallback(async () => {
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(false);
      setShowSearchResults(true);
      await search(searchQuery, {
        categories: ['contest', 'group', 'handle', 'user'],
        limit: 8,
      });
    }
  }, [searchQuery, search]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearchResults(false);
    setShowSuggestions(false);
    clearResults();
  }, [clearResults]);

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      setSearchQuery(suggestion);
      setShowSuggestions(false);
      setShowSearchResults(true);
      await search(suggestion, {
        categories: ['contest', 'group', 'handle', 'user'],
        limit: 8,
      });
    },
    [search]
  );

  const handleResultClick = useCallback(
    (result: any) => {
      handleClearSearch();
      if (result?.url) window.location.href = result.url;
    },
    [handleClearSearch]
  );

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor:
            isScrolled && !isLandingPage
              ? effectiveTheme === 'dark'
                ? 'rgba(18, 18, 18, 0.9)'
                : 'rgba(255, 255, 255, 0.9)'
              : 'transparent',
          backdropFilter: isScrolled && !isLandingPage ? 'blur(12px)' : 'none',
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          'sticky top-0 left-0 right-0 z-50 h-16 border-b transition-colors duration-300',
          isScrolled && !isLandingPage
            ? 'border-border/50 shadow-lg'
            : 'border-transparent',
          isLandingPage && 'bg-transparent'
        )}
      >
        <Container
          size={isLandingPage ? 'full' : '7xl'}
          padding={!isLandingPage}
          className='h-16 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'
        >
          {/* Left: Menu + Logo */}
          <div className='flex items-center gap-3'>
            {isMobile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMobileMenuToggle}
                className='md:hidden p-2 rounded-xl hover:bg-muted/80 transition-colors'
                aria-label='Open menu'
              >
                <Menu className='h-5 w-5' />
              </motion.button>
            )}
            <Link href='/' className='block'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <AlgoRiseLogo className='h-8 sm:h-9 w-auto' />
              </motion.div>
            </Link>
          </div>

          {/* Center: Search */}
          <div className='hidden md:flex flex-1 justify-center max-w-2xl mx-4'>
            <ModernSearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClear={handleClearSearch}
              onSubmit={handleSearchSubmit}
              suggestions={suggestions}
              results={results}
              showSuggestions={showSuggestions}
              showResults={showSearchResults}
              onSuggestionClick={handleSuggestionClick}
              onResultClick={handleResultClick}
              searchLoading={searchLoading}
            />
          </div>

          {/* Right: Actions */}
          <div className='flex items-center gap-2'>
            <Link href='/faqs' className='hidden sm:block'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant='ghost' size='sm' className='gap-2 rounded-xl'>
                  <HelpCircle className='h-4 w-4' />
                  <span className='hidden md:inline'>FAQs</span>
                </Button>
              </motion.div>
            </Link>

            {isMounted && (
              <ThemeToggle theme={effectiveTheme} onToggle={toggleTheme} />
            )}

            <NotificationsDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
            />

            {loading ? (
              <div className='w-9 h-9 bg-muted/40 rounded-full animate-pulse' />
            ) : !user ? (
              <div className='flex items-center gap-2'>
                {isLandingPage ? (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant='ghost'
                        onClick={() => {
                          setAuthMode('signin');
                          setAuthModalOpen(true);
                        }}
                        className='rounded-xl'
                      >
                        Sign In
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => {
                          setAuthMode('signup');
                          setAuthModalOpen(true);
                        }}
                        className='rounded-xl bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                      >
                        <Sparkles className='h-4 w-4 mr-2' />
                        Sign Up
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <Link href='/auth/login'>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant='ghost' className='rounded-xl'>
                          Sign In
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href='/auth/sign-up'>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className='rounded-xl'>Sign Up</Button>
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <UserDropdown
                user={user}
                userInitials={userInitials}
                onSignOut={signOut}
              />
            )}
          </div>
        </Container>
      </motion.header>

      {isLandingPage && !user && (
        <AuthModal
          open={authModalOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onOpenChange={setAuthModalOpen}
        />
      )}
    </>
  );
}
