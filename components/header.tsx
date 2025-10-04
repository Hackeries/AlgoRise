'use client';

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
import { Bell, User, LogOut, Moon, Sun, Search, X } from 'lucide-react';

interface Notification {
  id: number;
  text: string;
  read: boolean;
  href?: string;
}

export function Header() {
  const { user, loading, signOut } = useAuth();
  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U';

  // ------------------- Search Functionality -------------------
  const { results, loading: searchLoading, search, clearResults } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle search input changes
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length >= 2) {
      setShowSearchResults(true);
      await search(value, {
        categories: ['contest', 'group', 'handle', 'user'],
        limit: 8,
      });
    } else {
      setShowSearchResults(false);
      clearResults();
    }
  };

  // Handle search result click
  const handleResultClick = (result: any) => {
    setSearchQuery('');
    setShowSearchResults(false);
    clearResults();
    // Navigate to result URL
    if (result.url) {
      window.location.href = result.url;
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    clearResults();
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClearSearch();
      searchInputRef.current?.blur();
    }
  };

  // ------------------- Dark/Light Theme -------------------
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    if (mounted) document.documentElement.classList.toggle('dark');
  };

  // ------------------- Notifications -------------------
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications'); // Replace with your backend API
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // every 30s
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

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter(n => !n.read).length
    : 0;

  return (
    <header className='flex items-center justify-between px-6 py-3 bg-[#0B1020] border-b border-white/10 backdrop-blur z-50'>
      {/* Center: Search Bar */}
      <div className='flex-1 max-w-md relative' ref={searchContainerRef}>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50' />
          <Input
            ref={searchInputRef}
            type='text'
            placeholder='Search contests, groups, handles...'
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className='w-full pl-10 pr-10 py-2 bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-blue-500/50 transition-all'
          />
          {searchQuery && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClearSearch}
              className='absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/50 hover:text-white'
            >
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className='absolute top-full left-0 right-0 mt-2 bg-[#1a1f36] border border-white/10 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto'>
            {searchLoading ? (
              <div className='p-4 text-center text-white/70'>
                <div className='animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto'></div>
                <span className='ml-2'>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className='py-2'>
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className='w-full px-4 py-3 text-left hover:bg-white/5 flex items-start gap-3 transition-colors'
                  >
                    <div className='flex-shrink-0 mt-1'>
                      <Badge
                        variant='outline'
                        className='text-xs capitalize bg-blue-500/10 text-blue-400 border-blue-500/30'
                      >
                        {result.type}
                      </Badge>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='text-white font-medium truncate'>
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className='text-white/70 text-sm truncate'>
                          {result.subtitle}
                        </div>
                      )}
                      {result.description && (
                        <div className='text-white/50 text-xs mt-1 truncate'>
                          {result.description}
                        </div>
                      )}
                    </div>
                    {result.relevanceScore && (
                      <div className='flex-shrink-0 text-xs text-white/40'>
                        {Math.round(result.relevanceScore * 100)}%
                      </div>
                    )}
                  </button>
                ))}

                {/* Show more results link */}
                <div className='border-t border-white/10 mt-2 pt-2'>
                  <Link
                    href={`/test-features?search=${encodeURIComponent(searchQuery)}`}
                    className='block px-4 py-2 text-center text-blue-400 hover:text-blue-300 text-sm transition-colors'
                    onClick={() => setShowSearchResults(false)}
                  >
                    View all results →
                  </Link>
                </div>
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className='p-4 text-center text-white/70'>
                <div className='text-sm'>
                  No results found for "{searchQuery}"
                </div>
                <div className='text-xs text-white/50 mt-1'>
                  Try searching for contests, groups, or handles
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Right: Notifications + Profile / Auth Buttons */}
      <div className='flex items-center gap-3'>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='relative text-white/70 hover:text-white'
            >
              <Bell className='h-5 w-5' />
              {unreadCount > 0 && (
                <Badge className='absolute -top-1 -right-1 h-4 w-4 bg-white text-xs p-0 border-0'>
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-80 bg-[#1a1f36] border-[#2a3441]'
            align='end'
          >
            <div className='flex justify-between items-center p-2 border-b border-[#2a3441]'>
              <span className='text-white font-semibold'>Notifications</span>
              {Array.isArray(notifications) &&
                notifications.length > 0 &&
                unreadCount > 0 && (
                  <Button
                    size='sm'
                    variant='ghost'
                    className='text-xs text-[#2563EB]'
                    onClick={markAllRead}
                  >
                    Mark all as read
                  </Button>
                )}
            </div>
            <div className='max-h-60 overflow-y-auto'>
              {Array.isArray(notifications) && notifications.length > 0 ? (
                notifications.map(n => (
                  <DropdownMenuItem
                    key={n.id}
                    className={`p-3 hover:bg-[#2a3441] ${
                      n.read ? 'text-white/70' : 'text-white font-medium'
                    }`}
                  >
                    {n.href ? <Link href={n.href}>{n.text}</Link> : n.text}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className='p-3 text-center text-white/70'>
                  No notifications
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu or Sign In/Sign Up */}
        {loading ? (
          <div className='w-8 h-8 bg-white/10 rounded-full animate-pulse' />
        ) : !user ? (
          <>
            <Link href='/auth/login'>
              <Button
                variant='ghost'
                className='text-white hover:text-[#2563EB]'
              >
                Sign In
              </Button>
            </Link>
            <Link href='/auth/sign-up'>
              <Button className='bg-[#2563EB] hover:bg-[#1D4FD8] text-white'>
                Sign Up
              </Button>
            </Link>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='relative h-8 w-8 rounded-full hover:bg-white/10'
              >
                <Avatar className='h-8 w-8'>
                  <AvatarFallback className='bg-[#2563EB] text-white text-sm'>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56 bg-[#1a1f36] border-[#2a3441]'
              align='end'
              forceMount
            >
              {/* User Info */}
              <div className='flex items-center gap-2 p-3 border-b border-[#2a3441]'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback className='bg-[#2563EB] text-white'>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col space-y-1 leading-none truncate'>
                  <p className='font-medium text-white truncate'>
                    {user.email?.split('@')[0]}
                  </p>
                  <p className='text-xs text-white/70 truncate w-[150px]'>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <DropdownMenuItem asChild>
                <Link
                  href='/profile'
                  className='flex items-center gap-2 text-white'
                >
                  <User className='h-4 w-4' /> Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                className='flex items-center gap-2 text-white cursor-pointer'
                onSelect={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun className='h-4 w-4' />
                ) : (
                  <Moon className='h-4 w-4' />
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </DropdownMenuItem>

              <DropdownMenuSeparator className='bg-[#2a3441]' />

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
