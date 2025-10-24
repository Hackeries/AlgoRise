"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Search, Layers3, ListChecks, LineChart } from "lucide-react"

export function TrainHero({
  onQuickNav,
  onSearch,
}: {
  onQuickNav: (key: "blind75" | "neet250" | "cses" | "leetcode") => void
  onSearch: (query: string) => void
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground bg-background/70">
            <Sparkles className="h-3.5 w-3.5" />
            Master DSA & Competitive Programming
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Master DSA & Competitive Programming – Train Like a Pro
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Structured problem sheets, company-focused challenges, and real-time progress tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics, companies, problems…"
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch((e.target as HTMLInputElement).value)
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => onQuickNav("blind75")}>
              <ListChecks className="h-4 w-4 mr-1.5" /> Blind 75
            </Button>
            <Button size="sm" variant="outline" onClick={() => onQuickNav("neet250")}>
              <Layers3 className="h-4 w-4 mr-1.5" /> NeetCode 250
            </Button>
            <Button size="sm" variant="outline" onClick={() => onQuickNav("cses")}>
              <ListChecks className="h-4 w-4 mr-1.5" /> CSES
            </Button>
            <Button size="sm" variant="outline" onClick={() => onQuickNav("leetcode")}>
              <LineChart className="h-4 w-4 mr-1.5" /> LeetCode
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
