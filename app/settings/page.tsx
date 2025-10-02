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
import { CheckCircle2, Mail, Bell, User, Shield, Settings as SettingsIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {motion, AnimatePresence} from 'framer-motion'
export default function SettingsPage() {
  const { user } = useAuth()
  const { isVerified, verificationData } = useCFVerification()
  const { toast } = useToast()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [dailyReminders, setDailyReminders] = useState(true)

  const handleEmailNotificationsToggle = () => {
    const newState = !emailNotifications
    setEmailNotifications(newState)
    toast({
      title: newState ? "Email Notifications Enabled" : "Email Notifications Disabled",
      description: newState 
        ? "You'll receive updates about contests and achievements" 
        : "You won't receive email notifications",
    })
  }

  const handleDailyRemindersToggle = () => {
    const newState = !dailyReminders
    setDailyReminders(newState)
    toast({
      title: newState ? "Daily Reminders Enabled" : "Daily Reminders Disabled",
      description: newState 
        ? "You'll receive daily training reminders" 
        : "Daily reminders are now disabled",
    })
  }

  const demoUser = user || { 
    email: "demo@example.com", 
    id: "demo-user-123" 
  }

  return (
    <AnimatePresence>
      <motion.div
        className="flex-1 w-full min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        layout
      >
        <div className="mx-auto max-w-3xl lg:max-w-4xl px-4 sm:px-6 py-6 sm:py-8 transition-all duration-300">
          {/* Header Section */}
          <motion.header
            className="mb-6 sm:mb-8 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04 }}
            layout
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Manage your account and competitive programming profile
            </p>

            {/* Verification Status Banner */}
            {isVerified && (
              <motion.div
                className="inline-flex items-center gap-2.5 px-3 sm:px-4 py-2.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg transition-all"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                layout
              >
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                  Codeforces verified as <strong className="font-semibold">{verificationData?.handle}</strong>
                </span>
              </motion.div>
            )}
          </motion.header>

          {/* Settings Grid */}
          <div className="grid gap-4 sm:gap-6">
            {/* Account Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              layout
            >
              <Card className="border-2 transition-all duration-200 hover:shadow-lg hover:border-primary/20">
                <CardHeader className="space-y-1 pb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl sm:text-2xl">Account Information</CardTitle>
                  </div>
                  <CardDescription className="text-sm sm:text-base">
                    Your basic account details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        value={demoUser.email || ""}
                        disabled
                        className="h-10 sm:h-11 bg-muted/50 cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userId" className="text-sm sm:text-base font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        User ID
                      </Label>
                      <Input
                        id="userId"
                        value={demoUser.id}
                        disabled
                        className="h-10 sm:h-11 font-mono text-xs sm:text-sm bg-muted/50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CF Verification Component */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.18 }}
              layout
            >
              <div className="transition-all duration-200">
                <CFVerification
                  currentHandle={verificationData?.handle || ""}
                  isVerified={isVerified}
                  onVerificationComplete={() => {
                    // Verification completion is handled by the global context
                  }}
                />
              </div>
            </motion.div>

            {/* Preferences Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.26 }}
              whileHover={{ scale: 1.01 }}
              layout
            >
              <Card className="border-2 transition-all duration-200 hover:shadow-lg hover:border-primary/20">
                <CardHeader className="space-y-1 pb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl sm:text-2xl">Preferences</CardTitle>
                  </div>
                  <CardDescription className="text-sm sm:text-base">
                    Customize your AlgoRise experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Email Notifications */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-muted/30 transition-all hover:bg-muted/50 hover:border-primary/20">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm sm:text-base font-medium cursor-pointer">Email Notifications</Label>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Receive updates about contests and achievements
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <div className={`h-2 w-2 rounded-full transition-colors ${emailNotifications ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-xs font-medium transition-colors ${emailNotifications ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {emailNotifications ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={handleEmailNotificationsToggle}
                      className="transition-all"
                    />
                  </div>

                  {/* Daily Reminders */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-muted/30 transition-all hover:bg-muted/50 hover:border-primary/20">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm sm:text-base font-medium cursor-pointer">Daily Training Reminders</Label>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Get reminded to maintain your streak
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <div className={`h-2 w-2 rounded-full transition-colors ${dailyReminders ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-xs font-medium transition-colors ${dailyReminders ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {dailyReminders ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={dailyReminders}
                      onCheckedChange={handleDailyRemindersToggle}
                      className="transition-all"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Debug Component - Hidden on mobile */}
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: 0.34 }}
              layout
            >
              <div className="transition-all duration-200">
                <CFVerificationDebug />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}