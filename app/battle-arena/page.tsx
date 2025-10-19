"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sword, Users, Trophy, History } from "lucide-react"

export default function BattleArenaPage() {
  const [selectedMode, setSelectedMode] = useState<"1v1" | "3v3" | null>(null)

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Battle Arena</h1>
          <p className="text-muted-foreground">
            Compete in real-time duels or team battles. Climb the leaderboards and prove your skills.
          </p>
        </div>

        {/* Mode Selection */}
        <Tabs defaultValue="quick-play" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quick-play">Quick Play (1v1)</TabsTrigger>
            <TabsTrigger value="team-battles">Team Battles (3v3)</TabsTrigger>
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* 1v1 Quick Play */}
          <TabsContent value="quick-play" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Sword className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">1v1 Duels</h2>
                  <p className="text-muted-foreground">Fast-paced head-to-head battles</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Format</p>
                    <p className="font-semibold">Best of 1 or 3</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Scoring</p>
                    <p className="font-semibold">Fastest AC Wins</p>
                  </div>
                </div>
                <Link href="/battle-arena/queue/1v1">
                  <Button className="w-full" size="lg">
                    Enter Queue
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          {/* 3v3 Team Battles */}
          <TabsContent value="team-battles" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">3v3 ICPC-Style Battles</h2>
                  <p className="text-muted-foreground">Collaborative team competitions</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Team Size</p>
                    <p className="font-semibold">Exactly 3 Players</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Scoring</p>
                    <p className="font-semibold">ICPC Rules</p>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">First, create or join a team:</p>
                  <div className="flex gap-2">
                    <Link href="/battle-arena/team/create" className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        Create Team
                      </Button>
                    </Link>
                    <Link href="/battle-arena/team/join" className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        Join Team
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Leaderboards */}
          <TabsContent value="leaderboards" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Trophy className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Leaderboards</h2>
                  <p className="text-muted-foreground">Top competitors and teams</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/battle-arena/leaderboards/1v1">
                  <Button variant="outline" className="w-full bg-transparent">
                    1v1 Rankings
                  </Button>
                </Link>
                <Link href="/battle-arena/leaderboards/3v3">
                  <Button variant="outline" className="w-full bg-transparent">
                    3v3 Rankings
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <History className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Battle History</h2>
                  <p className="text-muted-foreground">Your past battles and results</p>
                </div>
              </div>
              <Link href="/battle-arena/history">
                <Button className="w-full">View History</Button>
              </Link>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
