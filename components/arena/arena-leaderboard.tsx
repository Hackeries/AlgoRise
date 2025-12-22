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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Arena Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={matchType} onValueChange={(v) => setMatchType(v as MatchType)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="1v1" className="flex items-center gap-2">
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
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No players yet. Be the first to compete!
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      entry.rank <= 3
                        ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/20'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-12 text-center font-bold text-lg">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar & Username */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>
                          {entry.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{entry.username}</p>
                        {entry.titles.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.titles[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">ELO</p>
                        <p className="font-bold">{entry.elo}</p>
                      </div>
                      <Badge className={TIER_BADGES[entry.tier]}>
                        {entry.tier.toUpperCase()}
                      </Badge>
                      <div className="text-center hidden sm:block">
                        <p className="text-muted-foreground text-xs">Win Rate</p>
                        <p className="font-semibold">{entry.winRate}%</p>
                      </div>
                      <div className="text-center hidden md:block">
                        <p className="text-muted-foreground text-xs">Matches</p>
                        <p className="font-semibold">{entry.matchesPlayed}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="3v3">
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
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
