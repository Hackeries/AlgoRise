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
} from 'lucide-react'

interface DailyGoal {
  target: number
  completed: number
  streak: number
}

interface TopicProgress {
  name: string
  solved: number
  total: number
  mastery: number
}

interface RecentSession {
  id: string
  date: string
  problemsSolved: number
  duration: number
  topics: string[]
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

const TOPIC_CATEGORIES = [
  { name: 'Arrays & Strings', solved: 45, total: 80, mastery: 72 },
  { name: 'Dynamic Programming', solved: 28, total: 60, mastery: 58 },
  { name: 'Graph Algorithms', solved: 22, total: 50, mastery: 55 },
  { name: 'Binary Search', solved: 18, total: 25, mastery: 85 },
  { name: 'Number Theory', solved: 12, total: 35, mastery: 42 },
  { name: 'Greedy', solved: 30, total: 40, mastery: 78 },
]

const DIFFICULTY_LEVELS = [
  { rating: '800-1000', label: 'Beginner', solved: 85, color: 'bg-teal-500' },
  { rating: '1100-1300', label: 'Easy', solved: 62, color: 'bg-sky-500' },
  { rating: '1400-1600', label: 'Medium', solved: 38, color: 'bg-amber-500' },
  { rating: '1700-1900', label: 'Hard', solved: 15, color: 'bg-orange-600' },
  { rating: '2000+', label: 'Expert', solved: 5, color: 'bg-rose-600' },
]

export default function TrainPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({ target: 5, completed: 2, streak: 7 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStartSession = (sessionType: string) => {
    router.push(`/train/session?type=${sessionType}`)
  }

  if (!mounted) {
    return null
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
                    <Badge variant="secondary" className="gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {dailyGoal.streak} day streak
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {dailyGoal.completed} of {dailyGoal.target} problems solved today
                  </p>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round((dailyGoal.completed / dailyGoal.target) * 100)}%</span>
                </div>
                <Progress value={(dailyGoal.completed / dailyGoal.target) * 100} className="h-2" />
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
                <div className="divide-y divide-border">
                  {TOPIC_CATEGORIES.map((topic, idx) => (
                    <motion.div
                      key={topic.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => handleStartSession(`topic-${topic.name.toLowerCase().replace(/\s+/g, '-')}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium group-hover:text-primary transition-colors">
                            {topic.name}
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
                            {topic.mastery}% mastery
                          </Badge>
                        </div>
                      </div>
                      <Progress value={topic.mastery} className="h-1.5" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Difficulty Breakdown */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">By Difficulty</h2>
            </div>
            <Card>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {DIFFICULTY_LEVELS.map((level, idx) => (
                    <motion.div
                      key={level.rating}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-2 h-8 rounded-full ${level.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{level.rating}</span>
                          <span className="text-xs text-muted-foreground">{level.solved} solved</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{level.label}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  onClick={() => handleStartSession('rating-based')}
                >
                  Practice by Rating
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Training Paths */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Structured Paths</h2>
            <Link href="/paths" className="text-sm text-primary hover:underline flex items-center gap-1">
              All paths <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Newbie to Pupil',
                description: 'Master the fundamentals and reach 1200 rating',
                progress: 65,
                totalProblems: 50,
                completed: 32,
                locked: false,
              },
              {
                title: 'Pupil to Specialist',
                description: 'Intermediate techniques for 1400+ rating',
                progress: 28,
                totalProblems: 75,
                completed: 21,
                locked: false,
              },
              {
                title: 'Specialist to Expert',
                description: 'Advanced algorithms for competitive edge',
                progress: 0,
                totalProblems: 100,
                completed: 0,
                locked: true,
              },
            ].map((path, idx) => (
              <motion.div
                key={path.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className={`h-full ${path.locked ? 'opacity-60' : 'hover:border-primary/50'} transition-all`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{path.title}</CardTitle>
                      {path.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{path.completed}/{path.totalProblems} problems</span>
                      <span className="font-medium">{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="h-1.5" />
                    {!path.locked && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-4 gap-2"
                        onClick={() => router.push(`/paths?path=${path.title.toLowerCase().replace(/\s+/g, '-')}`)}
                      >
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Overview */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-5">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Problems Solved', value: '205', icon: CheckCircle2, trend: '+12 this week' },
              { label: 'Current Streak', value: `${dailyGoal.streak} days`, icon: Flame, trend: 'Keep it up!' },
              { label: 'Accuracy Rate', value: '78%', icon: Target, trend: '+5% vs last month' },
              { label: 'Study Time', value: '24h', icon: Clock, trend: 'This month' },
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
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
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
