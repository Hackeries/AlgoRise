// Battle Arena Leaderboard Page

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sword, 
  Trophy, 
  Crown,
  Medal,
  Star
} from "lucide-react";

export default function BattleLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Fetch leaderboard data from the new API endpoint
      const response = await fetch(`/api/battles/leaderboard?timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.leaderboard) {
        setLeaderboard(result.leaderboard);
      } else {
        console.error('Error fetching leaderboard:', result.error);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRatingTier = (rating: number) => {
    if (rating < 1200) return { label: "Newbie", color: "text-gray-400", icon: "🌱" };
    if (rating < 1400) return { label: "Pupil", color: "text-green-400", icon: "🟢" };
    if (rating < 1600) return { label: "Specialist", color: "text-cyan-400", icon: "🔵" };
    if (rating < 1900) return { label: "Expert", color: "text-blue-500", icon: "🔷" };
    if (rating < 2100) return { label: "Candidate Master", color: "text-purple-500", icon: "🟣" };
    if (rating < 2300) return { label: "Master", color: "text-orange-500", icon: "🟠" };
    if (rating < 2400) return { label: "International Master", color: "text-red-500", icon: "🔴" };
    return { label: "Grandmaster", color: "text-red-600", icon: "🔥" };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Battle Arena Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top coders competing in real-time duels
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          variant={timeRange === 'all' ? 'default' : 'outline'}
          onClick={() => setTimeRange('all')}
        >
          All Time
        </Button>
        <Button
          variant={timeRange === 'month' ? 'default' : 'outline'}
          onClick={() => setTimeRange('month')}
        >
          This Month
        </Button>
        <Button
          variant={timeRange === 'week' ? 'default' : 'outline'}
          onClick={() => setTimeRange('week')}
        >
          This Week
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5" />
            Top Coders
          </CardTitle>
          <CardDescription>
            Ranked by battle rating (ELO)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No battles yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to join the leaderboard by participating in battles!
              </p>
              <Button onClick={() => window.location.href = '/battle-arena'}>
                Join Battle Arena
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((player, index) => {
                const tier = getRatingTier(player.rating);
                const rank = player.rank;
                
                return (
                  <div 
                    key={player.user_id} 
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center gap-2 w-24">
                        {getRankIcon(rank)}
                        {rank <= 3 && (
                          <span className="text-lg">{tier.icon}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">
                            {player.username || 'Anonymous'}
                          </h3>
                          {rank === 1 && (
                            <Badge variant="default" className="text-xs">
                              Top
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className={tier.color}>{tier.label}</span>
                          <Star className="h-3 w-3" />
                          <span>{player.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="font-medium">{player.battles_count}</div>
                          <div className="text-muted-foreground text-xs">Battles</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {player.win_rate}%
                          </div>
                          <div className="text-muted-foreground text-xs">Win Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}