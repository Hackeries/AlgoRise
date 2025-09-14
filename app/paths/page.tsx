"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Target, Zap, Trophy, Clock, Brain, Rocket } from "lucide-react"
import Link from "next/link"

type SkillLevel = "beginner" | "intermediate" | "advanced" | "elite"

type LearningPath = {
  id: string
  title: string
  description: string
  level: SkillLevel
  icon: React.ReactNode
  estimatedTime: string
  problems: number
  topics: string[]
  progress?: number
  features: string[]
}

const LEARNING_PATHS: LearningPath[] = [
  {
    id: "start-here",
    title: "Start Here",
    description:
      "Perfect for complete beginners. Hand-picked easy problems with detailed explanations and visual guides.",
    level: "beginner",
    icon: <BookOpen className="h-6 w-6" />,
    estimatedTime: "2-4 weeks",
    problems: 50,
    topics: ["Basic Math", "Implementation", "Strings", "Arrays"],
    progress: 0,
    features: ["Step-by-step solutions", "Visual explanations", "CF basics guide", "Hint system"],
  },
  {
    id: "foundations",
    title: "Programming Foundations",
    description: "Build solid fundamentals with core algorithms and data structures. Gradual difficulty increase.",
    level: "beginner",
    icon: <Target className="h-6 w-6" />,
    estimatedTime: "4-6 weeks",
    problems: 80,
    topics: ["Sorting", "Binary Search", "Two Pointers", "Greedy Basics"],
    progress: 0,
    features: ["Interactive tutorials", "Progress tracking", "Weakness detection", "Practice contests"],
  },
  {
    id: "intermediate-climb",
    title: "Intermediate Climb",
    description:
      "Master intermediate topics with adaptive difficulty. Focus on your weak areas with targeted practice.",
    level: "intermediate",
    icon: <Zap className="h-6 w-6" />,
    estimatedTime: "6-8 weeks",
    problems: 120,
    topics: ["DP", "Graphs", "Trees", "Number Theory"],
    progress: 0,
    features: ["Adaptive sheets", "Topic mastery tracking", "Weakness targeting", "Contest simulation"],
  },
  {
    id: "advanced-grind",
    title: "Advanced Grind",
    description: "Tackle challenging problems for Candidate Master and above. Div.1 problems and speed training.",
    level: "advanced",
    icon: <Brain className="h-6 w-6" />,
    estimatedTime: "8-12 weeks",
    problems: 150,
    topics: ["Advanced DP", "Complex Graphs", "Segment Trees", "Game Theory"],
    progress: 0,
    features: ["Div.1 problems only", "Speed rounds", "Rating 1900+", "Advanced algorithms"],
  },
  {
    id: "elite-prep",
    title: "Elite Preparation",
    description:
      "ICPC/IOI level training with past contest problems, advanced techniques, and expert-level challenges.",
    level: "elite",
    icon: <Trophy className="h-6 w-6" />,
    estimatedTime: "12+ weeks",
    problems: 200,
    topics: ["ICPC Archives", "IOI Problems", "Advanced Techniques", "Contest Strategy"],
    progress: 0,
    features: ["ICPC/IOI archives", "Expert editorials", "Team training", "Contest strategy"],
  },
  {
    id: "speed-training",
    title: "Speed Training",
    description: "Improve your contest speed with timed problem sets and rapid-fire challenges.",
    level: "intermediate",
    icon: <Clock className="h-6 w-6" />,
    estimatedTime: "Ongoing",
    problems: 100,
    topics: ["Fast Implementation", "Pattern Recognition", "Time Management", "Contest Tactics"],
    progress: 0,
    features: ["Timed sessions", "Speed metrics", "Contest simulation", "Performance analytics"],
  },
]

const LEVEL_COLORS = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  advanced: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  elite: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

const LEVEL_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  elite: "Elite",
}

export default function LearningPathsPage() {
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | "all">("all")

  const filteredPaths =
    selectedLevel === "all" ? LEARNING_PATHS : LEARNING_PATHS.filter((path) => path.level === selectedLevel)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Learning Paths</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Structured learning journeys from beginner to elite level. Choose your path and start climbing the competitive
          programming ladder.
        </p>

        {/* Level Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedLevel === "all" ? "default" : "outline"}
            onClick={() => setSelectedLevel("all")}
            size="sm"
          >
            All Levels
          </Button>
          {Object.entries(LEVEL_LABELS).map(([level, label]) => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              onClick={() => setSelectedLevel(level as SkillLevel)}
              size="sm"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPaths.map((path) => (
          <Card key={path.id} className="border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/20">{path.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <Badge className={LEVEL_COLORS[path.level]} variant="outline">
                      {LEVEL_LABELS[path.level]}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">{path.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Bar */}
              {path.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{path.progress}%</span>
                  </div>
                  <Progress value={path.progress} className="h-2" />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-medium">{path.estimatedTime}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Problems</div>
                  <div className="font-medium">{path.problems}</div>
                </div>
              </div>

              {/* Topics */}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Topics Covered</div>
                <div className="flex flex-wrap gap-1">
                  {path.topics.slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {path.topics.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{path.topics.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Features</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {path.features.slice(0, 2).map((feature) => (
                    <li key={feature} className="flex items-center gap-1">
                      <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button asChild className="w-full">
                <Link href={`/paths/${path.id}`}>{path.progress === 0 ? "Start Path" : "Continue"}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Section */}
      <div className="mt-12 p-6 rounded-lg border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold">Not sure where to start?</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Take our quick skill assessment to get a personalized recommendation based on your current level.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/assessment">Take Assessment</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/paths/start-here">Start with Basics</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
