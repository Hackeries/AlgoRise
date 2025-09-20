"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Clock, Target, CheckCircle, PlayCircle } from "lucide-react"
import Link from "next/link"
import { LEARNING_PATH_DATA, getTotalProblems, getSectionProgress } from "@/lib/learning-path-data"

export default function LearningPathsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const totalProblems = getTotalProblems()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Learning Path</h1>
        <p className="text-muted-foreground text-lg mb-4">
          Complete structured journey from C++ basics to advanced competitive programming.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>{totalProblems} Total Problems</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>30+ weeks estimated</span>
          </div>
        </div>
      </div>

      {/* Learning Path Sections */}
      <div className="space-y-4">
        {LEARNING_PATH_DATA.map((section, index) => {
          const progress = getSectionProgress(section.id)
          const isExpanded = expandedSection === section.id
          const isCompleted = progress === 100
          const isLocked = index > 0 && getSectionProgress(LEARNING_PATH_DATA[index - 1].id) < 50

          return (
            <Card key={section.id} className={`border-2 transition-all ${
              isCompleted ? "border-green-500/50 bg-green-500/5" :
              isLocked ? "border-muted/30 bg-muted/5" :
              "border-blue-500/30 hover:border-blue-500/50"
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg text-2xl ${
                      isCompleted ? "bg-green-500/20" :
                      isLocked ? "bg-muted/20" :
                      "bg-blue-500/20"
                    }`}>
                      {section.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {isLocked && <div className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">Locked</div>}
                      </div>
                      <CardDescription className="mt-1">{section.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{section.totalProblems} problems</span>
                        <span>{section.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    disabled={isLocked}
                  >
                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>

              {/* Expanded Subsections */}
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {section.subsections.map((subsection) => (
                      <Card key={subsection.id} className="border-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{subsection.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{subsection.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{subsection.problems.length} problems</span>
                                <span>{subsection.estimatedTime}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button size="sm" asChild disabled={isLocked}>
                                <Link href={`/paths/${section.id}/${subsection.id}`}>
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Getting Started Section */}
      <div className="mt-12 p-6 rounded-lg border border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-3 mb-4">
          <PlayCircle className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-semibold">Ready to Start?</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Begin your competitive programming journey with our structured learning path. Start with Basic C++ and progress through each section.
        </p>
        <Button asChild size="lg">
          <Link href="/paths/basic-cpp/cpp-basics">Start Learning Journey</Link>
        </Button>
      </div>
    </main>
  )
}
