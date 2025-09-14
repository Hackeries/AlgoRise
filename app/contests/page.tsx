'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarIcon, ClockIcon, UsersIcon, PlusIcon, ExternalLinkIcon } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type CodeforcesContest = {
  id: number
  name: string
  type: string
  phase: string
  durationSeconds: number
  startTimeSeconds?: number
  relativeTimeSeconds?: number
}

type PrivateContest = {
  id: string
  name: string
  status: string
  starts_at?: string
  ends_at?: string
  host_user_id: string
  created_at: string
}

export default function ContestsPage() {
  const [upcomingCfContests, setUpcomingCfContests] = useState<CodeforcesContest[]>([])
  const [privateContests, setPrivateContests] = useState<PrivateContest[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newContestName, setNewContestName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      // Fetch Codeforces contests
      try {
        const cfResponse = await fetch('/api/cf/contests')
        if (cfResponse.ok) {
          const cfData = await cfResponse.json()
          setUpcomingCfContests(cfData.upcoming || [])
        } else {
          console.error('Failed to fetch CF contests:', cfResponse.status)
        }
      } catch (cfError) {
        console.error('Error fetching CF contests:', cfError)
      }

      // Fetch private contests
      try {
        const privateResponse = await fetch('/api/contests')
        if (privateResponse.ok) {
          const privateData = await privateResponse.json()
          setPrivateContests(privateData.contests || [])
        } else {
          console.error('Failed to fetch private contests:', privateResponse.status)
        }
      } catch (privateError) {
        console.error('Error fetching private contests:', privateError)
      }
    } catch (error) {
      console.error('Error fetching contests:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch contests',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createContest = async () => {
    if (!newContestName.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newContestName.trim() })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Contest created successfully'
        })
        setNewContestName('')
        setCreateDialogOpen(false)
        fetchContests() // Refresh the list
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to create contest',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create contest',
        variant: 'destructive'
      })
    } finally {
      setCreating(false)
    }
  }

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    return date.toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getTimeUntilStart = (startSeconds: number) => {
    const now = Math.floor(Date.now() / 1000)
    const diff = startSeconds - now
    
    if (diff < 0) return 'Started'
    
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Contests</h1>
          <p className="mt-2 text-white/80 leading-relaxed">
            Host or join private training contests. After the contest, view rating simulation and get a recovery set.
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Contest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Contest</DialogTitle>
              <DialogDescription>
                Create a private training contest for your group or friends.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="contest-name">Contest Name</Label>
                <Input
                  id="contest-name"
                  placeholder="Enter contest name..."
                  value={newContestName}
                  onChange={(e) => setNewContestName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      createContest()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createContest} disabled={creating || !newContestName.trim()}>
                {creating ? 'Creating...' : 'Create Contest'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
          <p className="mt-2 text-white/60">Loading contests...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Codeforces Contests */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Upcoming Codeforces Contests</h2>
              <Badge variant="secondary">{upcomingCfContests.length}</Badge>
            </div>
            
            {upcomingCfContests.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-white/60 text-center">No upcoming Codeforces contests found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingCfContests.slice(0, 6).map((contest) => (
                  <Card key={contest.id} className="hover:bg-white/5 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {contest.name}
                        </CardTitle>
                        <ExternalLinkIcon className="w-4 h-4 text-white/40 flex-shrink-0 ml-2" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {contest.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {contest.phase}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        {contest.startTimeSeconds && (
                          <div className="flex items-center gap-2 text-white/70">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatTime(contest.startTimeSeconds)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-white/70">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatDuration(contest.durationSeconds)}</span>
                        </div>
                        {contest.startTimeSeconds && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Starts in:</span>
                            <Badge variant="default" className="text-xs">
                              {getTimeUntilStart(contest.startTimeSeconds)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Private Contests */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Private Contests</h2>
              <Badge variant="secondary">{privateContests.length}</Badge>
            </div>
            
            {privateContests.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <UsersIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">No private contests yet.</p>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create Your First Contest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {privateContests.map((contest) => (
                  <Card key={contest.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">{contest.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Created {new Date(contest.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={contest.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {contest.status}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
                          View Details
                        </Button>
                      </div>
                      {contest.starts_at && (
                        <div className="mt-3 text-xs text-white/60">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{new Date(contest.starts_at).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
