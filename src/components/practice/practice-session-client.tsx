"use client"

import { useState } from "react"
import { useCFVerification } from "@/lib/context/cf-verification"
import { CFVerificationV3 } from "@/components/auth/cf-verification"
import { PracticeSessionSetup } from "./practice-session-setup"
import { PracticeSessionActive } from "./practice-session-active"
import { PracticeSessionResults } from "./practice-session-results"
import { motion, AnimatePresence } from "framer-motion"

export type SessionConfig = {
  problemCount: number
  ratingMin: number
  ratingMax: number
  tags: string[]
  duration: number // in minutes, 0 = unlimited
}

export type SessionProblem = {
  id: string
  contestId: number
  index: string
  name: string
  rating: number
  tags: string[]
  solved: boolean
  startedAt?: number
  solvedAt?: number
}

export type SessionState = "setup" | "active" | "results"

export function PracticeSessionClient() {
  const { isVerified, verificationData } = useCFVerification()
  const [sessionState, setSessionState] = useState<SessionState>("setup")
  const [config, setConfig] = useState<SessionConfig | null>(null)
  const [problems, setProblems] = useState<SessionProblem[]>([])
  const [startTime, setStartTime] = useState<number>(0)

  const handleStartSession = (cfg: SessionConfig, probs: SessionProblem[]) => {
    setConfig(cfg)
    setProblems(probs)
    setStartTime(Date.now())
    setSessionState("active")
  }

  const handleEndSession = () => {
    setSessionState("results")
  }

  const handleNewSession = () => {
    setSessionState("setup")
    setConfig(null)
    setProblems([])
    setStartTime(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!isVerified ? (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <CFVerificationV3 />
            </motion.div>
          ) : sessionState === "setup" ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <PracticeSessionSetup
                cfHandle={verificationData?.handle || ""}
                currentRating={verificationData?.rating || 1500}
                onStartSession={handleStartSession}
              />
            </motion.div>
          ) : sessionState === "active" ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <PracticeSessionActive
                config={config!}
                problems={problems}
                startTime={startTime}
                onEndSession={handleEndSession}
                onUpdateProblems={setProblems}
              />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <PracticeSessionResults
                config={config!}
                problems={problems}
                startTime={startTime}
                endTime={Date.now()}
                onNewSession={handleNewSession}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
