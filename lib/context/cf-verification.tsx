'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
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
  allowReVerification: () => void
}

const CFVerificationContext = createContext<CFVerificationContextType | undefined>(undefined)

// fetch fresh cf data from codeforces api
async function fetchCFData(handle: string): Promise<CFVerificationData | null> {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
    const json = await res.json()
    if (json.status !== 'OK') return null

    const user = json.result[0]
    return {
      handle: user.handle,
      rating: user.rating ?? 0,
      maxRating: user.maxRating ?? 0,
      rank: user.rank ?? 'unrated',
      verifiedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function CFVerificationProvider({ children }: { children: ReactNode }) {
  const [verificationData, setVerificationDataState] = useState<CFVerificationData | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const { user } = useAuth()

  // try to create supabase client
  let supabase: any = null
  try {
    supabase = createClient()
  } catch {
    // supabase not available
  }

  // save verification to supabase
  const saveToSupabase = useCallback(
    async (data: CFVerificationData) => {
      if (!user || !supabase) return

      try {
        // save to cf_handles table
        await supabase.from('cf_handles').upsert(
          {
            user_id: user.id,
            handle: data.handle,
            verified: true,
            created_at: data.verifiedAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

        // save snapshot
        await supabase.from('cf_snapshots').insert({
          user_id: user.id,
          handle: data.handle,
          rating: data.rating,
          max_rating: data.maxRating,
          rank: data.rank,
          problems_solved: 0,
          snapshot_at: new Date().toISOString(),
        })
      } catch (err) {
        console.error('Failed to save CF verification to Supabase:', err)
      }
    },
    [user, supabase]
  )

  // set verification data and persist
  const setVerificationData = useCallback(
    async (data: CFVerificationData | null) => {
      if (!data) {
        localStorage.removeItem('cf_verification')
        setVerificationDataState(null)
        setIsVerified(false)
        return
      }

      setVerificationDataState(data)
      setIsVerified(true)

      // save to supabase in background
      if (user) {
        saveToSupabase(data)
      }
    },
    [user, saveToSupabase]
  )

  // load verification from supabase
  const loadFromSupabase = useCallback(async () => {
    if (!user || !supabase) return

    try {
      const { data: handleData, error } = await supabase
        .from('cf_handles')
        .select('handle, verified, created_at')
        .eq('user_id', user.id)
        .single()

      if (error || !handleData?.verified) return

      // get latest snapshot for rating
      const { data: snapshotData } = await supabase
        .from('cf_snapshots')
        .select('rating, max_rating, rank')
        .eq('user_id', user.id)
        .order('snapshot_at', { ascending: false })
        .limit(1)
        .single()

      const data: CFVerificationData = {
        handle: handleData.handle,
        rating: snapshotData?.rating || 0,
        maxRating: snapshotData?.max_rating || 0,
        rank: snapshotData?.rank || 'unrated',
        verifiedAt: handleData.created_at,
      }

      setVerificationDataState(data)
      setIsVerified(true)

      // refresh cf data in background
      fetchCFData(handleData.handle).then((freshData) => {
        if (freshData) {
          setVerificationDataState(freshData)
        }
      })
    } catch (err) {
      console.error('Failed to load CF verification from Supabase:', err)
    }
  }, [user, supabase])

  // refresh from localstorage
  const refreshVerificationStatus = useCallback(() => {
    try {
      const stored = localStorage.getItem('cf_verification')
      if (stored) {
        const data = JSON.parse(stored) as CFVerificationData
        setVerificationDataState(data)
        setIsVerified(true)
      }
    } catch {
      setVerificationDataState(null)
      setIsVerified(false)
    }
  }, [])

  // clear verification completely
  const clearVerification = useCallback(async () => {
    localStorage.removeItem('cf_verification')
    setVerificationDataState(null)
    setIsVerified(false)

    if (user && supabase) {
      try {
        await supabase.from('cf_handles').delete().eq('user_id', user.id)
      } catch (err) {
        console.error('Failed to clear CF verification from Supabase:', err)
      }
    }
  }, [user, supabase])

  const resetVerificationUI = useCallback(() => {
    localStorage.removeItem('cf_verification')
    setVerificationDataState(null)
    setIsVerified(false)
  }, [])

  const allowReVerification = useCallback(() => {
    setVerificationDataState(null)
    setIsVerified(false)
  }, [])

  // initialize on mount
  useEffect(() => {
    refreshVerificationStatus()
    if (user) loadFromSupabase()
  }, [user, loadFromSupabase, refreshVerificationStatus])

  return (
    <CFVerificationContext.Provider
      value={{
        isVerified,
        verificationData,
        setVerificationData,
        clearVerification,
        resetVerificationUI,
        refreshVerificationStatus,
        allowReVerification,
      }}
    >
      {children}
    </CFVerificationContext.Provider>
  )
}

export function useCFVerification() {
  const context = useContext(CFVerificationContext)
  if (!context) {
    throw new Error('useCFVerification must be used within a CFVerificationProvider')
  }
  return context
}
