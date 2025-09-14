'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Shield, Plus } from 'lucide-react'
import CFVerificationDialog from './cf-verification-dialog'

interface CFVerificationTriggerProps {
  onVerificationComplete?: (data: { handle: string; rating: number; method: string }) => void
  showTitle?: boolean
  compact?: boolean
}

export default function CFVerificationTrigger({ 
  onVerificationComplete, 
  showTitle = true, 
  compact = false 
}: CFVerificationTriggerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedHandle, setVerifiedHandle] = useState<string>('')

  const handleVerificationSuccess = (handle: string) => {
    setIsVerified(true)
    setVerifiedHandle(handle)
    setDialogOpen(false)
    
    if (onVerificationComplete) {
      onVerificationComplete({
        handle,
        rating: 1200, // Default rating, will be updated from API
        method: 'oauth'
      })
    }
  }

  if (compact && isVerified) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm bg-green-900/20 border border-green-700 rounded-lg p-3">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-green-400">Verified: {verifiedHandle}</span>
      </div>
    )
  }

  if (compact && !isVerified) {
    return (
      <>
        <Button 
          onClick={() => setDialogOpen(true)}
          variant="outline"
          className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/20"
        >
          <Shield className="w-4 h-4 mr-2" />
          Verify Codeforces Account
        </Button>
        
        <CFVerificationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleVerificationSuccess}
        />
      </>
    )
  }

  if (isVerified) {
    return (
      <Card className="border-green-700 bg-green-900/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="font-semibold text-white">Codeforces Account Verified</h3>
              <p className="text-sm text-green-300">Handle: {verifiedHandle}</p>
            </div>
            <Badge variant="secondary" className="ml-auto bg-green-900/50 text-green-400">
              Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          {showTitle && (
            <>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5" />
                Connect Codeforces Account
              </CardTitle>
              <CardDescription className="text-slate-300">
                Verify your Codeforces account to unlock personalized features
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-slate-300">
              <p>Benefits of verification:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Adaptive practice problems based on your rating</li>
                <li>Progress tracking and analytics</li>
                <li>Contest reminders and participation history</li>
                <li>Leaderboard rankings</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => setDialogOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Verify Codeforces Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <CFVerificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleVerificationSuccess}
      />
    </>
  )
}