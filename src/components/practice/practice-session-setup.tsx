"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Target, Clock, Zap, TrendingUp, Loader2, Sparkles } from "lucide-react"
import type { SessionConfig, SessionProblem } from "./practice-session-client"

const POPULAR_TAGS = [
  "implementation",
  "math",
  "greedy",
  "dp",
  "data structures",
  "brute force",
  "constructive algorithms",
  "graphs",
  "sortings",
  "binary search",
  "dfs and similar",
  "trees",
  "strings",
  "number theory",
  "combinatorics",
  "geometry",
]

const PROBLEM_COUNTS = [5, 8, 10, 12, 15]
const DURATIONS = [
  { label: "Unlimited", value: 0 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
]

export function PracticeSessionSetup({
  cfHandle,
  currentRating,
  onStartSession,
}: {
  cfHandle: string
  currentRating: number
  onStartSession: (config: SessionConfig, problems: SessionProblem[]) => void
}) {
  const [problemCount, setProblemCount] = useState(8)
  const [ratingRange, setRatingRange] = useState([Math.max(800, currentRating - 200), currentRating + 200])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [duration, setDuration] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: problemCount,
          ratingMin: ratingRange[0],
          ratingMax: ratingRange[1],
          tags: selectedTags,
          handle: cfHandle,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate problems")

      const data = await response.json()
      const problems: SessionProblem[] = data.problems.map((p: any) => ({
        id: `${p.contestId}${p.index}`,
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating || 0,
        tags: p.tags || [],
        solved: false,
      }))

      onStartSession(
        {
          problemCount,
          ratingMin: ratingRange[0],
          ratingMax: ratingRange[1],
          tags: selectedTags,
          duration,
        },
        problems,
      )
    } catch (error) {
      toast({
        title: "Failed to generate problems",
        description: "Please try again with different settings.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Practice Session
        </h1>
        <p className="text-muted-foreground text-lg">Create a custom practice session tailored to your skill level</p>
      </motion.div>

      {/* Configuration Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Problem Count */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Problem Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PROBLEM_COUNTS.map((count) => (
                  <Button
                    key={count}
                    variant={problemCount === count ? "default" : "outline"}
                    onClick={() => setProblemCount(count)}
                    className="flex-1 min-w-[60px]"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Duration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Time Limit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <Button
                    key={d.value}
                    variant={duration === d.value ? "default" : "outline"}
                    onClick={() => setDuration(d.value)}
                    className="flex-1 min-w-[80px] text-sm"
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rating Range */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-2 hover:border-primary/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Difficulty Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Current Rating: <strong>{currentRating}</strong>
              </span>
              <span className="text-sm font-semibold">
                {ratingRange[0]} - {ratingRange[1]}
              </span>
            </div>
            <Slider
              value={ratingRange}
              min={800}
              max={3500}
              step={100}
              onValueChange={setRatingRange}
              className="w-full"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-2 hover:border-primary/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Topics (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="mt-3">
                Clear all
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center"
      >
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Problems...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Start Practice Session
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
