"use client"

import { useState, useEffect } from "react"
import { AdaptiveSheetContent } from "@/components/adaptive/sheet-content"
import { AdaptiveRightRailData } from "@/components/adaptive/right-rail"
import type { FilterState } from "@/components/adaptive/filter-bar"
import { SheetSettings, type SRMode } from "@/components/adaptive/sheet-settings"
import { useCFVerification } from "@/lib/context/cf-verification"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdaptiveSheetPageClient() {
  const { isVerified, verificationData } = useCFVerification()
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({
    ratingBase: 1500,
    tags: [],
  })
  const [srMode, setSrMode] = useState<SRMode>("standard")
  const [isMobileRailOpen, setIsMobileRailOpen] = useState(false)

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

    // Set rating base from verified CF data if available
    if (isVerified && verificationData?.rating) {
      const currentRating = Math.floor(verificationData.rating) // Floor the current rating
      setFilters((prev) => ({
        ...prev,
        ratingBase: currentRating,
      }))
    }

    // redirect any unverified user to profile to perform single CE verification
    if (!isVerified) {
      router.replace("/profile?next=/adaptive-sheet")
    }
  }, [isVerified, verificationData, router])

  return (
    <div className="min-h-screen ">
      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6"
            >
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Adaptive Practice Sheet
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                  Automatically adjusts problem difficulty based on your Codeforces rating and contest performance.
                  Won't show problems you've already solved since it syncs with your CF handle.
                </p>
              </div>

              {/* Desktop Controls */}
              <div className="hidden sm:flex items-center gap-3">
                <SheetSettings srMode={srMode} onSrModeChange={setSrMode} />

                {/* Mobile Rail Trigger - Only show on smaller screens */}
                <div className="lg:hidden">
                  <Sheet open={isMobileRailOpen} onOpenChange={setIsMobileRailOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Stats
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-80 p-0">
                      <div className="p-6 h-full overflow-y-auto">
                        <AdaptiveRightRailData baseRating={filters.ratingBase} tags={filters.tags} />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              {/* Mobile Controls */}
              <div className="sm:hidden w-full flex items-center justify-between gap-3">
                <SheetSettings srMode={srMode} onSrModeChange={setSrMode} />

                <Sheet open={isMobileRailOpen} onOpenChange={setIsMobileRailOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Stats
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full p-0">
                    <div className="p-6 h-full overflow-y-auto">
                      <AdaptiveRightRailData baseRating={filters.ratingBase} tags={filters.tags} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </motion.header>

            {/* Content */}

            <AnimatePresence mode="wait">
              {!isVerified ? (
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-2xl mx-auto mt-8 lg:mt-12 text-sm text-muted-foreground"
                >
                  Redirecting to profile for Codeforces verification...
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <AdaptiveSheetContent
                    controlledFilters={filters}
                    onFiltersChange={setFilters}
                    srMode={srMode}
                    cfHandle={verificationData?.handle || ""}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Desktop Right Rail */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:block w-80 xl:w-96 border-l bg-gradient-to-b from-muted/30 to-muted/10 backdrop-blur-sm"
        >
          <div className="sticky top-0 h-screen overflow-y-auto p-6">
            <AdaptiveRightRailData baseRating={filters.ratingBase} tags={filters.tags} />
          </div>
        </motion.div>
      </main>
    </div>
  )
}
