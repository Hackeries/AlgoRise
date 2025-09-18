'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCFVerification } from '@/lib/context/cf-verification'
import { useAuth } from '@/lib/auth/context'
import { 
  BarChart3, 
  Target, 
  Flame, 
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  TrendingUp,
  LogIn,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { isVerified, verificationData } = useCFVerification()

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/70">Loading...</div>
        </div>
      </div>
    )
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <LogIn className="h-16 w-16 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Please Sign In</h2>
          <p className="text-white/70 text-center max-w-md">
            You need to sign in to view your dashboard and track your competitive programming progress.
          </p>
          <div className="flex gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show CF verification prompt if user is authenticated but not verified
  if (!isVerified) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <UserCheck className="h-16 w-16 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Verify Your Codeforces Account</h2>
          <p className="text-white/70 text-center max-w-md">
            To track your progress and get personalized recommendations, please verify your Codeforces handle.
          </p>
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/profile">Verify Codeforces Account</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Only show real data when user is verified
  const stats = {
    currentRating: verificationData?.rating || 0,
    problemsSolved: 0, // TODO: Fetch from database
    currentStreak: 0,  // TODO: Fetch from database  
    contests: 0        // TODO: Fetch from database
  }

  // Empty recent activity - TODO: Fetch from database
  const recentActivity: any[] = []

  const userName = verificationData?.handle || user?.email?.split('@')[0] || "User"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Good Evening, {userName}!</h1>
          <p className="text-white/70 mt-1">Here's your progress summary. Keep up the great work!</p>
        </div>
        {isVerified && verificationData && (
          <div className="text-right">
            <p className="text-sm text-white/70">Codeforces Handle</p>
            <p className="text-[#2563EB] font-semibold">{verificationData.handle}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a1f36] border-[#2a3441]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Current Rating</p>
                <p className="text-2xl font-bold text-white">{stats.currentRating}</p>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1f36] border-[#2a3441]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Problems Solved</p>
                <p className="text-2xl font-bold text-white">{stats.problemsSolved}</p>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1f36] border-[#2a3441]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1f36] border-[#2a3441]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Contests</p>
                <p className="text-2xl font-bold text-white">{stats.contests}</p>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Practice Button */}
      <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
        <Link href="/adaptive-sheet">
          Start Adaptive Practice Session
        </Link>
      </Button>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Progress */}
        <Card className="bg-[#1a1f36] border-[#2a3441]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Rating Progress
              {stats.currentRating > 0 && (
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                  Current: {stats.currentRating}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-32 bg-[#0f1423] rounded-lg flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-white/70">Rating chart visualization</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#1a1f36] border-[#2a3441]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-[#0f1423] rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.status === 'solved' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">{activity.problem}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {activity.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={activity.rating <= 900 ? "bg-gray-600" : activity.rating <= 1200 ? "bg-green-600" : "bg-blue-600"}
                      >
                        {activity.rating}
                      </Badge>
                      <p className="text-xs text-white/60 mt-1">{activity.time}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                      Notes
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="h-12 w-12 text-white/30 mb-3" />
                  <p className="text-white/70 font-medium">No recent activity</p>
                  <p className="text-white/50 text-sm mt-1">Start solving problems to see your activity here</p>
                  <Button asChild className="mt-3" variant="outline" size="sm">
                    <Link href="/adaptive-sheet">Begin Practice</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional content to test scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1f36] border-[#2a3441]">
          <CardHeader>
            <CardTitle className="text-white">Today's Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#0f1423] rounded-lg">
                <span className="text-white">Complete 3 problems</span>
                <Badge variant="outline">2/3</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f1423] rounded-lg">
                <span className="text-white">Practice for 1 hour</span>
                <Badge variant="outline">45/60 min</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f1423] rounded-lg">
                <span className="text-white">Review weak topics</span>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1f36] border-[#2a3441]">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/adaptive-sheet">Practice Problems</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/contests">View Contests</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/paths">Learning Paths</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
