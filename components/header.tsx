"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  Zap,
  Home,
  BarChart3,
  Code2
} from "lucide-react"

export function Header() {
  const { user, loading, signOut } = useAuth()

  const userInitials = user?.email?.charAt(0).toUpperCase() || "U"

  return (
    <header className="h-16 border-b border-white/10 bg-[#0B1020]/80 backdrop-blur flex items-center justify-between px-6 flex-shrink-0">
      {/* Left Section */}
      <div className="p-6 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-[#2563EB]" />
          <span className="font-semibold text-lg tracking-tight text-white">
            AlgoRise
          </span>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search Button */}
        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-white border-0">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-[#1a1f36] border-[#2a3441]" align="end">
            <div className="p-3 border-b border-[#2a3441]">
              <h3 className="font-semibold text-white">Notifications</h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <DropdownMenuItem className="p-3 hover:bg-[#2a3441]">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-white">New Contest Available</p>
                  <p className="text-xs text-white/70">Codeforces Round #912 starts in 2 hours</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 hover:bg-[#2a3441]">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-white">Achievement Unlocked</p>
                  <p className="text-xs text-white/70">Solved 100 problems milestone!</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 hover:bg-[#2a3441]">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-white">Streak Alert</p>
                  <p className="text-xs text-white/70">Keep your 12-day streak going!</p>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-[#2a3441]" />
            <DropdownMenuItem asChild className="p-3 hover:bg-[#2a3441]">
              <Link href="/settings/notifications" className="text-center text-sm text-[#2563EB] font-medium">
                View All Notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Action Button */}
        <Button className="bg-[#2563EB] hover:bg-[#1D4FD8]" asChild>
          <Link href="/adaptive-sheet">
            <Zap className="h-4 w-4 mr-1" />
            Start Training
          </Link>
        </Button>

        {/* User Menu */}
        {loading ? (
          <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
        ) : !user ? (
          <div className="flex gap-2">
            <Button variant="ghost" asChild className="text-white/70 hover:text-white">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-[#2563EB] hover:bg-[#1D4FD8]">
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#2563EB] text-white text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#1a1f36] border-[#2a3441]" align="end" forceMount>
              {/* User Info */}
              <div className="flex items-center justify-start gap-2 p-3 border-b border-[#2a3441]">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#2563EB] text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-white">{user.email?.split("@")[0]}</p>
                  <p className="text-xs text-white/70 truncate w-[150px]">{user.email}</p>
                </div>
              </div>

              {/* Menu Items */}
              <DropdownMenuItem asChild className="hover:bg-[#2a3441]">
                <Link href="/profile" className="cursor-pointer text-white">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="hover:bg-[#2a3441]">
                <Link href="/" className="cursor-pointer text-white">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="hover:bg-[#2a3441]">
                <Link href="/analytics" className="cursor-pointer text-white">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="hover:bg-[#2a3441]">
                <Link href="/settings" className="cursor-pointer text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#2a3441]" />

              {/* Theme Toggle */}
              <DropdownMenuItem className="hover:bg-[#2a3441] cursor-pointer text-white">
                <Moon className="mr-2 h-4 w-4" />
                Switch Theme
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#2a3441]" />

              {/* Sign Out */}
              <DropdownMenuItem
                className="cursor-pointer text-red-400 focus:text-red-400 hover:bg-red-500/10"
                onSelect={(event) => {
                  event.preventDefault()
                  signOut()
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}