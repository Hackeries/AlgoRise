'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Swords,
  Users,
  Trophy,
  Zap,
  Bot,
  UserPlus,
  Clock,
  Copy,
  Check,
  ChevronRight,
  Crown,
  Target,
  TrendingUp,
  Play,
  Share2,
  Calendar,
  AlertCircle,
  Loader2,
  Shield,
} from 'lucide-react'

type MatchType = '1v1' | '3v3'
type BotDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface UserStats {
  elo: number
  tier: string
  matchesPlayed: number
  winRate: number
  currentStreak: number
}

interface PendingChallenge {
  id: string
  createdAt: string
  expiresAt: string
  matchType: MatchType
  problemCount: number
}

const BOT_DIFFICULTIES: { value: BotDifficulty; label: string; rating: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', rating: '800-1000', description: 'New to competitive programming' },
  { value: 'intermediate', label: 'Intermediate', rating: '1200-1400', description: 'Comfortable with basics' },
  { value: 'advanced', label: 'Advanced', rating: '1600-1800', description: 'Strong problem solver' },
  { value: 'expert', label: 'Expert', rating: '2000+', description: 'Master level opponent' },
]

const TIER_COLORS: Record<string, string> = {
  bronze: 'text-amber-700 dark:text-amber-400',
  silver: 'text-gray-500 dark:text-gray-300',
  gold: 'text-yellow-500 dark:text-yellow-400',
  platinum: 'text-cyan-500 dark:text-cyan-400',
  diamond: 'text-blue-500 dark:text-blue-400',
  master: 'text-purple-500 dark:text-purple-400',
}

