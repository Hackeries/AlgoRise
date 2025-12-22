'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Swords, Users, Trophy, Zap, Lock, Crown } from 'lucide-react';
import type { MatchType, MatchMode, ArenaRating, ArenaDailyLimit } from '@/types/arena';
import { TIER_BADGES, FREE_DAILY_LIMIT } from '@/types/arena';

interface ArenaLobbyProps {
  userId: string;
  userRating: ArenaRating | null;
  dailyLimit: ArenaDailyLimit | null;
  isPro: boolean;
}

export function ArenaLobby({ userId, userRating, dailyLimit, isPro }: ArenaLobbyProps) {
  const router = useRouter();
  const [matchType, setMatchType] = useState<MatchType>('1v1');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [error, setError] = useState('');

  const matchesRemaining = isPro
    ? 999
    : FREE_DAILY_LIMIT - (dailyLimit?.matches_played || 0);

  const handleStartMatch = async (mode: MatchMode) => {
    if (mode === 'ranked' && !isPro) {
      setError('Ranked matches require Pro subscription');
      return;
    }

    if (matchesRemaining <= 0 && !isPro) {
      setError('Daily match limit reached. Upgrade to Pro for unlimited matches!');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchMessage('Searching for opponent...');

    try {
      const response = await fetch('/api/arena/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchType, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPro) {
          setError(data.error + ' - Upgrade to Pro!');
        } else {
          setError(data.error || 'Failed to find match');
        }
        setIsSearching(false);
        return;
      }

      if (data.success && data.matchId) {
        setSearchMessage(data.message);
        // Redirect to match page
        router.push(`/arena/match/${data.matchId}`);
      }
    } catch (err) {
      console.error('Matchmaking error:', err);
      setError('Failed to connect to matchmaking');
      setIsSearching(false);
    }
  };

  const elo = matchType === '1v1' ? userRating?.elo_1v1 : userRating?.elo_3v3;
  const tier = matchType === '1v1' ? userRating?.tier_1v1 : userRating?.tier_3v3;
  const matchesPlayed = matchType === '1v1' ? userRating?.matches_played_1v1 : userRating?.matches_played_3v3;
  const winRate = matchType === '1v1' 
    ? (userRating && userRating.matches_played_1v1 > 0 
        ? ((userRating.matches_won_1v1 / userRating.matches_played_1v1) * 100).toFixed(1)
        : '0.0')
    : (userRating && userRating.matches_played_3v3 > 0 
        ? ((userRating.matches_won_3v3 / userRating.matches_played_3v3) * 100).toFixed(1)
        : '0.0');

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <Swords className="h-10 w-10 text-primary" />
          Battle Arena
        </h1>
        <p className="text-muted-foreground">
          Compete against others in real-time problem-solving duels
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isPro && (
        <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950">
          <Crown className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Free users: {matchesRemaining} unranked match{matchesRemaining !== 1 ? 'es' : ''} remaining today.
            <Button variant="link" className="ml-2 text-amber-600" onClick={() => router.push('/pricing')}>
              Upgrade to Pro
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Player Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Rating</span>
                <Badge className={tier ? TIER_BADGES[tier] : ''}>
                  {tier?.toUpperCase() || 'UNRANKED'}
                </Badge>
              </div>
              <div className="text-3xl font-bold">{elo || 1200}</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Matches Played</span>
                <span className="font-medium">{matchesPlayed || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Win Rate</span>
                <span className="font-medium">{winRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Streak</span>
                <span className="font-medium flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  {userRating?.current_win_streak || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Match Type Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Select Game Mode</CardTitle>
            <CardDescription>
              Choose your battle format and start matchmaking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={matchType} onValueChange={(v) => setMatchType(v as MatchType)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="1v1" className="flex items-center gap-2">
                  <Swords className="h-4 w-4" />
                  1v1 Mind Clash
                </TabsTrigger>
                <TabsTrigger value="3v3" className="flex items-center gap-2" disabled>
                  <Users className="h-4 w-4" />
                  3v3 War Room
                  <Badge variant="outline" className="ml-2">Coming Soon</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="1v1" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Swords className="h-5 w-5" />
                        Unranked
                      </CardTitle>
                      <CardDescription>
                        Practice mode - no ELO changes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => handleStartMatch('unranked')}
                        disabled={isSearching || matchesRemaining <= 0}
                      >
                        {isSearching ? searchMessage : 'Start Match'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-primary transition-colors cursor-pointer relative">
                    {!isPro && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-amber-500 hover:bg-amber-600">
                          <Lock className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Ranked
                      </CardTitle>
                      <CardDescription>
                        Competitive mode - affects your ELO
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        variant={isPro ? 'default' : 'outline'}
                        onClick={() => handleStartMatch('ranked')}
                        disabled={isSearching || !isPro}
                      >
                        {!isPro ? 'Requires Pro' : isSearching ? searchMessage : 'Start Ranked'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Match Features
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 3 problems per match</li>
                    <li>• 30-minute time limit</li>
                    <li>• Fog of Progress - opponent status is hidden</li>
                    <li>• Pressure Phase in final 5 minutes</li>
                    <li>• Momentum bonuses for solve streaks</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="3v3" className="space-y-4">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    3v3 Team Battles will be available in a future update
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Titles Section */}
      {userRating && userRating.titles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Your Titles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userRating.titles.map((title, idx) => (
                <Badge key={idx} variant="outline" className="text-base py-1 px-3">
                  {title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

