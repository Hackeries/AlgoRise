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
  Sword,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

interface Notification {
  id: number;
  text: string;
  read: boolean;
  href?: string;
}

export function Header() {
  const { user, loading, signOut } = useAuth();
  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U';
  const { theme, setTheme, resolvedTheme } = useTheme();
  const effectiveTheme = theme === 'system' ? resolvedTheme || 'light' : theme;

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
    <header className='h-16 flex items-center justify-between px-6 bg-card border-b border-border backdrop-blur z-50'>
      {/* Left: Logo */}
      <div className='flex items-center gap-4'>
        <Link href='/' className='flex-shrink-0'>
          <Image
            src='/algorise-logo.png'
            alt='AlgoRise'
            width={160}
            height={45}
            className='h-9 w-auto'
            priority
          />
        </Link>
      </div>

      {/* Center: Search Bar */}
      <div className='flex-1 max-w-md mx-8 relative' ref={searchContainerRef}>
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
      <div className='flex items-center gap-2 md:gap-3'>
        <Link href='/battle-arena'>
          <Button
            variant='ghost'
            className='text-muted-foreground hover:text-foreground gap-2'
          >
            <Sword className='h-5 w-5' />
            <span className='hidden md:inline'>Battle Arena 🎮</span>
          </Button>
        </Link>
        <Link href='/faqs'>
          <Button
            variant='ghost'
            className='text-muted-foreground hover:text-foreground gap-2'
          >
            <HelpCircle className='h-5 w-5' />
            <span className='hidden md:inline'>FAQs</span>
          </Button>
        </Link>

        <Button
          variant='ghost'
          className='text-muted-foreground hover:text-foreground'
          onClick={toggleTheme}
        >
          {effectiveTheme === 'dark' ? (
            <Sun className='h-5 w-5' />
          ) : (
            <Moon className='h-5 w-5' />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='relative text-muted-foreground hover:text-foreground'
            >
              <Bell className='h-5 w-5' />
              {unreadCount > 0 && (
                <Badge className='absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs p-0 border-0'>
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-80 bg-card border-border'
            align='end'
          >
            <div className='flex justify-between items-center p-2 border-b border-border'>
              <span className='font-semibold'>Notifications</span>
              {unreadCount > 0 && (
                <Button
                  size='sm'
                  variant='ghost'
                  className='text-xs text-primary'
                  onClick={markAllRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <div className='max-h-60 overflow-y-auto'>
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <DropdownMenuItem
                    key={n.id}
                    className={`p-3 hover:bg-muted/40 ${
                      n.read ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {n.href ? <Link href={n.href}>{n.text}</Link> : n.text}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className='p-3 text-center text-muted-foreground'>
                  No notifications
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User / Auth */}
        {loading ? (
          <div className='w-8 h-8 bg-white/10 rounded-full animate-pulse' />
        ) : !user ? (
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
              className='w-56 bg-card border-border'
              align='end'
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
  );
}