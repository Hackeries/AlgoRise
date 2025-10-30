'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Users, Medal, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  battlesCount: number;
  winRate: number;
  ratingChange?: number;
}

interface LeaderboardProps {
  mode?: '1v1' | '3v3' | 'all';
  period?: 'all-time' | 'monthly' | 'weekly';
  limit?: number;
}

export default function Leaderboard({ 
  mode = '1v1', 
  period = 'all-time',
  limit = 50 
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [mode, period]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `/api/battles/leaderboard?mode=${mode}&period=${period}&limit=${limit}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-slate-400 font-semibold">#{rank}</span>;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating < 1200) return 'text-gray-400';
    if (rating < 1400) return 'text-green-400';
    if (rating < 1600) return 'text-cyan-400';
    if (rating < 1900) return 'text-blue-400';
    if (rating < 2100) return 'text-purple-400';
    if (rating < 2300) return 'text-orange-400';
    if (rating < 2400) return 'text-red-400';
    return 'text-red-600';
  };

  const getRatingTier = (rating: number) => {
    if (rating < 1200) return 'Newbie';
    if (rating < 1400) return 'Pupil';
    if (rating < 1600) return 'Specialist';
    if (rating < 1900) return 'Expert';
    if (rating < 2100) return 'Candidate Master';
    if (rating < 2300) return 'Master';
    if (rating < 2400) return 'International Master';
    return 'Grandmaster';
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <CardTitle>Leaderboard</CardTitle>
          </div>
          <Badge variant="outline" className="text-blue-400 border-blue-500">
            {mode === 'all' ? 'All Modes' : mode === '1v1' ? '1v1 Duels' : '3v3 Teams'}
          </Badge>
        </div>
        <CardDescription>
          {period === 'all-time' ? 'All-time rankings' : 
           period === 'monthly' ? 'This month' : 'This week'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-slate-400 mt-4">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No rankings yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Be the first to compete and make it to the leaderboard!
              </p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border ${
                  entry.rank <= 3 
                    ? 'bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-yellow-500/30' 
                    : 'bg-slate-800/30 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500">
                        <div className="flex items-center justify-center h-full text-white font-semibold">
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                      </Avatar>
                      
                      <div>
                        <div className="font-semibold text-white">
                          {entry.username}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className={getRatingColor(entry.rating)}>
                            {getRatingTier(entry.rating)}
                          </span>
                          {entry.ratingChange !== undefined && entry.ratingChange !== 0 && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                entry.ratingChange > 0 
                                  ? 'text-green-400 border-green-500' 
                                  : 'text-red-400 border-red-500'
                              }`}
                            >
                              {entry.ratingChange > 0 ? '+' : ''}{entry.ratingChange}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getRatingColor(entry.rating)}`}>
                        {entry.rating}
                      </div>
                      <div className="text-xs text-slate-400">Rating</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-400">
                        {entry.wins}W
                      </div>
                      <div className="text-xs text-slate-400">
                        {entry.losses}L
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-400">
                        {entry.winRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">Win Rate</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
