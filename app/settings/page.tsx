"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/context"
import { CFVerification } from "@/components/auth/cf-verification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCFVerification } from "@/lib/context/cf-verification"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CFVerificationDebug } from "@/components/debug/cf-verification-debug"

export default function SettingsPage() {
  const { user } = useAuth()
  const { isVerified, verificationData } = useCFVerification()
  const { toast } = useToast()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [dailyReminders, setDailyReminders] = useState(true)

  const handleEmailNotificationsToggle = () => {
    setEmailNotifications(!emailNotifications)
    toast({
      title: "Email Notifications",
      description: `Email notifications ${!emailNotifications ? 'enabled' : 'disabled'}`,
    })
  }

  const handleDailyRemindersToggle = () => {
    setDailyReminders(!dailyReminders)
    toast({
      title: "Daily Training Reminders",
      description: `Daily reminders ${!dailyReminders ? 'enabled' : 'disabled'}`,
    })
  }

  // For demo purposes, create a mock user if none exists
  const demoUser = user || { 
    email: "demo@example.com", 
    id: "demo-user-123" 
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and competitive programming profile</p>
        {isVerified && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">
              Codeforces verified as <strong>{verificationData?.handle}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={demoUser.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={demoUser.id} disabled className="font-mono text-sm" />
            </div>
          </CardContent>
        </Card>

        <CFVerification
          currentHandle={verificationData?.handle || ""}
          isVerified={isVerified}
          onVerificationComplete={() => {
            // Verification completion is handled by the global context
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your AlgoRise experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates about contests and achievements</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: <span className={emailNotifications ? "text-green-600" : "text-red-600"}>
                    {emailNotifications ? "Enabled" : "Disabled"}
                  </span>
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleEmailNotificationsToggle}>
                {emailNotifications ? "Disable" : "Enable"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Training Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded to maintain your streak</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: <span className={dailyReminders ? "text-green-600" : "text-red-600"}>
                    {dailyReminders ? "Enabled" : "Disabled"}
                  </span>
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDailyRemindersToggle}>
                {dailyReminders ? "Disable" : "Enable"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <CFVerificationDebug />
      </div>
    </div>
  )
}
