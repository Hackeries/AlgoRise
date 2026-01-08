'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/lib/auth/context'
import { useSearch } from '@/hooks/use-search'
import { cn } from '@/lib/utils'
import useSWR from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  Search,
  X,
  CreditCard,
  Menu,
  ChevronDown,
} from 'lucide-react'

import { AlgoRiseLogo } from '@/components/algorise-logo'
import { AuthModal } from '@/components/auth/auth-modal'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Notification {
  id: number | string
  text: string
  read: boolean
  href?: string
}

interface HeaderProps {
  onMobileMenuToggle?: () => void
  isMobile?: boolean
}

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [backendUnread, setBackendUnread] = useState<number | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      const data = await res.json()
      const list: Notification[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
          ? data.notifications
          : []
      setNotifications(list)
      if (typeof data?.unreadCount === 'number') {
        setBackendUnread(data.unreadCount)
      }
    } catch {
      // silent fail
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setBackendUnread(0)
    } catch {
      // silent fail
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const computedUnread = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  )

  const unreadCount = backendUnread ?? computedUnread

  return { notifications, unreadCount, markAllRead }
}

const NAV_LINKS = [
  { href: '/train', label: 'Practice' },
  { href: '/paths', label: 'Learning Paths' },
  { href: '/contests', label: 'Contests' },
  { href: '/analytics', label: 'Analytics' },
]

const NavLinks = React.memo<{ pathname: string | null }>(({ pathname }) => (
  <nav className="hidden lg:flex items-center gap-1">
    {NAV_LINKS.map(link => {
      const isActive = pathname?.startsWith(link.href)
      return (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isActive
              ? 'text-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          {link.label}
        </Link>
      )
    })}
  </nav>
))
NavLinks.displayName = 'NavLinks'

const SearchBar = React.memo<{
  searchQuery: string
  onSearchChange: (value: string) => void
  onClear: () => void
  onSubmit: () => void
  suggestions: any[]
  results: any[]
  showSuggestions: boolean
  showResults: boolean
  onSuggestionClick: (suggestion: string) => void
  onResultClick: (result: any) => void
  searchLoading: boolean
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
    const searchRef = useRef<HTMLDivElement>(null)

    return (
      <div className="relative w-full max-w-sm" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search problems, users..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onSubmit()
              if (e.key === 'Escape') onClear()
            }}
            className="w-full h-9 pl-9 pr-8 bg-muted/50 border-0 rounded-lg focus:bg-background focus:ring-1 focus:ring-border text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 p-1 hover:bg-muted rounded transition-colors"
              aria-label="Clear search"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {(showSuggestions || showResults) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
            >
              {searchLoading ? (
                <div className="p-4 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : showSuggestions && suggestions.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => onSuggestionClick(suggestion.suggestion)}
                      className="w-full px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-3 text-left"
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{suggestion.suggestion}</span>
                    </button>
                  ))}
                  <div className="border-t border-border">
                    <button
                      type="button"
                      onClick={onSubmit}
                      className="w-full px-4 py-2 text-center text-primary hover:bg-muted/50 text-sm transition-colors"
                    >
                      Search for "{searchQuery}"
                    </button>
                  </div>
                </div>
              ) : showResults && results.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {results.map((result, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => onResultClick(result)}
                      className="w-full px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className="mt-0.5 text-xs">
                          {result.type}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
SearchBar.displayName = 'SearchBar'

const NotificationsDropdown = React.memo<{
  notifications: Notification[]
  unreadCount: number
  onMarkAllRead: () => void
}>(({ notifications, unreadCount, onMarkAllRead }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        )}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.slice(0, 5).map(n => (
            <div
              key={n.id}
              className={cn(
                'px-4 py-3 border-b border-border last:border-0',
                !n.read && 'bg-primary/5'
              )}
            >
              <p className="text-sm">{n.text}</p>
            </div>
          ))
        )}
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
))
NotificationsDropdown.displayName = 'NotificationsDropdown'

