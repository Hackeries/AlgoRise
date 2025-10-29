'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Crown, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Player {
  id: string;
  name: string;
  rating: number;
  solved: number;
  penalty: number;
  avatar?: string;
  isOnline: boolean;
}

interface Problem {
  id: string;
  name: string;
  solved: number;
  attempts: number;
  firstSolveTime?: number;
}

interface ScoreboardProps {
  players: Player[];
  problems: Problem[];
  currentTime: number; // in seconds
  totalDuration: number; // in seconds
  isTeamBattle?: boolean;
}

export function Scoreboard({ 
  players, 
  problems, 
  currentTime, 
  totalDuration,
  isTeamBattle = false
}: ScoreboardProps) {
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);
  const [timeLeft, setTimeLeft] = useState(totalDuration - currentTime);

  useEffect(() => {
    // Sort players by solved count (desc) then by penalty (asc)
    const sorted = [...players].sort((a, b) => {
      if (b.solved !== a.solved) return b.solved - a.solved;
      return a.penalty - b.penalty;
    });
    setSortedPlayers(sorted);
    
    // Update time left
    setTimeLeft(totalDuration - currentTime);
  }, [players, currentTime, totalDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-blue-500/20 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-200">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Live Scoreboard
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Progress value={(currentTime / totalDuration) * 100} className="h-1" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Problems Header */}
        <div className="grid grid-cols-12 gap-1 px-4 py-2 border-b border-blue-500/20 bg-slate-800/50 text-xs font-medium">
          <div className="col-span-5">Participant</div>
          <div className="col-span-1 text-center">Solved</div>
          <div className="col-span-1 text-center">Penalty</div>
          {problems.map((problem) => (
            <div 
              key={problem.id} 
              className="col-span-1 flex flex-col items-center justify-center"
            >
              <div className="text-blue-300">{problem.name}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {problem.solved}/{problem.attempts}
              </div>
            </div>
          ))}
        </div>

        {/* Players List */}
        <AnimatePresence>
          {sortedPlayers.map((player, index) => {
            const tier = getRatingTier(player.rating);
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`grid grid-cols-12 gap-1 px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                  index === 0 ? 'bg-yellow-500/5' : ''
                }`}
              >
                {/* Rank and Player Info */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="flex items-center gap-2 w-8">
                    {index === 0 && <Crown className="h-4 w-4 text-yellow-400" />}
                    <span className="font-mono text-sm w-4">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                        {player.name.charAt(0)}
                      </div>
                      {player.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1">
                        {player.name}
                        {isTeamBattle && (
                          <Users className="h-3 w-3 text-blue-400" />
                        )}
                      </div>
                      <div className={`text-[10px] ${tier.color}`}>
                        {tier.label} ({player.rating})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solved Count */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm">{player.solved}</span>
                  </div>
                </div>

                {/* Penalty */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="font-mono text-sm">{player.penalty}</span>
                  </div>
                </div>

                {/* Problem Status */}
                {problems.map((problem) => {
                  // In a real implementation, this would be based on actual submissions
                  const isSolved = Math.random() > 0.7;
                  const attempts = Math.floor(Math.random() * 3) + 1;
                  
                  return (
                    <div 
                      key={`${player.id}-${problem.id}`} 
                      className="col-span-1 flex items-center justify-center"
                    >
                      {isSolved ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {attempts}
                          </span>
                        </div>
                      ) : attempts > 1 ? (
                        <div className="flex flex-col items-center">
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {attempts}
                          </span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-600"></div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Battle Stats */}
        <div className="px-4 py-3 border-t border-blue-500/20 bg-slate-800/30">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span>{players.length} Participants</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>{problems.reduce((sum, p) => sum + p.solved, 0)} Solutions</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-400" />
              <span>Live Updates</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Example usage of the Scoreboard component
export function ICPCScoreboardDemo() {
  const players: Player[] = [
    {
      id: "1",
      name: "Alice Johnson",
      rating: 1850,
      solved: 3,
      penalty: 45,
      isOnline: true
    },
    {
      id: "2",
      name: "Bob Smith",
      rating: 1620,
      solved: 2,
      penalty: 38,
      isOnline: true
    },
    {
      id: "3",
      name: "Charlie Brown",
      rating: 1420,
      solved: 2,
      penalty: 62,
      isOnline: true
    },
    {
      id: "4",
      name: "Diana Prince",
      rating: 1980,
      solved: 1,
      penalty: 15,
      isOnline: true
    }
  ];

  const problems: Problem[] = [
    { id: "A", name: "A", solved: 4, attempts: 6 },
    { id: "B", name: "B", solved: 3, attempts: 5 },
    { id: "C", name: "C", solved: 2, attempts: 4 },
    { id: "D", name: "D", solved: 1, attempts: 3 },
    { id: "E", name: "E", solved: 0, attempts: 2 }
  ];

  return (
    <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 min-h-screen">
      <Scoreboard 
        players={players} 
        problems={problems} 
        currentTime={1800} 
        totalDuration={3600}
      />
    </div>
  );
}