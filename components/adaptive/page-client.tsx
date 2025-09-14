"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { LeftRail } from "@/components/dashboard/left-rail"
import { AdaptiveSheetContent } from "@/components/adaptive/sheet-content"
import { AdaptiveRightRailData } from "@/components/adaptive/right-rail"
import type { FilterState } from "@/components/adaptive/filter-bar"
import { SheetSettings, type SRMode } from "@/components/adaptive/sheet-settings"
import CFVerificationTrigger from "@/components/auth/cf-verification-trigger"

export function AdaptiveSheetPageClient() {
  const [filters, setFilters] = useState<FilterState>({ ratingBase: 1500, tags: [] })
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(60)
  const [srMode, setSrMode] = useState<SRMode>("standard")
  const [isVerified, setIsVerified] = useState(false)
  const [cfHandle, setCfHandle] = useState<string>('')

  useEffect(() => {
    if (typeof window === "undefined") return
    const sp = new URLSearchParams(window.location.search)
    const mode = sp.get("mode")
    const urlTags = sp.get("tags")
    const urlBase = sp.get("ratingBase")
    const parsedTags = urlTags ? urlTags.split(",").filter(Boolean) : []
    const base = urlBase ? Number(urlBase) : undefined
    // If recovery mode: downshift rating by 200 unless ratingBase explicitly provided
    if (mode === "recovery" || parsedTags.length || typeof base === "number") {
      setFilters((prev) => ({
        ratingBase: typeof base === "number" && !Number.isNaN(base) ? base : Math.max(800, prev.ratingBase - 200),
        tags: parsedTags.length ? parsedTags : prev.tags,
      }))
    }
  }, [])

  return (
    <DashboardShell
      left={<LeftRail active="sheet" />}
      center={
        <div className="space-y-4">
          <header className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-balance">Adaptive Practice Sheet</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Automatically adjusts problem difficulty based on your Codeforces rating and contest performance. 
                Won't show problems you've already solved since it syncs with your CF handle.
              </p>
            </div>
            <SheetSettings
              snoozeMinutes={snoozeMinutes}
              onSnoozeMinutesChange={setSnoozeMinutes}
              srMode={srMode}
              onSrModeChange={setSrMode}
            />
          </header>
          {!isVerified ? (
            <div className="max-w-2xl mx-auto mt-12">
              <CFVerificationTrigger 
                onVerificationComplete={(data) => {
                  setIsVerified(true)
                  setCfHandle(data.handle)
                  // Update rating base based on user's CF rating
                  setFilters(prev => ({
                    ...prev,
                    ratingBase: data.rating || 1200
                  }))
                }}
              />
            </div>
          ) : (
            <AdaptiveSheetContent
              controlledFilters={filters}
              onFiltersChange={setFilters}
              snoozeMinutes={snoozeMinutes}
              srMode={srMode}
              cfHandle={cfHandle}
            />
          )}
        </div>
      }
      right={<AdaptiveRightRailData baseRating={filters.ratingBase} tags={filters.tags} />}
    />
  )
}
