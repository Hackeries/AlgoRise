'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  refreshVerificationStatus: () => void
}

const CFVerificationContext = createContext<CFVerificationContextType | undefined>(undefined)

interface CFVerificationProviderProps {
  children: ReactNode
}

export function CFVerificationProvider({ children }: CFVerificationProviderProps) {
  const [verificationData, setVerificationDataState] = useState<CFVerificationData | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  // Initialize verification status from localStorage
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
        setVerificationDataState(data)
        setIsVerified(true)
      } else {
        setVerificationDataState(null)
        setIsVerified(false)
      }
    } catch (error) {
      console.error('Error reading CF verification status:', error)
      setVerificationDataState(null)
      setIsVerified(false)
    }
  }

  // Set verification data and update localStorage
  const setVerificationData = (data: CFVerificationData | null) => {
    try {
      if (data) {
        localStorage.setItem('cf_verification', JSON.stringify(data))
        setVerificationDataState(data)
        setIsVerified(true)
      } else {
        localStorage.removeItem('cf_verification')
        setVerificationDataState(null)
        setIsVerified(false)
      }
    } catch (error) {
      console.error('Error storing CF verification data:', error)
    }
  }

  // Clear verification data
  const clearVerification = () => {
    setVerificationData(null)
  }

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

  return (
    <CFVerificationContext.Provider
      value={{
        isVerified,
        verificationData,
        setVerificationData,
        clearVerification,
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