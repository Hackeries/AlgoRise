"use client"

import { useEffect, useState } from "react"
import { CFDashboard } from "@/components/dashboard/cf-dashboard"
import { WelcomeBanner } from "@/components/train/welcome-banner"
import { QuickActions } from "@/components/train/quick-actions"
import { RecentActivity } from "@/components/train/recent-activity"
import { UpcomingContests } from "@/components/train/upcoming-contests"
import { ProblemRecommendations } from "@/components/train/problem-recommendations"
import { GamifiedStrip } from "@/components/train/gamified-strip"
import { motion } from "framer-motion"
import { useCFVerification } from "@/lib/context/cf-verification"
import { useAuth } from "@/lib/auth/context"

export default function TrainingHub() {
  const { user } = useAuth()
  const { isVerified, verificationData } = useCFVerification()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // Check if this is a first-time visit after profile completion
    const isNewUser = sessionStorage.getItem("profile_just_completed")
    if (isNewUser) {
      setShowWelcome(true)
      sessionStorage.removeItem("profile_just_completed")
      // Auto-hide welcome banner after 10 seconds
      setTimeout(() => setShowWelcome(false), 10000)
    }
  }, [])

  return (
    <main className="flex flex-1 min-h-screen bg-gradient-to-br from-gray-900 via-neutral-900 to-gray-950 text-white">
      {/* Main Content */}
      <section className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Training Hub
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-300">
                  {isVerified && verificationData
                    ? `Welcome back, ${verificationData.handle}! Ready to level up?`
                    : "Track your progress, solve problems, and level up your skills"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Welcome Banner for new users */}
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <WelcomeBanner onDismiss={() => setShowWelcome(false)} />
            </motion.div>
          )}

          {/* Gamified progress strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-6"
          >
            <GamifiedStrip />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <QuickActions />
          </motion.div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Problem Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <ProblemRecommendations />
            </motion.div>

            {/* Right Column - Upcoming Contests */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <UpcomingContests />
            </motion.div>
          </div>

          {/* Dashboard Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-xl bg-neutral-900/80 p-4 sm:p-6 shadow-lg backdrop-blur-sm border border-gray-800 mb-6"
          >
            <CFDashboard />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <RecentActivity />
          </motion.div>
        </div>
      </section>
    </main>
  )
}
