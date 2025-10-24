"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Filters } from "./filter-bar"

export type Sheet = {
  id: string
  title: string
  platform: "LeetCode" | "CSES" | "Internal"
  difficulty: "Easy" | "Medium" | "Hard"
  topics: string[]
  companies: string[]
  completed: number
  total: number
}

export function SheetsGrid({ sheets, filters }: { sheets: Sheet[]; filters: Filters }) {
  const filtered = useMemo(() => {
    return sheets.filter((s) => {
      if (filters.query) {
        const q = filters.query.toLowerCase()
        if (
          !(
            s.title.toLowerCase().includes(q) ||
            s.topics.some((t) => t.toLowerCase().includes(q)) ||
            s.companies.some((c) => c.toLowerCase().includes(q))
          )
        ) {
          return false
        }
      }
      if (filters.topic && !s.topics.includes(filters.topic)) return false
      if (filters.difficulty && s.difficulty !== filters.difficulty) return false
      if (filters.platform && s.platform !== filters.platform) return false
      // companyId could be mapped when we fetch real data; skip here
      return true
    })
  }, [sheets, filters])

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {filtered.map((s) => {
        const pct = s.total ? Math.min(100, Math.round((s.completed / s.total) * 100)) : 0
        const ring = `stroke-dasharray: ${2 * Math.PI * 36}; stroke-dashoffset: ${
          2 * Math.PI * 36 * (1 - pct / 100)
        }`
        return (
          <Card
            key={s.id}
            className="p-4 border bg-card/60 backdrop-blur hover:shadow-lg transition-shadow hover:-translate-y-0.5 duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/40" />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    style={{ strokeDasharray: `${2 * Math.PI * 36}`, strokeDashoffset: 2 * Math.PI * 36 * (1 - pct / 100) }}
                    className="text-primary transition-[stroke-dashoffset] duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <span className="text-sm font-semibold">{pct}%</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{s.title}</h3>
                  <Badge variant="outline" className="text-xs">{s.platform}</Badge>
                  <Badge variant="secondary" className="text-xs">{s.difficulty}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.topics.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {s.completed} / {s.total} solved
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm">Open</Button>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
