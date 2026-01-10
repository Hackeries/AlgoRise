'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Zap,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Play,
  CheckCircle2,
  Flame,
  Calendar,
  BarChart3,
  Brain,
  Layers,
  ChevronRight,
  Lock,
  AlertCircle,
} from 'lucide-react'

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDay: string | null
}

interface AnalyticsSummary {
  currentStreak: number
  longestStreak: number
  problemsSolved: number
  avgTimeMins: number
  ratingChange: number
}

interface TopicMastery {
  tag: string
  mastery: number
  solved: number
  total: number
}

const QUICK_START_OPTIONS = [
  {
    id: 'warmup',
    title: 'Quick Warmup',
    description: '5 easy problems to get started',
    duration: '15 min',
    difficulty: 'Easy',
    icon: Zap,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    problems: 5,
  },
  {
    id: 'daily',
    title: 'Daily Challenge',
    description: 'Curated problems for today',
    duration: '45 min',
    difficulty: 'Mixed',
    icon: Calendar,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    problems: 8,
  },
  {
    id: 'focus',
    title: 'Focus Session',
    description: 'Deep practice on weak topics',
    duration: '60 min',
    difficulty: 'Adaptive',
    icon: Brain,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    problems: 10,
  },
  {
    id: 'marathon',
    title: 'Marathon Mode',
    description: 'Extended practice session',
    duration: '90+ min',
    difficulty: 'Hard',
    icon: Flame,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    problems: 15,
  },
]

export default function TrainPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [topicMastery, setTopicMastery] = useState<TopicMastery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const [streakRes, analyticsRes, masteryRes] = await Promise.allSettled([
          fetch('/api/streaks'),
          fetch('/api/analytics/summary'),
          fetch('/api/analytics/mastery'),
        ])

        if (streakRes.status === 'fulfilled' && streakRes.value.ok) {
          const data = await streakRes.value.json()
          setStreakData(data)
        }

        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
          const data = await analyticsRes.value.json()
          setAnalytics(data)
        }

        if (masteryRes.status === 'fulfilled' && masteryRes.value.ok) {
          const data = await masteryRes.value.json()
          if (Array.isArray(data)) {
            setTopicMastery(data.slice(0, 6))
          } else if (data.topics) {
            setTopicMastery(data.topics.slice(0, 6))
          }
        }
      } catch (err) {
        console.error('Failed to fetch training data:', err)
        setError('Failed to load training data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authLoading, user])

  const handleStartSession = (sessionType: string) => {
    router.push(`/train/session?type=${sessionType}`)
  }

  const currentStreak = streakData?.currentStreak ?? analytics?.currentStreak ?? 0
  const problemsSolved = analytics?.problemsSolved ?? 0
  const dailyGoalTarget = 5
  const dailyGoalProgress = Math.min(100, (problemsSolved / dailyGoalTarget) * 100)

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Practice</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
              <p className="text-muted-foreground mt-1">Build your skills with structured training sessions</p>
            </div>
            <Button size="lg" onClick={() => handleStartSession('custom')} className="gap-2">
              <Play className="h-4 w-4" />
              Start Custom Session
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Daily Progress Banner */}
        <Card className="mb-8 border-l-4 border-l-primary">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Daily Goal</h3>
                    {currentStreak > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {currentStreak} day streak
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {loading ? (
                      <Skeleton className="h-4 w-40" />
                    ) : (
                      `${Math.min(problemsSolved, dailyGoalTarget)} of ${dailyGoalTarget} problems solved today`
                    )}
                  </p>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(dailyGoalProgress)}%</span>
                </div>
                <Progress value={dailyGoalProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Grid */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Quick Start</h2>
            <Link href="/train/session" className="text-sm text-primary hover:underline flex items-center gap-1">
              Custom session <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_START_OPTIONS.map((option, idx) => {
              const Icon = option.icon
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card
                    className="group cursor-pointer hover:border-primary/50 transition-all h-full"
                    onClick={() => handleStartSession(option.id)}
                  >
                    <CardContent className="p-5">
                      <div className={`inline-flex p-2.5 rounded-lg ${option.bgColor} mb-4`}>
                        <Icon className={`h-5 w-5 ${option.color}`} />
                      </div>
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {option.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" />
                          {option.problems} problems
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Topic Progress */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Topic Progress</h2>
              <Link href="/analytics" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="divide-y divide-border">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="p-4">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : topicMastery.length === 0 ? (
                  <div className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No topic data yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Start solving problems to track your progress</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {topicMastery.map((topic, idx) => (
                      <motion.div
                        key={topic.tag}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                        onClick={() => handleStartSession(`topic-${topic.tag.toLowerCase().replace(/\s+/g, '-')}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium group-hover:text-primary transition-colors">
                              {topic.tag}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              {topic.solved}/{topic.total} solved
                            </span>
                            <Badge 
                              variant={topic.mastery >= 70 ? 'default' : topic.mastery >= 50 ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {Math.round(topic.mastery)}% mastery
                            </Badge>
                          </div>
                        </div>
                        <Progress value={topic.mastery} className="h-1.5" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Actions</h2>
            </div>
            <Card>
              <CardContent className="p-5 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => router.push('/adaptive-sheet')}
                >
                  <Target className="h-4 w-4" />
                  Adaptive Problem Sheet
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => router.push('/paths')}
                >
                  <BookOpen className="h-4 w-4" />
                  Learning Paths
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => router.push('/analytics')}
                >
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => router.push('/arena')}
                >
                  <Zap className="h-4 w-4" />
                  Battle Arena
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Stats Overview */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-5">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: 'Problems Solved', 
                value: loading ? null : problemsSolved, 
                icon: CheckCircle2, 
                description: 'Total solved' 
              },
              { 
                label: 'Current Streak', 
                value: loading ? null : currentStreak, 
                icon: Flame, 
                description: currentStreak > 0 ? 'Keep it up!' : 'Start today!',
                suffix: currentStreak > 0 ? ' days' : ''
              },
              { 
                label: 'Accuracy Rate', 
                value: loading ? null : (analytics?.avgTimeMins ? `${Math.min(100, Math.round(60 / analytics.avgTimeMins * 10))}%` : '--'), 
                icon: Target, 
                description: 'Based on attempts' 
              },
              { 
                label: 'Rating Change', 
                value: loading ? null : (analytics?.ratingChange ?? 0), 
                icon: TrendingUp, 
                description: 'This week',
                prefix: analytics?.ratingChange && analytics.ratingChange > 0 ? '+' : ''
              },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{stat.label}</span>
                      </div>
                      {stat.value === null ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{stat.prefix}{stat.value}{stat.suffix}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
