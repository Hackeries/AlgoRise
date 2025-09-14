'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Timer, Trophy, Target, TrendingUp, Calendar, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger'

interface Contest {
  id: number
  name: string
  startTimeSeconds: number
  durationSeconds: number
  type: string
}

interface UserStats {
  totalSolved: number
  currentRating: number
  maxRating: number
  tagDistribution: Record<string, number>
}

export default function ModernLanding() {
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([])
  const [userHandle, setUserHandle] = useState('')
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState('')

  useEffect(() => {
    fetchUpcomingContests()
  }, [])

  const fetchUpcomingContests = async () => {
    try {
      const response = await fetch('/api/cf/contests')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      setUpcomingContests(data.upcoming || [])
    } catch (error) {
      console.error('Error fetching contests:', error)
      // Set empty array on error to show "No upcoming contests found"
      setUpcomingContests([])
    } finally {
      setLoading(false)
    }
  }

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

  const formatTimeRemaining = (startTime: number) => {
    const now = Math.floor(Date.now() / 1000)
    const diff = startTime - now
    
    if (diff <= 0) return 'Started'
    
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              AlgoRise
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Master competitive programming with adaptive practice sheets, 
              real-time contest tracking, and comprehensive progress analytics.
            </p>
          </div>
          
          {/* CF Verification Section */}
          <div className="max-w-md mx-auto mb-8">
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
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/adaptive-sheet">
                <Target className="mr-2 h-5 w-5" />
                Start Adaptive Practice
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/contests">
                <Calendar className="mr-2 h-5 w-5" />
                View Contests
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Upcoming Contests Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Contests</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with the latest Codeforces contests
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : upcomingContests.length > 0 ? (
              upcomingContests.map((contest) => (
                <div key={contest.id}>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{contest.name}</CardTitle>
                        <Badge variant="secondary">
                          {contest.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Timer className="h-4 w-4" />
                          <span>{formatTimeRemaining(contest.startTimeSeconds)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(contest.startTimeSeconds * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <Button 
                          asChild 
                          className="w-full mt-4" 
                          variant="outline"
                        >
                          <a 
                            href={`https://codeforces.com/contest/${contest.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Contest
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No upcoming contests found</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose AlgoRise?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built for competitive programmers who want to improve systematically
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg text-center h-full">
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
