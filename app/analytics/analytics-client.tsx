'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Trophy, Target, Calendar, Flame, BarChart3, User, LogIn } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard/shell'
import { LeftRail } from '@/components/dashboard/left-rail'
import { SummaryCards } from '@/components/analytics/summary-cards'
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap'
import { RatingTrend } from '@/components/analytics/rating-trend'
import { TagAccuracy } from '@/components/analytics/tag-accuracy'
import CFVerificationTrigger from '@/components/auth/cf-verification-trigger'
import CFVerificationDialog from '@/components/auth/cf-verification-dialog'
import { useCFVerification } from '@/lib/context/cf-verification'
import { useAuth } from '@/lib/auth/context'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AnalyticsPageClient() {
  const { user, loading } = useAuth()
  const { isVerified, verificationData } = useCFVerification()
  const [range, setRange] = useState<"7d" | "30d">("7d")

  // Show loading state
  if (loading) {
    return (
      <DashboardShell
        left={<LeftRail />}
        center={
          <div className="flex items-center justify-center h-64">
            <div className="text-white/70">Loading...</div>
          </div>
        }
      />
    )
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <DashboardShell
        left={<LeftRail />}
        center={
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="mb-8">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h1 className="text-3xl font-bold mb-2">Progress & Analytics</h1>
                <p className="text-muted-foreground text-lg mb-8">
                  Track your competitive programming journey with detailed analytics and insights
                </p>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-8 mb-8">
                <LogIn className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Please Sign In</h3>
                <p className="text-white/70 mb-6">
                  You need to sign in to view your analytics and track your competitive programming progress.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/auth/sign-up">Create Account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        }
      />
    )
  }

  // Fetch summary analytics only if verified
  const { data: summary, isLoading: summaryLoading } = useSWR(
    isVerified && verificationData ? `/api/analytics/summary?range=${range}&handle=${verificationData.handle}` : null,
    fetcher
  )

  if (!isVerified) {
    return (
      <DashboardShell
        left={<LeftRail />}
        center={
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="mb-8">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h1 className="text-3xl font-bold mb-2">Progress & Analytics</h1>
                <p className="text-muted-foreground text-lg mb-8">
                  Track your competitive programming journey with detailed analytics and insights
                </p>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-8 mb-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verify Your Codeforces Profile</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your Codeforces account to access personalized analytics, progress tracking, and insights.
                </p>
                
                <CFVerificationTrigger 
                  showTitle={false}
                  compact={true}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <Card>
                  <CardContent className="p-6">
                    <Trophy className="h-8 w-8 text-yellow-500 mb-3" />
                    <h4 className="font-semibold mb-2">Contest Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Track your rating progression and contest participation history
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Target className="h-8 w-8 text-green-500 mb-3" />
                    <h4 className="font-semibold mb-2">Problem Solving Stats</h4>
                    <p className="text-sm text-muted-foreground">
                      Analyze your strengths and weaknesses across different topics
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Flame className="h-8 w-8 text-red-500 mb-3" />
                    <h4 className="font-semibold mb-2">Activity Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor your daily practice habits and maintain streaks
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        }
      />
    )
  }

  return (
    <DashboardShell
      left={<LeftRail />}
      center={
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">Progress & Analytics</h1>
                <p className="text-muted-foreground">
                  Detailed insights for <Badge variant="secondary">{verificationData?.handle}</Badge>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant={range === "7d" ? "default" : "outline"}
                  onClick={() => setRange("7d")}
                >
                  7 Days
                </Button>
                <Button 
                  size="sm" 
                  variant={range === "30d" ? "default" : "outline"}
                  onClick={() => setRange("30d")}
                >
                  30 Days
                </Button>
              </div>
            </div>
            
            {summaryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="h-16 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <SummaryCards summary={summary} />
            )}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contests">Contests</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Rating Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RatingTrend range={range} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Activity Heatmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityHeatmap range={range} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Contest Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RatingTrend range={range} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Topic Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TagAccuracy range={range} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    Practice Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityHeatmap range={range} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      }
    />
  )
}