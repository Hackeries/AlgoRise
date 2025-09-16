"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCFVerification } from "@/lib/context/cf-verification"
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Lightbulb,
  StickyNote,
  Trophy,
  Flame,
  Activity
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CFProblem {
  contestId: number
  index: string
  name: string
  rating?: number
  tags: string[]
  verdict?: string
  timeConsumedMillis?: number
  programmingLanguage?: string
  creationTimeSeconds: number
}

interface DailyStats {
  problemsSolved: number
  hintsUsed: number
  totalSubmissions: number
  averageTime: number
  tags: { [key: string]: number }
}

interface ProblemNote {
  problemId: string
  problemName: string
  note: string
  createdAt: string
  tags: string[]
  category: 'hint' | 'solution' | 'approach' | 'mistake' | 'general'
  difficulty?: number
}

export function CFDashboard() {
  const { isVerified, verificationData } = useCFVerification()
  const [cfProblems, setCfProblems] = useState<CFProblem[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null)
  const [problemNotes, setProblemNotes] = useState<ProblemNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [noteCategory, setNoteCategory] = useState<'hint' | 'solution' | 'approach' | 'mistake' | 'general'>('general')
  const [selectedProblem, setSelectedProblem] = useState<CFProblem | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  // Handle hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load data when verified
  useEffect(() => {
    if (isVerified && verificationData) {
      loadCFData()
      loadStoredNotes()
      calculateStreak()
    }
  }, [isVerified, verificationData])

  const loadCFData = async () => {
    if (!verificationData) return
    
    setLoading(true)
    try {
      // Fetch today's submissions
      const response = await fetch(`https://codeforces.com/api/user.status?handle=${verificationData.handle}&from=1&count=100`)
      const data = await response.json()
      
      if (data.status === 'OK') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayProblems = data.result.filter((submission: any) => {
          const submissionDate = new Date(submission.creationTimeSeconds * 1000)
          return submissionDate >= today
        })
        
        setCfProblems(todayProblems)
        calculateDailyStats(todayProblems)
      }
    } catch (error) {
      console.error('Error loading CF data:', error)
      toast({ title: "Error", description: "Failed to load Codeforces data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const calculateDailyStats = (problems: CFProblem[]) => {
    const solved = problems.filter(p => p.verdict === 'OK')
    const failed = problems.filter(p => p.verdict && p.verdict !== 'OK')
    const totalTime = solved.reduce((sum, p) => sum + (p.timeConsumedMillis || 0), 0)
    const tags: { [key: string]: number } = {}
    
    problems.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1
        })
      }
    })

    // Calculate hints used based on failed attempts and multiple submissions
    const uniqueProblems = new Set(problems.map(p => `${p.contestId}${p.index}`))
    const hintsUsed = failed.length + Math.max(0, problems.length - uniqueProblems.size)

    setDailyStats({
      problemsSolved: solved.length,
      hintsUsed,
      totalSubmissions: problems.length,
      averageTime: solved.length > 0 ? totalTime / solved.length : 0,
      tags
    })
  }

  const calculateStreak = () => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('cf_daily_streak')
    setCurrentStreak(stored ? parseInt(stored) : 0)
  }

  const loadStoredNotes = () => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('cf_problem_notes')
    if (stored) {
      setProblemNotes(JSON.parse(stored))
    }
  }

  const saveNote = () => {
    if (!selectedProblem || !newNote.trim()) return

    const note: ProblemNote = {
      problemId: `${selectedProblem.contestId}${selectedProblem.index}`,
      problemName: selectedProblem.name,
      note: newNote.trim(),
      createdAt: new Date().toISOString(),
      tags: selectedProblem.tags,
      category: noteCategory,
      difficulty: selectedProblem.rating
    }

    const updatedNotes = [note, ...problemNotes]
    setProblemNotes(updatedNotes)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cf_problem_notes', JSON.stringify(updatedNotes))
    }
    
    setNewNote("")
    setNoteCategory('general')
    setSelectedProblem(null)
    toast({ title: "Note Saved", description: `Note saved for ${selectedProblem.name}` })
  }

  const deleteNote = (noteId: string) => {
    const updatedNotes = problemNotes.filter(note => note.problemId !== noteId)
    setProblemNotes(updatedNotes)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cf_problem_notes', JSON.stringify(updatedNotes))
    }
    toast({ title: "Note Deleted", description: "Note has been removed" })
  }

  // Prevent hydration mismatch
  if (!isMounted) {
    return <div className="space-y-6">Loading...</div>
  }

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <CardTitle>Connect Your Codeforces Account</CardTitle>
            <CardDescription>
              Verify your CF account to see your personalized dashboard with stats, progress, and notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/settings">Verify Codeforces Account</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{verificationData?.rating || 0}</div>
            <p className="text-xs text-muted-foreground">
              Rank: {verificationData?.rank || 'unrated'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Rating</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{verificationData?.maxRating || 0}</div>
            <p className="text-xs text-muted-foreground">
              Peak performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{dailyStats?.problemsSolved || 0}</div>
            <p className="text-xs text-muted-foreground">
              Problems solved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Analytics */}
      {dailyStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Today's Analytics
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your daily progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{dailyStats.problemsSolved}</div>
                <div className="text-sm text-muted-foreground">Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{dailyStats.hintsUsed}</div>
                <div className="text-sm text-muted-foreground">Hints/Fails</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{dailyStats.totalSubmissions}</div>
                <div className="text-sm text-muted-foreground">Submissions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {dailyStats.averageTime > 0 ? `${Math.round(dailyStats.averageTime / 60000)}m` : '0m'}
                </div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
            </div>
            
            {Object.keys(dailyStats.tags).length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Topics Practiced:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dailyStats.tags)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([tag, count]) => (
                      <Badge key={tag} variant="outline">
                        {tag} ({count})
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Problems
            </CardTitle>
            <CardDescription>
              Problems you've worked on today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : cfProblems.length > 0 ? (
              <div className="space-y-3">
                {cfProblems.slice(0, 10).map((problem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{problem.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {problem.contestId}{problem.index} • Rating: {problem.rating || 'N/A'}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {problem.tags && Array.isArray(problem.tags) ? problem.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        )) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {problem.verdict === 'OK' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProblem(problem)}
                      >
                        <StickyNote className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No problems solved today. Start coding! 🚀
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Problem Notes
            </CardTitle>
            <CardDescription>
              Your notes and hints for problems
            </CardDescription>
          </CardHeader>
          <CardContent>
            {problemNotes.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {problemNotes.map((note, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{note.problemName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={
                              note.category === 'hint' ? 'default' :
                              note.category === 'solution' ? 'secondary' :
                              note.category === 'mistake' ? 'destructive' : 'outline'
                            }
                            className="text-xs"
                          >
                            {note.category === 'hint' && '💡'} 
                            {note.category === 'solution' && '✅'}
                            {note.category === 'approach' && '🎯'}
                            {note.category === 'mistake' && '❌'}
                            {note.category === 'general' && '📝'}
                            {' '}{note.category}
                          </Badge>
                          {note.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              {note.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNote(note.problemId)}
                      >
                        ×
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {note.note}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No notes yet. Click the note icon next to problems to add notes.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Note Modal */}
      {selectedProblem && (
        <Card>
          <CardHeader>
            <CardTitle>Add Note for {selectedProblem.name}</CardTitle>
            <CardDescription>
              Save your thoughts, hints, or solutions for this problem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Note Category</label>
              <Select value={noteCategory} onValueChange={(value: any) => setNoteCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hint">💡 Hint</SelectItem>
                  <SelectItem value="solution">✅ Solution</SelectItem>
                  <SelectItem value="approach">🎯 Approach</SelectItem>
                  <SelectItem value="mistake">❌ Mistake</SelectItem>
                  <SelectItem value="general">📝 General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Enter your notes, hints, or approach for this problem..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={saveNote} disabled={!newNote.trim()}>
                Save Note
              </Button>
              <Button variant="outline" onClick={() => setSelectedProblem(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}