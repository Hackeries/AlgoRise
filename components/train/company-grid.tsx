"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type CompanySet = {
  id: string
  name: string
  logoUrl?: string
  problemCount: number
  solved: number
  distribution?: { easy: number; medium: number; hard: number }
  problems?: { id: string; title: string; difficulty: "Easy" | "Medium" | "Hard"; url?: string }[]
}

export function CompanyGrid({ companies }: { companies: CompanySet[] }) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {companies.map((c) => (
        <CompanyCard key={c.id} company={c} />
      ))}
    </div>
  )
}

function CompanyCard({ company }: { company: CompanySet }) {
  const pct = company.problemCount ? Math.round((company.solved / company.problemCount) * 100) : 0
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="p-4 border bg-card/60 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-muted grid place-items-center overflow-hidden">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold">{company.name[0]}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{company.name}</div>
              <div className="text-xs text-muted-foreground">
                {company.solved}/{company.problemCount} solved • {pct}%
              </div>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{company.name} interview set</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {company.distribution && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Easy {company.distribution.easy}</Badge>
              <Badge variant="outline">Medium {company.distribution.medium}</Badge>
              <Badge variant="outline">Hard {company.distribution.hard}</Badge>
            </div>
          )}
          <InterviewGrindList problems={company.problems ?? []} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InterviewGrindList({
  problems,
}: {
  problems: { id: string; title: string; difficulty: "Easy" | "Medium" | "Hard"; url?: string }[]
}) {
  // Group by difficulty for quick scan
  const groups = ['Easy', 'Medium', 'Hard'] as const
  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const items = problems.filter((p) => p.difficulty === g)
        if (items.length === 0) return null
        return (
          <div key={g}>
            <div className="mb-2 text-sm font-semibold text-muted-foreground">{g}</div>
            <div className="grid gap-2 max-h-72 overflow-auto">
              {items.map((p) => (
                <div key={p.id} className="rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate flex-1">{p.title}</span>
                    <Badge variant={g === 'Hard' ? 'default' : 'secondary'}>{g}</Badge>
                    {p.url && (
                      <Button asChild size="sm" variant="outline" className="bg-transparent">
                        <a href={p.url} target="_blank" rel="noopener noreferrer">
                          Solve
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
