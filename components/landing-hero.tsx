'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trophy, Target, TrendingUp, Calendar, Users } from 'lucide-react'
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger'
import ContestSection from './contests-section'
import BannerLanding from './banner-landing'
import { motion } from "framer-motion"

interface UserStats {
  totalSolved: number
  currentRating: number
  maxRating: number
  tagDistribution: Record<string, number>
}

export default function ModernLanding() {
  const [userHandle, setUserHandle] = useState('')
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState('')

  const fetchUserStats = async () => {
    if (!userHandle.trim()) return

    setUserLoading(true)
    setUserError('')
    setUserStats(null)
    try {
      const response = await fetch(`/api/cf/profile?handle=${userHandle}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (jsonError) {
        console.error('JSON parse error in profile fetch. Response was:', text.substring(0, 200))
        throw new Error('Invalid response format from profile API')
      }

      setUserStats(data.stats)
    } catch (error) {
      console.error('Error fetching user stats:', error)
      let errorMessage = 'Failed to fetch user data. Please try again.'

      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          errorMessage = `User '${userHandle}' not found on Codeforces. Please check the handle and try again.`
        } else {
          errorMessage = error.message
        }
      }

      setUserError(errorMessage)
    } finally {
      setUserLoading(false)
    }
  }

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <BannerLanding />

          {/* CF Verification Section */}
          <div className="max-w-md mx-auto mt-10 mb-8">
            <CFVerificationTrigger
              compact={true}
              showTitle={false}
              onVerificationComplete={(data) => {
                setUserHandle(data.handle)
                fetchUserStats()
              }}
            />
          </div>

          {/* User Handle Input */}
          <div className="max-w-md mx-auto mb-12">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Codeforces handle"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchUserStats()}
                className="flex-1"
              />
              <Button onClick={fetchUserStats} disabled={userLoading}>
                {userLoading ? 'Loading...' : 'Get Stats'}
              </Button>
            </div>
          </div>

          {/* User Stats Card */}
          {userError && (
            <div className="max-w-4xl mx-auto mb-12">
              <Card className="bg-red-50 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800">
                <CardContent className="p-6">
                  <div className="text-center text-red-600 dark:text-red-400">
                    {userError}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {userStats && (
            <div className="max-w-4xl mx-auto mb-12">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    {userHandle}'s Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{userStats.totalSolved}</div>
                      <div className="text-gray-600 dark:text-gray-400">Problems Solved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{userStats.currentRating}</div>
                      <div className="text-gray-600 dark:text-gray-400">Current Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{userStats.maxRating}</div>
                      <div className="text-gray-600 dark:text-gray-400">Max Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <ContestSection />

      {/* Features Section */}
      <section className="py-40 px-4 bg-radial-[at_50%_75%] from-indigo-700 to-transparent to-70% rounded-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose <span className='text-yellow-400'>AlgoRise</span>?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built for competitive programmers who want to improve systematically at your own pace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-5">
            {[
              {
                icon: Target,
                title: 'Adaptive Practice',
                description: 'Problems tailored to your skill level that evolve as you improve'
              },
              {
                icon: TrendingUp,
                title: 'Progress Analytics',
                description: 'Detailed insights into your solving patterns and improvement areas'
              },
              {
                icon: Calendar,
                title: 'Contest Tracking',
                description: 'Never miss a contest with real-time updates and reminders'
              },
              {
                icon: Users,
                title: 'Community',
                description: 'Join groups, compete with friends, and climb leaderboards'
              }
            ].map((feature, i) => (
              <div key={feature.title}>
                <motion.div className="block h-full"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}>
                  <Card className="border-1 border-solid border-[#DCD9D4] backdrop-blur-sm shadow-lg text-center h-full hover:drop-shadow-[0_0_2px_var(--primary)]">
                    <CardContent className="p-6">
                      <feature.icon className="h-12 w-12 mx-auto mb-4 text-[#DCD9D4] drop-shadow-[0_0_15px_var(--primary)] animate-bounce" />
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
