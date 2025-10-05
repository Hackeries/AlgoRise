'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useCFVerification } from '@/lib/context/cf-verification'
import { createClient } from '@/lib/supabase/client'

export function CFVerificationDebug() {
  const { user } = useAuth()
  const { isVerified, verificationData } = useCFVerification()
  const [dbTest, setDbTest] = useState<string>('')

  const testDatabase = async () => {
    if (!user) {
      setDbTest('No user logged in')
      return
    }

    try {
      const supabase = createClient()
      
      // Test cf_handles table
      const { data: handleData, error: handleError } = await supabase
        .from('cf_handles')
        .select('*')
        .eq('user_id', user.id)

      if (handleError) {
        setDbTest(`Error: ${handleError.code} - ${handleError.message}`)
        return
      }

      // Test cf_snapshots table
      const { data: snapshotData, error: snapshotError } = await supabase
        .from('cf_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('snapshot_at', { ascending: false })
        .limit(1)

      if (snapshotError) {
        setDbTest(`Snapshot Error: ${snapshotError.code} - ${snapshotError.message}`)
        return
      }

      setDbTest(`✅ Database OK - Handle: ${handleData?.length || 0} records, Snapshots: ${snapshotData?.length || 0} records`)
    } catch (error) {
      setDbTest(`Exception: ${error}`)
    }
  }

  useEffect(() => {
    if (user) {
      testDatabase()
    }
  }, [user])

  if (!user) return null

  return (
    <div className="p-4 bg-gray-800 rounded-lg mt-4">
      <h3 className="text-lg font-semibold text-white mb-2">CF Verification Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>User:</strong> {user.email} ({user.id})
        </div>
        <div>
          <strong>CF Verified:</strong> {isVerified ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>CF Handle:</strong> {verificationData?.handle || 'None'}
        </div>
        <div>
          <strong>CF Rating:</strong> {verificationData?.rating || 'N/A'}
        </div>
        <div>
          <strong>Database Test:</strong> {dbTest || 'Testing...'}
        </div>
        <button 
          onClick={testDatabase}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
        >
          Test Database
        </button>
      </div>
    </div>
  )
}