const UserDropdown = React.memo<{
  user: { email?: string | null } | null
  userInitials: string
  displayName: string
  onSignOut: () => void
}>(({ user, userInitials, displayName, onSignOut }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <div className="px-3 py-2 border-b border-border">
        <p className="text-sm font-medium truncate">{displayName}</p>
        {displayName !== user?.email && user?.email && (
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        )}
      </div>
      <DropdownMenuItem asChild>
        <Link href="/profile/overview" className="flex items-center gap-2 cursor-pointer">
          <User className="h-4 w-4" /> Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/pricing" className="flex items-center gap-2 cursor-pointer">
          <CreditCard className="h-4 w-4" /> Subscription
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="flex items-center gap-2 text-destructive cursor-pointer"
        onSelect={onSignOut}
      >
        <LogOut className="h-4 w-4" /> Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
))
UserDropdown.displayName = 'UserDropdown'

const ThemeToggle = React.memo<{
  theme: string | undefined
  onToggle: () => void
}>(({ theme, onToggle }) => (
  <button
    onClick={onToggle}
    className="p-2 rounded-lg hover:bg-muted transition-colors"
    aria-label="Toggle theme"
  >
    {theme === 'dark' ? (
      <Sun className="h-5 w-5 text-muted-foreground" />
    ) : (
      <Moon className="h-5 w-5 text-muted-foreground" />
    )}
  </button>
))
ThemeToggle.displayName = 'ThemeToggle'

export function Header({ onMobileMenuToggle, isMobile }: HeaderProps = {}) {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { notifications, unreadCount, markAllRead } = useNotifications()

  const [isMounted, setIsMounted] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const {
    results,
    suggestions,
    loading: searchLoading,
    search,
    getSuggestions,
    clearResults,
  } = useSearch()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const isLandingPage = pathname === '/'
  const effectiveTheme = theme === 'system' ? resolvedTheme || 'light' : theme

  const { data: profile } = useSWR(
    user ? '/api/profile' : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const displayName = useMemo(
    () => profile?.name || user?.email || '',
    [profile?.name, user?.email]
  )

  const userInitials = useMemo(() => {
    if (profile?.name) {
      const names = profile.name.trim().split(/\s+/)
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase()
      }
      return profile.name[0]?.toUpperCase() ?? 'U'
    }
    return user?.email?.[0]?.toUpperCase() ?? 'U'
  }, [profile?.name, user?.email])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')
  }, [effectiveTheme, setTheme])

  const handleSearchChange = useCallback(
    async (value: string) => {
      setSearchQuery(value)
      if (value.trim().length >= 2) {
        setShowSuggestions(true)
        setShowSearchResults(false)
        await getSuggestions(value)
      } else {
        setShowSuggestions(false)
        setShowSearchResults(false)
        clearResults()
      }
    },
    [getSuggestions, clearResults]
  )

  const handleSearchSubmit = useCallback(async () => {
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(false)
      setShowSearchResults(true)
      await search(searchQuery, {
        categories: ['contest', 'group', 'handle', 'user'],
        limit: 8,
      })
    }
  }, [searchQuery, search])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setShowSearchResults(false)
    setShowSuggestions(false)
    clearResults()
  }, [clearResults])

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      setSearchQuery(suggestion)
      setShowSuggestions(false)
      setShowSearchResults(true)
      await search(suggestion, {
        categories: ['contest', 'group', 'handle', 'user'],
        limit: 8,
      })
    },
    [search]
  )

  const handleResultClick = useCallback(
    (result: any) => {
      handleClearSearch()
      if (result?.url) window.location.href = result.url
    },
    [handleClearSearch]
  )

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="h-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Menu + Logo + Nav */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <AlgoRiseLogo className="h-7 w-auto" />
            </Link>
            {!isLandingPage && <NavLinks pathname={pathname} />}
          </div>

          {/* Center: Search (only on non-landing pages) */}
          {!isLandingPage && (
            <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
              <SearchBar
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
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {isMounted && <ThemeToggle theme={effectiveTheme} onToggle={toggleTheme} />}

            {!isLandingPage && (
              <NotificationsDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAllRead={markAllRead}
              />
            )}

            {loading ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            ) : !user ? (
              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuthMode('signin')
                    setAuthModalOpen(true)
                  }}
                  className="text-sm"
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAuthMode('signup')
                    setAuthModalOpen(true)
                  }}
                  className="text-sm"
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <UserDropdown user={user} userInitials={userInitials} displayName={displayName} onSignOut={signOut} />
            )}
          </div>
        </div>
      </header>

      {!user && (
        <AuthModal
          open={authModalOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onOpenChange={setAuthModalOpen}
        />
      )}
    </>
  )
}
