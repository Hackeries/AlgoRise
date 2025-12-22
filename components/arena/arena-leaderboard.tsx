'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Swords, Users } from 'lucide-react';
import type { LeaderboardEntry, MatchType } from '@/types/arena';
import { TIER_BADGES } from '@/types/arena';

export function ArenaLeaderboard() {
  const [matchType, setMatchType] = useState<MatchType>('1v1');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [matchType]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/arena/leaderboard?matchType=${matchType}&limit=50`);
      const data = await response.json();
      
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          Arena Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={matchType} onValueChange={(v) => setMatchType(v as MatchType)}>
          <TabsList className="grid w-full grid-cols-2 mb-6 glass-panel">
            <TabsTrigger value="1v1" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <Swords className="h-4 w-4" />
              1v1 Rankings
            </TabsTrigger>
            <TabsTrigger value="3v3" className="flex items-center gap-2" disabled>
              <Users className="h-4 w-4" />
              3v3 Rankings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1v1">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No players yet. Be the first to compete!
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover-lift ${
                      entry.rank <= 3
                        ? 'bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent border border-yellow-500/20'
                        : 'glass-card hover:bg-card/70'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-16 text-center">
                      <div className={`font-bold text-2xl ${entry.rank <= 3 ? 'text-yellow-500' : ''}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                    </div>

                    {/* Avatar & Username */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold">
                          {entry.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                          {entry.username}
                        </p>
                        {entry.titles.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.titles[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center px-3 py-2 rounded-lg bg-background/50">
                        <p className="text-muted-foreground text-xs uppercase tracking-wide">ELO</p>
                        <p className="font-bold text-lg">{entry.elo}</p>
                      </div>
                      <Badge className={`${TIER_BADGES[entry.tier]} px-3 py-1`}>
                        {entry.tier.toUpperCase()}
                      </Badge>
                      <div className="text-center px-3 py-2 rounded-lg bg-background/50 hidden sm:block">
                        <p className="text-muted-foreground text-xs uppercase tracking-wide">Win Rate</p>
                        <p className="font-semibold text-success">{entry.winRate}%</p>
                      </div>
                      <div className="text-center px-3 py-2 rounded-lg bg-background/50 hidden md:block">
                        <p className="text-muted-foreground text-xs uppercase tracking-wide">Matches</p>
                        <p className="font-semibold">{entry.matchesPlayed}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="3v3">
            <div className="text-center py-12 glass-panel">
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                3v3 rankings will be available in a future update
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
