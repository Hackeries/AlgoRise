'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
import { Bell, User, LogOut, Moon, Sun } from 'lucide-react';

interface Notification {
  id: number;
  text: string;
  read: boolean;
  href?: string;
}

export function Header() {
  const { user, loading, signOut } = useAuth();
  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U';

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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className='px-5 py-3 flex items-center justify-between bg-[#0B1020] border-b border-white/10 backdrop-blur z-50'>
      {/* Left: Logo */}
      <div className='flex items-center gap-4'>
        {/* <Link href="/" className="text-white font-bold text-xl">
          AlgoRise
        </Link> */}
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
              <Button
                size='sm'
                variant='ghost'
                className='text-xs text-[#2563EB]'
                onClick={markAllRead}
              >
                Mark all as read
              </Button>
            </div>
            <div className='max-h-60 overflow-y-auto'>
              {notifications.map(n => (
                <DropdownMenuItem
                  key={n.id}
                  className={`p-3 hover:bg-[#2a3441] ${
                    n.read ? 'text-white/70' : 'text-white font-medium'
                  }`}
                >
                  {n.href ? <Link href={n.href}>{n.text}</Link> : n.text}
                </DropdownMenuItem>
              ))}
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
