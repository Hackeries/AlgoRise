"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Sparkles, Target, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Check if user has seen the welcome banner
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcomeBanner")
    const justCompletedProfile = sessionStorage.getItem("profileCompleted")

    if (!hasSeenWelcome || justCompletedProfile) {
      setIsVisible(true)
      // Clear the session flag
      sessionStorage.removeItem("profileCompleted")
    }

    // Get user name from profile
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.handle) {
          setUserName(data.handle)
        }
      })
      .catch(() => {})
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("hasSeenWelcomeBanner", "true")
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Card className="relative overflow-hidden border-2 border-blue-500/30 bg-gradient-to-br from-blue-950/50 via-purple-950/30 to-pink-950/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

            <CardContent className="relative p-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-white"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Welcome to AlgoRise{userName ? `, ${userName}` : ""}! 🚀
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-300 leading-relaxed">
                      Your competitive programming journey starts here. We've analyzed your Codeforces profile and
                      created a personalized training plan to help you reach the next level.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <Target className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-white">Adaptive Practice</div>
                        <div className="text-xs text-gray-400 mt-1">Problems matched to your level</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <TrendingUp className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-white">Track Progress</div>
                        <div className="text-xs text-gray-400 mt-1">Monitor your improvement</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <Sparkles className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-white">Smart Recommendations</div>
                        <div className="text-xs text-gray-400 mt-1">AI-powered problem selection</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Link href="/adaptive-sheet">Start Practicing Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-gray-600 hover:bg-white/10 bg-transparent">
                      <Link href="/paths">Explore Learning Paths</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
