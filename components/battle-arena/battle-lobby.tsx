'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, 
  Users, 
  Bot, 
  Clock, 
  Trophy,
  Target,
  AlertCircle
} from 'lucide-react';

interface BattleLobbyProps {
  userRating: number;
  userRank: string;
  recentStats: {
    wins: number;
    total: number;
  };
}

export function BattleLobby({ userRating, userRank, recentStats }: BattleLobbyProps) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<'1v1' | '3v3' | 'practice' | null>(null);
  const [isQueuing, setIsQueuing] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [searchRadius, setSearchRadius] = useState(200);
  const [showBotOption, setShowBotOption] = useState(false);

  // Queue timer
  useEffect(() => {
    if (!isQueuing) return;

    const timer = setInterval(() => {
      setQueueTime((prev) => {
        const newTime = prev + 1;
        
        // Expand search radius after 2 minutes
        if (newTime === 120) {
          setSearchRadius(400);
        }
        
        // Offer bot match after 5 minutes
        if (newTime === 300) {
          setShowBotOption(true);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isQueuing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinQueue = async (mode: '1v1' | '3v3' | 'practice') => {
    setSelectedMode(mode);
    
    if (mode === 'practice') {
      router.push('/battle-arena/queue/1v1?bot=true');
      return;
    }
    
    setIsQueuing(true);
    router.push(`/battle-arena/queue/${mode}`);
  };

  const handleCancelQueue = () => {
    setIsQueuing(false);
    setQueueTime(0);
    setSearchRadius(200);
    setShowBotOption(false);
    setSelectedMode(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* User Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Current Rank</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{userRank}</div>
                <div className="text-sm text-muted-foreground">{userRating} rating</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Recent Stats</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {recentStats.wins}/{recentStats.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round((recentStats.wins / recentStats.total) * 100)}% win rate
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end gap-2 mb-1">
                  <Sword className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Status</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">Ready</div>
                <div className="text-sm text-muted-foreground">Let's battle!</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Battle Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1v1 Battle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
        >
          <Card className="h-full bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30 hover:border-blue-400/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Sword className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-xl">1v1 Battle</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Fast-paced head-to-head competitive programming duel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Format</div>
                  <div className="font-semibold">Best of 3</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="font-semibold">~20 min</div>
                </div>
              </div>
              
              <Button 
                onClick={() => handleJoinQueue('1v1')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                disabled={isQueuing}
              >
                Start 1v1 Battle
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3v3 Team Battle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
        >
          <Card className="h-full bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 hover:border-purple-400/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-xl">3v3 Team Battle</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Collaborative ICPC-style team competition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Format</div>
                  <div className="font-semibold">ICPC</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="font-semibold">60 min</div>
                </div>
              </div>
              
              <Button 
                onClick={() => handleJoinQueue('3v3')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isQueuing}
              >
                Start Team Battle
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Practice vs AI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
        >
          <Card className="h-full bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 hover:border-green-400/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Bot className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-xl">Practice (vs AI)</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Sharpen your skills against AI opponents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Rating</div>
                  <div className="font-semibold">No Effect</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">Difficulty</div>
                  <div className="font-semibold">Adaptive</div>
                </div>
              </div>
              
              <Button 
                onClick={() => handleJoinQueue('practice')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Practice Battle
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Queue Status - Only shown when in queue */}
      <AnimatePresence>
        {isQueuing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/30 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Clock className="h-5 w-5 animate-spin" />
                  Searching for opponent...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Queue Time</div>
                    <div className="text-2xl font-bold text-blue-400">{formatTime(queueTime)}</div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Skill Range</div>
                    <div className="text-2xl font-bold text-cyan-400">±{searchRadius}</div>
                    <div className="text-xs text-muted-foreground">rating points</div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Your Rating</div>
                    <div className="text-2xl font-bold text-purple-400">{userRating}</div>
                  </div>
                </div>

                {/* Expanded search message */}
                {queueTime >= 120 && queueTime < 300 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg"
                  >
                    <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-orange-300">Search Expanded</div>
                      <div className="text-sm text-orange-200/80">
                        We've widened the search range to find you an opponent faster!
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Bot option after 5 minutes */}
                {showBotOption && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
                  >
                    <Bot className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-green-300 mb-2">Having trouble finding an opponent?</div>
                      <Button
                        onClick={() => handleJoinQueue('practice')}
                        variant="outline"
                        className="border-green-500/50 text-green-300 hover:bg-green-500/10"
                      >
                        Play Practice Battle vs AI while waiting
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                <Button 
                  onClick={handleCancelQueue}
                  variant="destructive"
                  className="w-full"
                >
                  Cancel Queue
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
