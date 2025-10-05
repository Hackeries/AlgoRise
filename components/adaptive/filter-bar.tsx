"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

const DEFAULT_TAGS = ["graphs", "dp", "greedy", "math", "strings", "trees", "bruteforce", "number theory"]

export type FilterState = {
  ratingBase: number // window is [base-100, base+200] (minimum 800)
  tags: string[]
}

export function AdaptiveFilterBar({
  initialRatingBase = 1500,
  initialTags = [],
  onChange,
}: {
  initialRatingBase?: number
  initialTags?: string[]
  onChange?: (state: FilterState) => void
}) {
  const [ratingBase, setRatingBase] = useState(initialRatingBase)
  const [tags, setTags] = useState<string[]>(initialTags)

  const windowMin = Math.max(800, ratingBase - 100) // Match API logic: minimum 800
  const windowMax = ratingBase + 200

  function toggleTag(tag: string) {
    setTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      onChange?.({ ratingBase, tags: next })
      return next
    })
  }

  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Rating window</p>
          <p className="text-sm">
            {windowMin} to {windowMax} <span className="text-muted-foreground">(base {ratingBase} +200/-100)</span>
          </p>
          <div className="mt-2 max-w-sm">
            <Slider
              value={[ratingBase]}
              min={800}
              max={2600}
              step={50}
              onValueChange={(v) => {
                const val = v[0]
                setRatingBase(val)
                onChange?.({ ratingBase: val, tags })
              }}
              aria-label="Rating base"
            />
          </div>
        </div>

        <div className="max-w-xl">
          <p className="mb-2 text-sm text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TAGS.map((tag) => {
              const active = tags.includes(tag)
              return (
                <Badge
                  key={tag}
                  variant={active ? "default" : "outline"}
                  className={active ? "bg-blue-600 hover:bg-blue-600/90" : ""}
                  onClick={() => toggleTag(tag)}
                  role="button"
                  aria-pressed={active}
                >
                  {tag}
                </Badge>
              )
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTags([])
                onChange?.({ ratingBase, tags: [] })
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
