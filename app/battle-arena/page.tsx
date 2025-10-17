// Battle Arena main page

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RealTimeNotificationManager } from "@/lib/realtime-notifications";
import { 
  Sword, 
  Users, 
  Trophy, 
  Clock, 
  Zap,
  Play,
  Plus,
  Search,
  Crown,
  Star
} from "lucide-react";

export default function BattleArenaPage() {
  const [activeTab, setActiveTab] = useState("queue");
  const [userRating, setUserRating] = useState(1200);
  const [queueStatus, setQueueStatus] = useState({
    totalPlayers: 0,
    averageWaitTime: 0,
    formatDistribution: { best_of_1: 0, best_of_3: 0, best_of_5: 0 }
  });
  const [userBattles, setUserBattles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  // Fetch user rating and queue status on mount
  useEffect(() => {
    fetchUserRating();
    fetchQueueStatus();
    fetchUserBattles();
    
    // Set up real-time notifications
    const rtManager = RealTimeNotificationManager.getInstance();
    
    // Clean up on unmount
    return () => {
      // Any cleanup if needed
    };
  }, []);

  const fetchUserRating = async () => {
    try {
      // In a real implementation, this would fetch from the battle_ratings table
      // For now, we'll use a default rating
      setUserRating(1200);
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate the data
      setQueueStatus({
        totalPlayers: Math.floor(Math.random() * 10),
        averageWaitTime: Math.floor(Math.random() * 120),
        formatDistribution: { 
          best_of_1: Math.floor(Math.random() * 5), 
          best_of_3: Math.floor(Math.random() * 7), 
          best_of_5: Math.floor(Math.random() * 3) 
        }
      });
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const fetchUserBattles = async () => {
    try {
      // In a real implementation, this would fetch from the battles table
      // For now, we'll use mock data
      setUserBattles([]);
    } catch (error) {
      console.error('Error fetching user battles:', error);
    }
  };

  const joinQueue = async (format: 'best_of_1' | 'best_of_3' | 'best_of_5' = 'best_of_3') => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'join_queue', format }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Queue Joined",
          description: result.message,
        });
        
        // Refresh queue status
        fetchQueueStatus();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      toast({
        title: "Error",
        description: "Failed to join queue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPrivateBattle = async () => {
    // In a real implementation, this would open a dialog to select opponent
    toast({
      title: "Private Battle",
      description: "Feature coming soon! You'll be able to invite friends to battles.",
    });
  };

  const viewBattle = (battleId: string) => {
    router.push(`/battle-arena/${battleId}`);
  };

  const getRatingTier = (rating: number) => {
    if (rating < 1200) return { label: "Newbie", color: "text-gray-400" };
    if (rating < 1400) return { label: "Pupil", color: "text-green-400" };
    if (rating < 1600) return { label: "Specialist", color: "text-cyan-400" };
    if (rating < 1900) return { label: "Expert", color: "text-blue-400" };
    if (rating < 2100) return { label: "Candidate Master", color: "text-purple-400" };
    if (rating < 2300) return { label: "Master", color: "text-orange-400" };
    if (rating < 2400) return { label: "International Master", color: "text-red-400" };
    return { label: "Grandmaster", color: "text-red-600" };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const tier = getRatingTier(userRating);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sword className="h-8 w-8 text-blue-500" />
            Code Battle Arena
          </h1>
          <p className="text-muted-foreground">
            Compete in real-time coding duels against other programmers
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{userRating}</div>
              <div className={`text-sm ${tier.color}`}>{tier.label}</div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Battle Rating</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Join Queue
          </TabsTrigger>
          <TabsTrigger value="private" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Private Battle
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Battle History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Match
                </CardTitle>
                <CardDescription>
                  Join the matchmaking queue for an instant battle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    onClick={() => joinQueue('best_of_1')}
                    disabled={isLoading}
                    className="h-20 flex flex-col gap-2"
                  >
                    <Sword className="h-6 w-6" />
                    <span>Best of 1</span>
                    <Badge variant="secondary" className="text-xs">
                      Quick
                    </Badge>
                  </Button>
                  
                  <Button 
                    onClick={() => joinQueue('best_of_3')}
                    disabled={isLoading}
                    className="h-20 flex flex-col gap-2"
                  >
                    <Sword className="h-6 w-6" />
                    <span>Best of 3</span>
                    <Badge variant="secondary" className="text-xs">
                      Standard
                    </Badge>
                  </Button>
                  
                  <Button 
                    onClick={() => joinQueue('best_of_5')}
                    disabled={isLoading}
                    className="h-20 flex flex-col gap-2"
                  >
                    <Sword className="h-6 w-6" />
                    <span>Best of 5</span>
                    <Badge variant="secondary" className="text-xs">
                      Epic
                    </Badge>
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => joinQueue('best_of_3')} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Joining Queue..." : "Join Queue (Best of 3)"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Queue Status
                </CardTitle>
                <CardDescription>
                  Current matchmaking statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Players in queue:</span>
                  <span className="font-bold">{queueStatus.totalPlayers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Average wait time:</span>
                  <span className="font-bold">{formatTime(queueStatus.averageWaitTime)}</span>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Format Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sword className="h-4 w-4" />
                        Best of 1
                      </span>
                      <Badge>{queueStatus.formatDistribution.best_of_1}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sword className="h-4 w-4" />
                        Best of 3
                      </span>
                      <Badge>{queueStatus.formatDistribution.best_of_3}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sword className="h-4 w-4" />
                        Best of 5
                      </span>
                      <Badge>{queueStatus.formatDistribution.best_of_5}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="private" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Private Battle
              </CardTitle>
              <CardDescription>
                Challenge a friend to a private coding duel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-muted rounded-full p-4 mb-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Invite Friends</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Create a private battle and share the link with your friends to challenge them.
                </p>
                <Button onClick={createPrivateBattle} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Private Battle
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Battle History
              </CardTitle>
              <CardDescription>
                Your recent battles and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userBattles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-muted rounded-full p-4 mb-4">
                    <Sword className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Battles Yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    You haven't participated in any battles. Join the queue to get started!
                  </p>
                  <Button onClick={() => setActiveTab("queue")}>
                    Join Queue
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBattles.map((battle) => (
                    <div 
                      key={battle.id} 
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => viewBattle(battle.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Sword className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {battle.format.replace('_', ' ').toUpperCase()} Battle
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(battle.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={
                              battle.status === 'completed' ? 'default' : 
                              battle.status === 'in_progress' ? 'secondary' : 'outline'
                            }
                          >
                            {battle.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            2 participants
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {battle.battle_rounds?.length || 0} rounds
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}