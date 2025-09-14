"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/context"
import { CFVerification } from "@/components/auth/cf-verification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [cfHandle, setCfHandle] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  if (!user) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-6">
        <p>Please sign in to access settings.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and competitive programming profile</p>
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
              <Input value={user.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={user.id} disabled className="font-mono text-sm" />
            </div>
          </CardContent>
        </Card>

        <CFVerification
          currentHandle={cfHandle}
          isVerified={isVerified}
          onVerificationComplete={() => setIsVerified(true)}
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
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Training Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded to maintain your streak</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
