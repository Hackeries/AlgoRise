"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/context"
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  Search,
  Command,
  HelpCircle,
  Zap,
  Home,
  BarChart3
} from "lucide-react"
import React from "react"

interface HeaderProps {
  title?: string
}

export function Header({ title = "Competitive Programming" }: HeaderProps) {
  const { user, loading, signOut } = useAuth()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)

  const userInitials = user?.email?.charAt(0).toUpperCase() || "U"

} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/context";
import { Bell, User, LogOut, Moon, Sun } from "lucide-react";

interface Notification {
  id: number;
  text: string;
  read: boolean;
  href?: string;
}

export function Header() {
  const { user, loading, signOut } = useAuth();
  const userInitials = user?.email?.charAt(0).toUpperCase() || "U";

  // ------------------- Dark/Light Theme -------------------
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    if (mounted) document.documentElement.classList.toggle("dark");
  };

  // ------------------- Notifications -------------------
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications"); // Replace with your backend API
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
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Focus input when search opens
  React.useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Example: redirect to search page or log
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#0B1020] border-b border-white/10 backdrop-blur z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        {/* <Link href="/" className="text-white font-bold text-xl">
          AlgoRise
        </Link> */}
      </div>

      {/* Right: Notifications + Profile / Auth Buttons */}
      <div className="flex items-center gap-3">

        {/* Expanding Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          {searchOpen ? (
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onBlur={() => setSearchOpen(false)}
              className="transition-all duration-200 w-48 px-3 py-1 rounded bg-[#1a1f36] text-white border border-[#2a3441] focus:outline-none"
              placeholder="Search..."
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white"
              type="button"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </form>

        {/* Command Palette */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white"
          type="button"
          onClick={() => setCommandOpen(true)}
        >
          <Command className="h-4 w-4" />
        </Button>

        {/* Command Palette Modal */}
        {commandOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pt-24">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />
            <div className="relative bg-[#181c2a] rounded-2xl shadow-2xl p-7 w-[400px] border border-[#23283a] transition-all duration-200  pointer-events-auto translate-y-20">
              <button
                className="absolute top-3 right-3 text-white/60 hover:text-white bg-[#23283a] rounded-full p-1 transition-colors"
                onClick={() => setCommandOpen(false)}
                aria-label="Close"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="6" y1="6" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
                  <line x1="16" y1="6" x2="6" y2="16" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-white mb-5 tracking-tight">Quick Actions</h2>
              
              <ul className="space-y-2 cursor-pointer">
              
                <li>
                  <Link href="/" className="flex items-center gap-3 text-white/80 hover:bg-[#23283a] hover:text-white px-4 py-3 rounded-lg transition-colors" onClick={() => setCommandOpen(false)}>
                    <svg pointerEvents="none" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9.5L12 4l9 5.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/><path d="M9 22V12h6v10"/></svg>
                    <span>Go to Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="flex items-center gap-3 text-white/80 hover:bg-[#23283a] hover:text-white px-4 py-3 rounded-lg transition-colors" onClick={() => setCommandOpen(false)}>
                    <svg pointerEvents="none" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
                    <span>Open Profile</span>
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="flex items-center gap-3 text-white/80 hover:bg-[#23283a] hover:text-white px-4 py-3 rounded-lg transition-colors" onClick={() => setCommandOpen(false)}>
                    <svg pointerEvents="none" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="8"/><rect x="9" y="8" width="4" height="12"/><rect x="15" y="4" width="4" height="16"/></svg>
                    <span>View Analytics</span>
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="flex items-center gap-3 text-white/80 hover:bg-[#23283a] hover:text-white px-4 py-3 rounded-lg transition-colors" onClick={() => setCommandOpen(false)}>
                    <svg pointerEvents="none" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1c.2-.36.13-.81-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06c.36.36.81.43 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .7.39 1.31 1 1.51.36.2.81.13 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82c.2.36.81.43 1.82.33H21a2 2 0 0 1 0 4h-.09c-.7 0-1.31.39-1.51 1z"/></svg>
                    <span>Settings</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}


        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative text-white/70 hover:text-white"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-xs p-0 border-0">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-80 bg-[#1a1f36] border-[#2a3441]"
            align="end"
          >
            <div className="flex justify-between items-center p-2 border-b border-[#2a3441]">
              <span className="text-white font-semibold">Notifications</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-[#2563EB]"
                onClick={markAllRead}
              >
                Mark all as read
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className={`p-3 hover:bg-[#2a3441] ${
                    n.read ? "text-white/70" : "text-white font-medium"
                  }`}
                >
                  {n.href ? <Link href={n.href}>{n.text}</Link> : n.text}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white"
          type="button"
          onClick={() => setHelpOpen(true)}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Help Modal */}
        {helpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center mt-15">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />
            <div className="relative bg-[#181c2a] rounded-2xl shadow-2xl p-7 w-[400px] border border-[#23283a] transition-all duration-200 pointer-events-auto mt-40">
              <button
                className="absolute top-3 right-3 text-white/60 hover:text-white bg-[#23283a] rounded-full p-1 transition-colors"
                onClick={() => setHelpOpen(false)}
                aria-label="Close"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="6" y1="6" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
                  <line x1="16" y1="6" x2="6" y2="16" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-white mb-5 tracking-tight">Need Help?</h2>
              <div className="text-white/80 space-y-3">
                <p>Welcome to AlgoRise! Here are some ways to get help:</p>
                <ul className="list-disc pl-5">
                  <li>Read our <a href="/LEARNING_ROADMAP.md" className="text-blue-400 underline">Learning Roadmap</a></li>
                  <li>Check the <a href="/DETAILED_PROJECT_REPORT.md" className="text-blue-400 underline">Project Report</a></li>
                  <li>Contact support at <a href="mailto:support@algorise.com" className="text-blue-400 underline">support@algorise.com</a></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Button */}
        <Button className="bg-[#2563EB] hover:bg-[#1D4FD8]" asChild>
          <Link href="/adaptive-sheet">
            <Zap className="h-4 w-4 mr-2" />
            Start Training
          </Link>
        </Button>

        {/* User Menu */}

        {/* User Menu or Sign In/Sign Up */}
        {loading ? (
          <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
        ) : !user ? (
          <>
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-white hover:text-[#2563EB]"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-[#2563EB] hover:bg-[#1D4FD8] text-white">
                Sign Up
              </Button>
            </Link>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:bg-white/10"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#2563EB] text-white text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-[#1a1f36] border-[#2a3441]"
              align="end"
              forceMount
            >
              {/* User Info */}
              <div className="flex items-center gap-2 p-3 border-b border-[#2a3441]">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#2563EB] text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none truncate">
                  <p className="font-medium text-white truncate">
                    {user.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-white/70 truncate w-[150px]">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-white"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-2 text-white cursor-pointer"
                onSelect={toggleTheme}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#2a3441]" />

              <DropdownMenuItem
                className="flex items-center gap-2 text-red-400 cursor-pointer hover:bg-red-500/10"
                onSelect={signOut}
              >
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
