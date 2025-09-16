"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Try to create Supabase client with error handling
  let supabase: any = null
  try {
    supabase = createClient()
  } catch (error) {
    console.warn("Supabase client creation failed:", error)
    // Continue without Supabase functionality
  }

  const refreshUser = async () => {
    if (!supabase) {
      setUser(null)
      return
    }
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
    }
  }

  const signOut = async () => {
    if (!supabase) {
      setUser(null)
      window.location.href = "/"
      return
    }
    
    try {
      await supabase.auth.signOut()
      setUser(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  useEffect(() => {
    // Get initial session
    refreshUser().finally(() => setLoading(false))

    if (!supabase) return

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
