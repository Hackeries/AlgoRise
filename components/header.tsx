"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useSearch } from "@/hooks/use-search"
import { Bell, User, LogOut, Moon, Sun, Search, X, CreditCard } from "lucide-react"
import { useTheme } from "next-themes"

interface Notification {
  id: number
  text: string
  read: boolean
  href?: string
}

export function Header() {
  const { user, loading, signOut } = useAuth()
  const userInitials = user?.email?.charAt(0).toUpperCase() || "U"
  const { theme, setTheme, resolvedTheme } = useTheme()
  const effectiveTheme = (theme === "system" ? resolvedTheme : theme) || "light"

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(effectiveTheme === "dark" ? "light" : "dark")
  }

  // ------------------- Search Functionality -------------------
  const { results, loading: searchLoading, search, clearResults } = useSearch()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Handle search input changes
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.trim().length >= 2) {
      setShowSearchResults(true)
      await search(value, {
        categories: ["contest", "group", "handle", "user"],
        limit: 8,
      })
    } else {
      setShowSearchResults(false)
      clearResults()
    }
  }

  // Handle search result click
  const handleResultClick = (result: any) => {
    setSearchQuery("")
    setShowSearchResults(false)
    clearResults()
    // Navigate to result URL
    if (result.url) {
      window.location.href = result.url
    }
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("")
    setShowSearchResults(false)
    clearResults()
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClearSearch()
      searchInputRef.current?.blur()
    }
  }

  // ------------------- Notifications -------------------
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications") // Replace with your backend API
      const data = await res.json()
      setNotifications(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // every 30s
    return () => clearInterval(interval)
  }, [])

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border backdrop-blur z-50">
      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-8 relative" ref={searchContainerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search contests, groups, handles..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-10 py-2 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/60 focus:border-primary/50 transition-all"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <span className="ml-2">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/40 flex items-start gap-3 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs capitalize bg-primary/10 text-primary border-primary/30"
                      >
                        {result.type}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground font-medium truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-muted-foreground text-sm truncate">{result.subtitle}</div>
                      )}
                      {result.description && (
                        <div className="text-muted-foreground text-xs mt-1 truncate">{result.description}</div>
                      )}
                    </div>
                    {result.relevanceScore && (
                      <div className="flex-shrink-0 text-xs text-muted-foreground">
                        {Math.round(result.relevanceScore * 100)}%
                      </div>
                    )}
                  </button>
                ))}

                {/* Show more results link */}
                <div className="border-t border-border mt-2 pt-2">
                  <Link
                    href={`/test-features?search=${encodeURIComponent(searchQuery)}`}
                    className="block px-4 py-2 text-center text-primary hover:text-primary-foreground text-sm transition-colors"
                    onClick={() => setShowSearchResults(false)}
                  >
                    View all results →
                  </Link>
                </div>
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="text-sm">No results found for "{searchQuery}"</div>
                <div className="text-xs text-muted-foreground mt-1">Try searching for contests, groups, or handles</div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Right: Theme Toggle + Notifications + Profile / Auth Buttons */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {effectiveTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs p-0 border-0">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-card border-border" align="end">
            <div className="flex justify-between items-center p-2 border-b border-border">
              <span className="font-semibold">Notifications</span>
              {Array.isArray(notifications) && notifications.length > 0 && unreadCount > 0 && (
                <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={markAllRead}>
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {Array.isArray(notifications) && notifications.length > 0 ? (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className={`p-3 hover:bg-muted/40 ${n.read ? "text-muted-foreground" : ""}`}
                  >
                    {n.href ? <Link href={n.href}>{n.text}</Link> : n.text}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-3 text-center text-muted-foreground">No notifications</div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu or Sign In/Sign Up */}
        {loading ? (
          <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
        ) : !user ? (
          <>
            <Link href="/auth/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign Up</Button>
            </Link>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-muted/40">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
              {/* User Info */}
              <div className="flex items-center gap-2 p-3 border-b border-border">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none truncate">
                  <p className="font-medium text-foreground truncate">{user.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground truncate w-[150px]">{user.email}</p>
                </div>
              </div>

              {/* Menu Items */}
              <DropdownMenuItem asChild>
                <Link href="/profile/overview" className="flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

              {/* Subscriptions entry pointing to /pricing */}
              <DropdownMenuItem asChild>
                <Link href="/pricing" className="flex items-center gap-2 text-foreground">
                  <CreditCard className="h-4 w-4" /> Subscriptions
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

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
  )
}
