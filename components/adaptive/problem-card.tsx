"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, CheckCircle, StickyNote, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export type Problem = {
  id: string
  title: string
  url?: string
  rating: number
  tags: string[]
}

function getRatingColor(rating: number) {
  if (rating >= 2400) return "from-red-500 to-red-600"
  if (rating >= 2100) return "from-orange-500 to-orange-600"
  if (rating >= 1900) return "from-yellow-500 to-yellow-600"
  if (rating >= 1600) return "from-green-500 to-green-600"
  if (rating >= 1400) return "from-cyan-500 to-cyan-600"
  if (rating >= 1200) return "from-blue-500 to-blue-600"
  return "from-gray-500 to-gray-600"
}

function getRatingTextColor(rating: number) {
  if (rating >= 2400) return "text-red-600"
  if (rating >= 2100) return "text-orange-600"
  if (rating >= 1900) return "text-yellow-600"
  if (rating >= 1600) return "text-green-600"
  if (rating >= 1400) return "text-cyan-600"
  if (rating >= 1200) return "text-blue-600"
  return "text-gray-600"
}

export function AdaptiveProblemCard({
  problem,
  onCompleted,
  onNotes,
  subtitle,
}: {
  problem: Problem
  onCompleted?: (p: Problem) => void
  onNotes?: (p: Problem) => void
  subtitle?: string
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  const handleSolve = () => {
    if (problem.url) {
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 200)
      window.open(problem.url, '_blank', 'noopener,noreferrer')
    }
  }

  const ratingGradient = getRatingColor(problem.rating)
  const ratingTextColor = getRatingTextColor(problem.rating)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >

      <Card className="relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 bg-gradient-to-br from-background to-muted/20">
        {/* Subtle gradient overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.03 : 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 bg-gradient-to-br ${ratingGradient} pointer-events-none`}
        />

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-semibold leading-tight text-balance flex-1 group-hover:text-primary transition-colors duration-200">
              {problem.title}
            </CardTitle>
            {subtitle && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                {subtitle}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          {/* Rating and Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant="outline"
                className={`${ratingTextColor} border-current font-semibold px-3 py-1 text-sm shadow-sm`}
              >
                ★ {problem.rating}
              </Badge>
            </motion.div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {problem.tags.slice(0, 4).map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-secondary/80 hover:bg-secondary transition-colors duration-200"
                    >
                      {tag}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>

              {problem.tags.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-1 text-muted-foreground">
                  +{problem.tags.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                className={`
                  w-full bg-gradient-to-r from-blue-600 to-blue-700 
                  hover:from-blue-700 hover:to-blue-800 
                  text-white font-medium flex items-center justify-center gap-2 
                  shadow-md hover:shadow-lg transition-all duration-200
                  ${isClicked ? 'ring-2 ring-blue-400 ring-opacity-75' : ''}
                `}
                onClick={handleSolve}
              >
                <ExternalLink className="h-4 w-4" />
                Solve Problem
              </Button>
            </motion.div>

            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200"
                  onClick={() => onCompleted?.(problem)}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Done</span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200"
                  onClick={() => onNotes?.(problem)}
                >
                  <StickyNote className="h-4 w-4" />
                  <span className="hidden sm:inline">Notes</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
