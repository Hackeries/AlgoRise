'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from '../auth/context'
import { createClient } from '../supabase/client'

export interface CFVerificationData {
  handle: string
  rating: number
  maxRating: number
  rank: string
  verifiedAt: string
}

interface CFVerificationContextType {
  isVerified: boolean
  verificationData: CFVerificationData | null
  setVerificationData: (data: CFVerificationData | null) => void
  clearVerification: () => void
  resetVerificationUI: () => void
  refreshVerificationStatus: () => void
}

const CFVerificationContext = createContext<CFVerificationContextType | undefined>(undefined)

interface CFVerificationProviderProps {
  children: ReactNode
}

export function CFVerificationProvider({ children }: CFVerificationProviderProps) {
  const [verificationData, setVerificationDataState] = useState<CFVerificationData | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const { user } = useAuth()
  
  // Safely create Supabase client with error handling
  let supabase: any = null
  try {
    supabase = createClient()
  } catch (error) {
    console.warn("Supabase client creation failed:", error)
    // Continue without Supabase functionality
  }

  // Initialize verification status from localStorage (fallback only)
  const refreshVerificationStatus = () => {
    try {
      // Clear any hardcoded demo data
      const storedData = localStorage.getItem('cf_verification')
      if (storedData) {
        const data = JSON.parse(storedData) as CFVerificationData
        // Check if this is demo data and clear it
        if (data.handle === 'ItsAllMe' || data.handle === 'itsallme') {
          localStorage.removeItem('cf_verification')
          setVerificationDataState(null)
          setIsVerified(false)
          return
        }
        console.log('Loading CF verification from localStorage fallback:', data.handle)
        setVerificationDataState(data)
        setIsVerified(true)
      } else {
        console.log('No CF verification data found in localStorage')
        setVerificationDataState(null)
        setIsVerified(false)
      }
    } catch (error) {
      console.error('Error reading CF verification status:', error)
      setVerificationDataState(null)
      setIsVerified(false)
    }
  }

  // Save verification data to Supabase
  const saveToSupabase = useCallback(async (data: CFVerificationData) => {
    if (!user) {
      console.log('No user found, skipping Supabase save')
      return
    }
    
    if (!supabase) {
      console.log('Supabase client not available, skipping save')
      return
    }

    try {
      console.log('Saving CF verification to Supabase:', data.handle)
      
      // Save to cf_handles table (handle and verification status)
      const { error: handleError } = await supabase
        .from('cf_handles')
        .upsert({
          user_id: user.id,
          handle: data.handle,
          verified: true,
          created_at: data.verifiedAt,
          updated_at: new Date().toISOString()
        })

      if (handleError && handleError.code !== 'PGRST205') {
        console.error('Supabase error saving CF handle:', {
          code: handleError.code,
          message: handleError.message,
          details: handleError.details,
          hint: handleError.hint
        })
      }

      // Save to cf_snapshots table (rating data) - always create new snapshot
      const { error: snapshotError } = await supabase
        .from('cf_snapshots')
        .insert({
          user_id: user.id,
          handle: data.handle,
          rating: data.rating,
          max_rating: data.maxRating,
          rank: data.rank,
          problems_solved: 0, // Default value, will be updated later
          snapshot_at: new Date().toISOString()
        })

      if (snapshotError && snapshotError.code !== 'PGRST205') {
        console.error('Supabase error saving CF snapshot:', {
          code: snapshotError.code,
          message: snapshotError.message,
          details: snapshotError.details,
          hint: snapshotError.hint
        })
      }

      if (!handleError && !snapshotError) {
        console.log('CF verification saved to Supabase successfully')
      }
    } catch (error) {
      console.error('Exception saving CF verification to Supabase:', error)
    }
  }, [user, supabase])

  // Set verification data and update localStorage and Supabase
  const setVerificationData = useCallback((data: CFVerificationData | null) => {
    try {
      if (data) {
        console.log('Setting CF verification data:', data.handle)
        localStorage.setItem('cf_verification', JSON.stringify(data))
        setVerificationDataState(data)
        setIsVerified(true)
        // Also save to Supabase if user is logged in
        if (user) {
          console.log('User is logged in, saving to Supabase')
          saveToSupabase(data)
        } else {
          console.log('No user logged in, only saving to localStorage')
        }
      } else {
        console.log('Clearing CF verification data')
        localStorage.removeItem('cf_verification')
        setVerificationDataState(null)
        setIsVerified(false)
      }
    } catch (error) {
      console.error('Error storing CF verification data:', error)
    }
  }, [user, saveToSupabase])

  // Load verification data from Supabase
  const loadFromSupabase = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping Supabase load')
      return
    }
    
    if (!supabase) {
      console.log('Supabase client not available, falling back to localStorage')
      refreshVerificationStatus()
      return
    }

    try {
      // First get the CF handle
      const { data: handleData, error: handleError } = await supabase
        .from('cf_handles')
        .select('handle, verified, created_at')
        .eq('user_id', user.id)
        .single()

      if (handleError) {
        if (handleError.code === 'PGRST116') {
          // No data found - this is expected for new users
          console.log('No CF verification data found in Supabase for user')
          refreshVerificationStatus()
          return
        } else if (handleError.code === 'PGRST205') {
          // Table doesn't exist - use localStorage fallback
          console.log('cf_handles table not found, falling back to localStorage')
          refreshVerificationStatus()
          return
        } else {
          console.error('Supabase error loading CF handle:', {
            code: handleError.code,
            message: handleError.message,
            details: handleError.details,
            hint: handleError.hint
          })
          // Fallback to localStorage on any other error
          refreshVerificationStatus()
          return
        }
      }

      if (handleData && handleData.verified) {
        // Get latest CF snapshot for rating data
        const { data: snapshotData } = await supabase
          .from('cf_snapshots')
          .select('rating, max_rating, rank')
          .eq('user_id', user.id)
          .order('snapshot_at', { ascending: false })
          .limit(1)
          .single()

        console.log('CF verification data loaded from Supabase:', handleData.handle)
        const verificationData: CFVerificationData = {
          handle: handleData.handle,
          rating: snapshotData?.rating || 0,
          maxRating: snapshotData?.max_rating || 0,
          rank: snapshotData?.rank || 'unrated',
          verifiedAt: handleData.created_at
        }
        setVerificationData(verificationData)
      } else {
        // No verified data in Supabase, check localStorage
        refreshVerificationStatus()
      }
    } catch (error) {
      console.error('Exception loading CF verification from Supabase:', error)
      // Fallback to localStorage
      refreshVerificationStatus()
    }
  }, [user, supabase])

  // Clear verification data permanently (used during logout)
  const clearVerification = useCallback(async () => {
    // Clear from localStorage
    localStorage.removeItem('cf_verification')
    setVerificationDataState(null)
    setIsVerified(false)
    
    // Clear from Supabase if user is logged in
    if (user && supabase) {
      try {
        console.log('Permanently clearing CF verification from Supabase')
        const { error } = await supabase
          .from('cf_handles')
          .delete()
          .eq('user_id', user.id)
          
        if (error) {
          console.error('Supabase error clearing CF verification:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
        } else {
          console.log('CF verification permanently cleared from Supabase')
        }
      } catch (error) {
        console.error('Exception clearing CF verification from Supabase:', error)
      }
    }
  }, [user, supabase])

  // Reset verification UI temporarily (for re-verification, keeps database intact)
  const resetVerificationUI = useCallback(() => {
    console.log('Resetting CF verification UI for re-verification')
    // Only clear local state, keep database intact
    localStorage.removeItem('cf_verification')
    setVerificationDataState(null)
    setIsVerified(false)
  }, [])

  // Initialize on mount and listen for storage changes
  useEffect(() => {
    // Clear any demo/hardcoded data on first load
    const demoKeys = ['demo_cf_data', 'cf_demo', 'hardcoded_cf']
    demoKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
      }
    })
    
    refreshVerificationStatus()

    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cf_verification') {
        refreshVerificationStatus()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Effect to sync with auth state
  useEffect(() => {
    console.log('Auth state changed. User:', user ? `${user.id} (${user.email})` : 'null')
    
    if (user) {
      // User logged in - prioritize Supabase data over localStorage
      console.log('User logged in, loading CF verification from Supabase')
      // Add a small delay to ensure Supabase client is ready
      setTimeout(() => {
        loadFromSupabase()
      }, 100)
    } else {
      // User logged out - clear local state only (don't delete from database)
      console.log('User logged out, clearing local CF verification state')
      localStorage.removeItem('cf_verification')
      setVerificationDataState(null)
      setIsVerified(false)
    }
  }, [user, loadFromSupabase])

  return (
    <CFVerificationContext.Provider
      value={{
        isVerified,
        verificationData,
        setVerificationData,
        clearVerification,
        resetVerificationUI,
        refreshVerificationStatus,
      }}
    >
      {children}
    </CFVerificationContext.Provider>
  )
}

export function useCFVerification() {
  const context = useContext(CFVerificationContext)
  if (context === undefined) {
    throw new Error('useCFVerification must be used within a CFVerificationProvider')
  }
  return context
}