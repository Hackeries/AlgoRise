'use client';

import type React from 'react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';
import { useSearch } from '@/hooks/use-search';
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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AuthModal } from '@/components/auth/auth-modal';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  text: string;
  read: boolean;
  href?: string;
}

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isMobile?: boolean;
}

export function Header({ onMobileMenuToggle, isMobile }: HeaderProps = {}) {
  const { user, loading, signOut } = useAuth();
  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U';
  const { theme, setTheme, resolvedTheme } = useTheme();
  const effectiveTheme = theme === 'system' ? resolvedTheme || 'light' : theme;
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const showLandingAuth = pathname === '/';
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () =>
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');

  // ------------------- Search -------------------
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
  };

  const handleSearchSubmit = async () => {
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(false);
      setShowSearchResults(true);
      await search(searchQuery, {
        categories: ['contest', 'group', 'handle', 'user'],
        limit: 8,
      });
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setShowSearchResults(true);
    await search(suggestion, {
      categories: ['contest', 'group', 'handle', 'user'],
      limit: 8,
    });
  };

  const handleResultClick = (result: any) => {
    setSearchQuery('');
    setShowSearchResults(false);
    setShowSuggestions(false);
    clearResults();
    if (result.url) window.location.href = result.url;
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setShowSuggestions(false);
    clearResults();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClearSearch();
      searchInputRef.current?.blur();
    } else if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // ------------------- Notifications -------------------
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ------------------- JSX -------------------
  return (
    <>
      <header className='h-16 flex items-center justify-between px-3 sm:px-6 bg-card border-b border-border backdrop-blur z-50 w-full'>
      {/* Left: Mobile Menu + Logo */}
      <div className='flex items-center gap-2 sm:gap-4 flex-shrink-0'>
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onMobileMenuToggle}
            className='md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted/40'
            aria-label='Toggle sidebar'
          >
            <Menu className='h-5 w-5' />
          </Button>
        )}
        
        <Link href='/' className='flex-shrink-0'>
          <Image
            src='/algorise-logo.png'
            alt='AlgoRise'
            width={160}
            height={45}
            className='h-7 sm:h-9 w-auto'
            priority
          />
        </Link>
      </div>

      {/* Center: Search Bar - Hidden on mobile */}
      <div className='hidden md:flex flex-1 max-w-md mx-4 lg:mx-8 relative' ref={searchContainerRef}>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            ref={searchInputRef}
            type='text'
            placeholder='Search contests, groups, handles...'
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className='w-full pl-10 pr-10 py-2 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/60 focus:border-primary/50 transition-all'
          />
          {searchQuery && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClearSearch}
              className='absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground'
            >
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className='absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto'>
            <div className='py-2'>
              <div className='px-4 py-2 text-xs text-muted-foreground font-medium'>
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.suggestion}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion.suggestion)}
                  className='w-full px-4 py-3 text-left hover:bg-muted/40 flex items-center gap-3 transition-colors'
                >
                  <Search className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <div className='text-foreground font-medium truncate'>
                      {suggestion.suggestion}
                    </div>
                    <div className='text-muted-foreground text-xs capitalize'>
                      {suggestion.type}
                    </div>
                  </div>
                  {suggestion.frequency > 1 && (
                    <Badge variant='secondary' className='text-xs'>
                      {suggestion.frequency}
                    </Badge>
                  )}
                </button>
              ))}
              <div className='border-t border-border mt-2 pt-2'>
                <button
                  onClick={handleSearchSubmit}
                  className='w-full px-4 py-2 text-center text-primary hover:bg-muted/40 text-sm transition-colors'
                >
                  Search for "{searchQuery}" →
                </button>
              </div>
            </div>
          </div>
        )}

        {showSearchResults && (
          <div className='absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto'>
            {searchLoading ? (
              <div className='p-4 text-center text-muted-foreground'>
                <div className='animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto'></div>
                <span className='ml-2'>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className='py-2'>
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className='w-full px-4 py-3 text-left hover:bg-muted/40 flex items-start gap-3 transition-colors'
                  >
                    <Badge
                      variant='outline'
                      className='text-xs capitalize bg-primary/10 text-primary border-primary/30 flex-shrink-0 mt-1'
                    >
                      {result.type}
                    </Badge>
                    <div className='flex-1 min-w-0'>
                      <div className='text-foreground font-medium truncate'>
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className='text-muted-foreground text-sm truncate'>
                          {result.subtitle}
                        </div>
                      )}
                      {result.description && (
                        <div className='text-muted-foreground text-xs mt-1 truncate'>
                          {result.description}
                        </div>
                      )}
                    </div>
                    {result.relevanceScore && (
                      <div className='flex-shrink-0 text-xs text-muted-foreground'>
                        {Math.round(result.relevanceScore * 100)}%
                      </div>
                    )}
                  </button>
                ))}
                <div className='border-t border-border mt-2 pt-2'>
                  <Link
                    href={`/test-features?search=${encodeURIComponent(
                      searchQuery
                    )}`}
                    className='block px-4 py-2 text-center text-primary hover:text-primary-foreground text-sm transition-colors'
                    onClick={() => setShowSearchResults(false)}
                  >
                    View all results →
                  </Link>
                </div>
              </div>
            ) : (
              <div className='p-4 text-center text-muted-foreground'>
                <div className='text-sm'>
                  No results found for "{searchQuery}"
                </div>
                <div className='text-xs text-muted-foreground mt-1'>
                  Try searching for contests, groups, or handles
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className='flex items-center gap-1 sm:gap-2 md:gap-3'>
        {/* Mobile Search Button */}
        <Button
          variant='ghost'
          size='sm'
          className='md:hidden text-muted-foreground hover:text-foreground p-2'
          onClick={() => setShowMobileSearch(true)}
          aria-label="Open search"
        >
          <Search className='h-4 w-4' />
        </Button>

        <Link href='/faqs' className='hidden sm:block'>
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-foreground gap-2'
          >
            <HelpCircle className='h-4 w-4 sm:h-5 sm:w-5' />
            <span className='hidden md:inline'>FAQs</span>
          </Button>
        </Link>

        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground hover:text-foreground p-2'
          onClick={toggleTheme}
        >
          {isMounted
            ? effectiveTheme === 'dark'
              ? <Sun className='h-4 w-4' />
              : <Moon className='h-4 w-4' />
            : <Sun className='h-4 w-4' />}
        </Button>

        {/* Notifications - Enhanced Design */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'relative text-muted-foreground hover:text-foreground p-2 hover:bg-muted/60 rounded-lg transition-all duration-200',
                unreadCount > 0 && 'text-primary hover:text-primary/80 hover:bg-primary/10'
              )}
            >
              <Bell className={cn(
                'h-4 w-4 transition-transform duration-200',
                unreadCount > 0 && 'animate-pulse'
              )} />
              {unreadCount > 0 && (
                <>
                  <div className='absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[16px] shadow-lg z-10'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                  <div className='absolute -top-1 -right-1 h-4 w-4 bg-red-500/30 rounded-full animate-ping'></div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-80 max-w-[calc(100vw-2rem)] bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-xl overflow-hidden'
            align='end'
            side='bottom'
            sideOffset={12}
            alignOffset={-8}
          >
            {/* Header */}
            <div className='flex justify-between items-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/30'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 bg-primary/20 rounded-lg'>
                  <Bell className='h-3.5 w-3.5 text-primary' />
                </div>
                <span className='font-semibold text-foreground'>Notifications</span>
                {unreadCount > 0 && (
                  <Badge className='bg-primary/20 text-primary border-primary/30 text-xs'>
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  size='sm'
                  variant='ghost'
                  className='text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md'
                  onClick={markAllRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
            
            {/* Notifications List */}
            <div className='max-h-72 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted/30'>
              {notifications.length > 0 ? (
                notifications.map((n, index) => (
                  <DropdownMenuItem
                    key={n.id}
                    className={`p-0 focus:bg-transparent ${
                      index !== notifications.length - 1 ? 'border-b border-border/20' : ''
                    }`}
                  >
                    <div className={`w-full p-4 hover:bg-muted/30 transition-all duration-200 ${
                      !n.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}>
                      <div className='flex items-start gap-3'>
                        {/* Notification Icon */}
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                          !n.read 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          <Bell className='h-3 w-3' />
                        </div>
                        
                        {/* Notification Content */}
                        <div className='flex-1 min-w-0'>
                          <div className={`text-sm leading-relaxed ${
                            n.read ? 'text-muted-foreground' : 'text-foreground font-medium'
                          }`}>
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
                          </div>
                          <div className='text-xs text-muted-foreground/70 mt-1'>
                            Just now
                          </div>
                        </div>
                        
                        {/* Unread Indicator */}
                        {!n.read && (
                          <div className='w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2'></div>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className='p-8 text-center'>
                  <div className='w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <Bell className='h-5 w-5 text-muted-foreground/50' />
                  </div>
                  <div className='text-sm text-muted-foreground font-medium mb-1'>
                    No notifications yet
                  </div>
                  <div className='text-xs text-muted-foreground/70'>
                    We'll notify you when something happens
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className='p-3 bg-muted/20 border-t border-border/30'>
                <Button 
                  variant='ghost' 
                  className='w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg'
                >
                  View all notifications
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User / Auth */}
        {loading ? (
          <div className='w-8 h-8 bg-white/10 rounded-full animate-pulse' />
        ) : !user ? (
          <>
            {showLandingAuth ? (
              <>
                <Button
                  variant='ghost'
                  className='text-foreground hover:text-primary'
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthModalOpen(true);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className='bg-primary text-primary-foreground hover:bg-primary/90'
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthModalOpen(true);
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <Link href='/auth/login'>
                  <Button
                    variant='ghost'
                    className='text-foreground hover:text-primary'
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href='/auth/sign-up'>
                  <Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='relative h-8 w-8 rounded-full hover:bg-muted/40'
              >
                <Avatar className='h-8 w-8'>
                  <AvatarFallback className='bg-primary text-primary-foreground text-sm'>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56 max-w-[calc(100vw-2rem)] bg-card border-border'
              align='end'
              sideOffset={8}
              forceMount
            >
              <div className='flex items-center gap-2 p-3 border-b border-border'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col space-y-1 leading-none truncate'>
                  <p className='font-medium text-foreground truncate'>
                    {user.email?.split('@')[0]}
                  </p>
                  <p className='text-xs text-muted-foreground truncate w-[150px]'>
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuItem asChild>
                <Link
                  href='/profile/overview'
                  className='flex items-center gap-2 text-foreground'
                >
                  <User className='h-4 w-4' /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className='bg-border' />
              <DropdownMenuItem asChild>
                <Link
                  href='/pricing'
                  className='flex items-center gap-2 text-foreground'
                >
                  <CreditCard className='h-4 w-4' /> Subscriptions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className='bg-border' />
              <DropdownMenuItem
                className='flex items-center gap-2 text-red-400 cursor-pointer hover:bg-red-500/10'
                onSelect={signOut}
              >
                <LogOut className='h-4 w-4' /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
    
    {/* Mobile Search Modal */}
    {showMobileSearch && (
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowMobileSearch(false);
          }
        }}
      >
        <div className="fixed top-0 left-0 right-0 bg-card border-b border-border p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search contests, groups, handles..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                    setShowMobileSearch(false);
                  }
                  if (e.key === 'Escape') {
                    setShowMobileSearch(false);
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/60 focus:border-primary/50 transition-all rounded-lg"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileSearch(false)}
              className="text-muted-foreground hover:text-foreground p-2 rounded-lg"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Mobile Search Results */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-4 bg-card border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto">
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-muted-foreground font-medium">
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.suggestion}-${index}`}
                    onClick={() => {
                      handleSuggestionClick(suggestion.suggestion);
                      setShowMobileSearch(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-muted/40 flex items-center gap-3 transition-colors"
                  >
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground font-medium truncate">
                        {suggestion.suggestion}
                      </div>
                      <div className="text-muted-foreground text-xs capitalize">
                        {suggestion.type}
                      </div>
                    </div>
                    {suggestion.frequency > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.frequency}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSearchResults && results.length > 0 && (
            <div className="mt-4 bg-card border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto">
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-muted-foreground font-medium">
                  Search Results
                </div>
                {results.map((result, index) => (
                  <div
                    key={`${result.id}-${index}`}
                    onClick={() => setShowMobileSearch(false)}
                    className="block px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <div className="text-foreground font-medium truncate">
                      {result.title}
                    </div>
                    <div className="text-muted-foreground text-xs capitalize">
                      {result.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    
    {showLandingAuth && !user && (
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