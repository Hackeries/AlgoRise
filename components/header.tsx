'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
import { Bell, User, LogOut, Moon, Sun, Search } from 'lucide-react';

interface Notification {
  id: number;
  type: 'contest' | 'invite' | 'message';
  text: string;
  read: boolean;
  href?: string;
}

interface SearchResult {
  id: string | number;
  type: 'problem' | 'contest' | 'group' | 'user';
  name: string;
  href: string;
}

export function Header() {
  const { user, loading, signOut } = useAuth();
  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U';

  // ------------------- Dark/Light Theme -------------------
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (mounted) {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', newTheme);
    }
  };

  // ------------------- Notifications -------------------
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
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

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter(n => !n.read).length
    : 0;

  const groupedNotifications = notifications.reduce(
    (acc: Record<string, Notification[]>, n) => {
      acc[n.type] = acc[n.type] || [];
      acc[n.type].push(n);
      return acc;
    },
    {}
  );

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'contest':
        return '📅';
      case 'invite':
        return '✉️';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  // ------------------- Search -------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) return setSearchResults([]);

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResults();
  }, [searchQuery]);

  const handleSearchFocus = () => setSearchOpen(true);

  const handleClickOutside = (e: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ------------------- Header UI -------------------
  return (
    <header className='flex items-center justify-between px-6 py-3 bg-[#0C0E1A] border-b border-white/10 backdrop-blur z-50'>
      {/* Left: Logo */}
      <div className='flex items-center gap-4'>
        <Link
          href='/'
          className='flex items-center gap-2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#4AAFFF] to-[#A062F7] hover:opacity-80'
        >
          <div className='w-6 h-6 flex items-center justify-center rounded-sm bg-white/10 text-white text-xs font-semibold'>
            AR
          </div>
          <span className='tracking-wide'>AlgoRise</span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className='relative flex-1 max-w-xl mx-4'>
        <div className='relative'>
          <Search className='absolute top-1/2 left-3 -translate-y-1/2 text-white/70 h-5 w-5' />
          <input
            ref={searchRef}
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder='Search problems, contests, groups, users...'
            className='w-full pl-10 pr-4 py-2 rounded-md bg-[#1a1f36] text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#173CFF] transition-all'
          />
        </div>

        {searchOpen && searchResults.length > 0 && (
          <div className='absolute mt-1 w-full max-h-60 overflow-y-auto rounded-md bg-[#1a1f36] border border-[#2a3441] shadow-lg z-50'>
            {['problem', 'contest', 'group', 'user'].map(category => {
              const items = searchResults.filter(r => r.type === category);
              if (!items.length) return null;
              return (
                <div key={category} className='p-2'>
                  <p className='text-xs text-white/70 uppercase mb-1'>
                    {category}
                  </p>
                  {items.map(r => (
                    <Link
                      key={r.id}
                      href={r.href}
                      className='block px-2 py-1 rounded hover:bg-white/10 text-white truncate'
                    >
                      {r.name}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Notifications + Profile */}
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
                <Badge className='absolute -top-1 -right-1 h-4 w-4 bg-[#FFD43B] text-xs p-0 border-0'>
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-80 bg-gradient-to-br from-[#1E3CFF] via-[#00C8D0] to-[#00C896] text-white rounded-lg shadow-lg animate-fade-in'
            align='end'
          >
            <div className='flex justify-between items-center p-2 border-b border-white/20'>
              <span className='font-semibold'>Notifications</span>
              <Button
                size='sm'
                variant='ghost'
                className='text-xs text-white/80'
                onClick={markAllRead}
              >
                Mark all as read
              </Button>
            </div>
            <div className='max-h-60 overflow-y-auto'>
              {Object.entries(groupedNotifications).map(([type, items]) => (
                <div key={type}>
                  <p className='px-3 py-1 text-xs text-white/70 uppercase'>
                    {type}
                  </p>
                  {items.map(n => (
                    <DropdownMenuItem
                      key={n.id}
                      className={`p-3 rounded hover:bg-black/20 ${
                        n.read ? 'text-white/70' : 'text-white font-medium'
                      }`}
                    >
                      {n.href ? (
                        <Link href={n.href} className='flex items-center gap-1'>
                          {getNotificationIcon(n.type)} {n.text}
                        </Link>
                      ) : (
                        <div className='flex items-center gap-1'>
                          {getNotificationIcon(n.type)} {n.text}
                        </div>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        {loading ? (
          <div className='w-8 h-8 bg-white/10 rounded-full animate-pulse' />
        ) : !user ? (
          <>
            <Link href='/auth/login'>
              <Button
                variant='ghost'
                className='text-white hover:text-[#173CFF]'
              >
                Sign In
              </Button>
            </Link>
            <Link href='/auth/sign-up'>
              <Button className='bg-[#173CFF] hover:bg-[#1D4FD8] text-white'>
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
                  <AvatarFallback className='bg-[#173CFF] text-white text-sm'>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56 bg-[#1c2030] border-[#2a3441] rounded-lg shadow-lg animate-fade-in'
              align='end'
            >
              <div className='flex items-center gap-2 p-3 border-b border-[#2a3441]'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback className='bg-[#173CFF] text-white'>
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
