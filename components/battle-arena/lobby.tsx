'use client';

/**
 * Battle Arena Lobby Component
 * Allows players to join matchmaking queues
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Swords, Users, Trophy, Clock, TrendingUp } from 'lucide-react';

interface QueueStatus {
  playersInQueue: number;
  averageWaitTime: number;
}

export default function BattleArenaLobby() {
  const [selectedMode, setSelectedMode] = useState<'quick_1v1' | 'ranked_1v1' | '3v3_team'>('quick_1v1');
  const [inQueue, setInQueue] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Poll queue status
  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const response = await fetch(`/api/battle-arena/matchmaking/status?mode=${selectedMode}`);
        if (response.ok) {
          const data = await response.json();
          setQueueStatus({
            playersInQueue: data.playersInQueue || 0,
            averageWaitTime: data.averageWaitTime || 0
          });
        }
      } catch (error) {
        console.error('Error fetching queue status:', error);
      }
    };

    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [selectedMode]);

  const handleJoinQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/battle-arena/matchmaking/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ mode: selectedMode })
      });

      if (response.ok) {
        setInQueue(true);
      } else {
        console.error('Failed to join queue');
      }
    } catch (error) {
      console.error('Error joining queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/battle-arena/matchmaking/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ mode: selectedMode })
      });

      if (response.ok) {
        setInQueue(false);
      }
    } catch (error) {
      console.error('Error leaving queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatWaitTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Battle Arena</h1>
        <p className="text-muted-foreground">
          Compete in real-time coding battles. Test your skills against other programmers.
        </p>
      </div>

      <Tabs value={selectedMode} onValueChange={(v) => setSelectedMode(v as any)} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick_1v1">
            <Swords className="w-4 h-4 mr-2" />
            Quick 1v1
          </TabsTrigger>
          <TabsTrigger value="ranked_1v1">
            <Trophy className="w-4 h-4 mr-2" />
            Ranked 1v1
          </TabsTrigger>
          <TabsTrigger value="3v3_team">
            <Users className="w-4 h-4 mr-2" />
            3v3 Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick_1v1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick 1v1 Duel</CardTitle>
              <CardDescription>
                Fast-paced 1v1 matches. No rating changes, just pure skill testing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Players in queue:</span>
                  </div>
                  <Badge>{queueStatus?.playersInQueue || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Average wait time:</span>
                  </div>
                  <span className="text-sm font-medium">
                    {queueStatus ? formatWaitTime(queueStatus.averageWaitTime) : '--'}
                  </span>
                </div>
                {!inQueue ? (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleJoinQueue}
                    disabled={loading}
                  >
                    Find Match
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-center py-4">
                      <div className="animate-pulse text-lg font-semibold mb-2">
                        Searching for opponent...
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This may take a few moments
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleLeaveQueue}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranked_1v1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranked 1v1</CardTitle>
              <CardDescription>
                Competitive matches with ELO-based rating system. Climb the leaderboard!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-md">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Your Rating: 1200</div>
                    <div className="text-xs text-muted-foreground">Gold Tier</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Players in queue:</span>
                  </div>
                  <Badge>{queueStatus?.playersInQueue || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Average wait time:</span>
                  </div>
                  <span className="text-sm font-medium">
                    {queueStatus ? formatWaitTime(queueStatus.averageWaitTime) : '--'}
                  </span>
                </div>
                {!inQueue ? (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleJoinQueue}
                    disabled={loading}
                  >
                    Find Ranked Match
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-center py-4">
                      <div className="animate-pulse text-lg font-semibold mb-2">
                        Searching for opponent...
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Matching you with players of similar rating
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleLeaveQueue}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3v3_team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>3v3 Team Battle</CardTitle>
              <CardDescription>
                Form a team of 3 and compete against another team. Teamwork is key!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                    Team formation is required. You need 2 teammates to join.
                  </p>
                </div>
                <Button className="w-full" size="lg" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