export default function ArenaPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'1v1' | '3v3'>('1v1')
  
  // Challenge friend state
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false)
  const [challengeLink, setChallengeLink] = useState<string | null>(null)
  const [challengeCopied, setChallengeCopied] = useState(false)
  const [creatingChallenge, setCreatingChallenge] = useState(false)
  
  // Bot match state
  const [botDialogOpen, setBotDialogOpen] = useState(false)
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('intermediate')
  const [startingBotMatch, setStartingBotMatch] = useState(false)
  
  // Quick match state
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login?redirect=/arena')
      return
    }
    
    fetchStats()
  }, [authLoading, user, router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSearching])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/arena/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        // Default stats for new users
        setStats({
          elo: 1200,
          tier: 'gold',
          matchesPlayed: 0,
          winRate: 0,
          currentStreak: 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch arena stats:', err)
      setStats({
        elo: 1200,
        tier: 'gold',
        matchesPlayed: 0,
        winRate: 0,
        currentStreak: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const createChallenge = async () => {
    setCreatingChallenge(true)
    setError(null)
    try {
      const res = await fetch('/api/arena/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchType: activeTab }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create challenge')
      }
      
      const data = await res.json()
      const link = `${window.location.origin}/arena/join/${data.challengeId}`
      setChallengeLink(link)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge')
    } finally {
      setCreatingChallenge(false)
    }
  }

  const copyChallenge = async () => {
    if (!challengeLink) return
    await navigator.clipboard.writeText(challengeLink)
    setChallengeCopied(true)
    setTimeout(() => setChallengeCopied(false), 2000)
  }

  const startBotMatch = async () => {
    setStartingBotMatch(true)
    setError(null)
    try {
      const res = await fetch('/api/arena/bot-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          matchType: activeTab,
          difficulty: botDifficulty,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start bot match')
      }
      
      const data = await res.json()
      router.push(`/arena/match/${data.matchId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start bot match')
      setStartingBotMatch(false)
    }
  }

  const startQuickMatch = async () => {
    setIsSearching(true)
    setSearchTime(0)
    setError(null)
    
    try {
      const res = await fetch('/api/arena/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchType: activeTab, mode: 'unranked' }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start matchmaking')
      }
      
      const data = await res.json()
      
      if (data.matchId) {
        router.push(`/arena/match/${data.matchId}`)
      } else if (data.queuePosition) {
        setQueuePosition(data.queuePosition)
        // Poll for match
        pollForMatch(data.queueId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Matchmaking failed')
      setIsSearching(false)
    }
  }

  const pollForMatch = async (queueId: string) => {
    const maxWait = 60 // 60 seconds max wait
    let elapsed = 0
    
    const poll = async () => {
      if (elapsed >= maxWait) {
        setIsSearching(false)
        setError('No opponents found. Try challenging a friend or playing against a bot!')
        return
      }
      
      try {
        const res = await fetch(`/api/arena/queue/${queueId}`)
        const data = await res.json()
        
        if (data.matchId) {
          router.push(`/arena/match/${data.matchId}`)
          return
        }
        
        setQueuePosition(data.position)
        elapsed += 3
        setTimeout(poll, 3000)
      } catch {
        setTimeout(poll, 3000)
        elapsed += 3
      }
    }
    
    poll()
  }

  const cancelSearch = async () => {
    setIsSearching(false)
    setQueuePosition(null)
    try {
      await fetch('/api/arena/matchmaking/cancel', { method: 'POST' })
    } catch {
      // Ignore
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 md:col-span-2" />
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Battle Arena</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Swords className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Battle Arena</h1>
              <p className="text-muted-foreground">Compete in real-time problem-solving duels</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Player Stats Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <Badge variant="outline" className={TIER_COLORS[stats?.tier ?? 'gold']}>
                    {stats?.tier?.toUpperCase() ?? 'GOLD'}
                  </Badge>
                </div>
                <div className="text-3xl font-bold">{stats?.elo ?? 1200}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs text-muted-foreground">Matches</span>
                  <p className="text-lg font-semibold">{stats?.matchesPlayed ?? 0}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Win Rate</span>
                  <p className="text-lg font-semibold">{stats?.winRate ?? 0}%</p>
                </div>
              </div>
              
              {(stats?.currentStreak ?? 0) > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{stats?.currentStreak} win streak</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match Type Selection */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Choose Battle Mode</CardTitle>
              <CardDescription>Select your preferred format</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as '1v1' | '3v3')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="1v1" className="gap-2">
                    <Swords className="h-4 w-4" />
                    1v1 Duel
                  </TabsTrigger>
                  <TabsTrigger value="3v3" className="gap-2">
                    <Users className="h-4 w-4" />
                    3v3 Team Battle
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="1v1" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Face off against a single opponent. First to solve 3 problems wins!
                  </p>
                  
                  <div className="grid sm:grid-cols-3 gap-3">
                    {/* Challenge Friend */}
                    <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:border-primary/50 transition-all">
                          <CardContent className="p-4 text-center">
                            <UserPlus className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <h4 className="font-semibold">Challenge Friend</h4>
                            <p className="text-xs text-muted-foreground mt-1">Share a link to battle</p>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Challenge a Friend</DialogTitle>
                          <DialogDescription>
                            Create a private match and share the link with your friend
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          {!challengeLink ? (
                            <Button 
                              onClick={createChallenge} 
                              disabled={creatingChallenge}
                              className="w-full"
                            >
                              {creatingChallenge ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Create Challenge Link
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Input value={challengeLink} readOnly className="flex-1" />
                                <Button onClick={copyChallenge} variant="outline" size="icon">
                                  {challengeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground text-center">
                                Link expires in 30 minutes
                              </p>
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                  setChallengeLink(null)
                                  setChallengeDialogOpen(false)
                                }}
                              >
                                Done
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Play vs Bot */}
                    <Dialog open={botDialogOpen} onOpenChange={setBotDialogOpen}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:border-primary/50 transition-all">
                          <CardContent className="p-4 text-center">
                            <Bot className="h-8 w-8 mx-auto mb-2 text-violet-500" />
                            <h4 className="font-semibold">Play vs Bot</h4>
                            <p className="text-xs text-muted-foreground mt-1">Instant match, no waiting</p>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Play Against Bot</DialogTitle>
                          <DialogDescription>
                            Choose your opponent's difficulty level
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Select value={botDifficulty} onValueChange={(v) => setBotDifficulty(v as BotDifficulty)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              {BOT_DIFFICULTIES.map(d => (
                                <SelectItem key={d.value} value={d.value}>
                                  <div className="flex flex-col">
                                    <span>{d.label}</span>
                                    <span className="text-xs text-muted-foreground">{d.rating} rating</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                              {BOT_DIFFICULTIES.find(d => d.value === botDifficulty)?.description}
                            </p>
                          </div>
                          
                          <Button 
                            onClick={startBotMatch} 
                            disabled={startingBotMatch}
                            className="w-full"
                          >
                            {startingBotMatch ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start Match
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Quick Match */}
                    <Card 
                      className="cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => !isSearching && startQuickMatch()}
                    >
                      <CardContent className="p-4 text-center">
                        {isSearching ? (
                          <>
                            <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
                            <h4 className="font-semibold">Searching...</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {searchTime}s {queuePosition && `• #${queuePosition} in queue`}
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2"
                              onClick={(e) => { e.stopPropagation(); cancelSearch(); }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Zap className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <h4 className="font-semibold">Quick Match</h4>
                            <p className="text-xs text-muted-foreground mt-1">Find an opponent</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="3v3" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Team up with 2 friends and battle another trio. Coordinate to solve problems faster!
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    {/* Create Team */}
                    <Card className="cursor-pointer hover:border-primary/50 transition-all">
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-semibold">Create Team</h4>
                        <p className="text-xs text-muted-foreground mt-1">Invite 2 friends to your team</p>
                      </CardContent>
                    </Card>

                    {/* Join Team */}
                    <Card className="cursor-pointer hover:border-primary/50 transition-all">
                      <CardContent className="p-4 text-center">
                        <UserPlus className="h-8 w-8 mx-auto mb-2 text-teal-500" />
                        <h4 className="font-semibold">Join Team</h4>
                        <p className="text-xs text-muted-foreground mt-1">Enter invite code</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      3v3 matches require all 6 players to be ready. Use the team system to coordinate!
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Match Features */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Match Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium text-sm">30 Min Time Limit</h4>
                <p className="text-xs text-muted-foreground">Race against time and opponent</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <Target className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium text-sm">3 Problems</h4>
                <p className="text-xs text-muted-foreground">Balanced difficulty progression</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium text-sm">Fog of Progress</h4>
                <p className="text-xs text-muted-foreground">Opponent status is hidden</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <TrendingUp className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium text-sm">ELO Ranking</h4>
                <p className="text-xs text-muted-foreground">Climb the leaderboard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Matches / Leaderboard Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {(stats?.matchesPlayed ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <Swords className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No matches yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start a battle to see your history</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Match history will appear here</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Leaderboard</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/arena/leaderboard">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Leaderboard</p>
                <p className="text-sm text-muted-foreground mt-1">Top players will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
