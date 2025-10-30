'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  Play,
  Plus,
  Search,
  Crown,
  Star,
  Flame,
  Zap,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";
import { motion } from 'framer-motion';

interface Participant {
  id: string;
  name: string;
  rating: number;
  avatar?: string;
}

interface Match {
  id: string;
  round: number;
  player1: Participant | null;
  player2: Participant | null;
  winner: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
}

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [userRating, setUserRating] = useState(1200);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch tournament data
  useEffect(() => {
    // In a real implementation, this would fetch from the tournaments table
    // For now, we'll use empty data
    setTournament(null);
    setParticipants([]);
    setMatches([]);
  }, [params.id]);

  const joinTournament = () => {
    toast({
      title: "Join Tournament",
      description: "Successfully registered for the tournament!",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-300';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getRoundName = (round: number) => {
    const rounds = [
      'Round of 64',
      'Round of 32',
      'Round of 16',
      'Quarterfinals',
      'Semifinals',
      'Final'
    ];
    return rounds[round - 1] || `Round ${round}`;
  };

  // Group matches by round
  const matchesByRound: Record<number, Match[]> = {};
  matches.forEach(match => {
    if (!matchesByRound[match.round]) {
      matchesByRound[match.round] = [];
    }
    matchesByRound[match.round].push(match);
  });

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-blue-200">Loading tournament...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-blue-200">
                <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
                {tournament?.name || 'Tournament'}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {tournament?.description || 'Tournament details'}
              </p>
            </div>
            
            {tournament?.status === 'registration' && (
              <Button 
                onClick={joinTournament}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Join Tournament
              </Button>
            )}
          </div>
          
          {tournament && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                  {tournament.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Participants</div>
                <div className="font-semibold">
                  {tournament.currentParticipants}/{tournament.maxParticipants}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Prize Pool</div>
                <div className="font-semibold text-yellow-400">
                  ${tournament.prizePool}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Format</div>
                <div className="font-semibold">
                  Single Elimination
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bracket Visualization */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Tournament Bracket
              </CardTitle>
              <CardDescription>
                Follow the elimination matches to see who advances to the next round
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-full min-h-[600px] relative">
                  {/* Bracket lines and matches */}
                  {Object.entries(matchesByRound).map(([round, roundMatches]) => (
                    <div 
                      key={round} 
                      className="absolute top-0 flex flex-col items-center"
                      style={{ 
                        left: `${(parseInt(round) - 1) * 180}px`,
                        width: '160px'
                      }}
                    >
                      <h3 className="text-center font-semibold mb-4 text-yellow-400">
                        {getRoundName(parseInt(round))}
                      </h3>
                      <div className="space-y-8">
                        {roundMatches.map((match) => (
                          <div 
                            key={match.id} 
                            className="bg-slate-800/50 border rounded-lg p-3 w-40"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <Badge className={getStatusColor(match.status)}>
                                {match.status.replace('_', ' ')}
                              </Badge>
                              {match.winner && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">
                                  {match.player1 ? '1' : '?'}
                                </div>
                                <span className="text-sm truncate">
                                  {match.player1?.name || 'TBD'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs">
                                  {match.player2 ? '2' : '?'}
                                </div>
                                <span className="text-sm truncate">
                                  {match.player2?.name || 'TBD'}
                                </span>
                              </div>
                            </div>
                            
                            {match.winner && (
                              <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-center">
                                Winner: {participants.find(p => p.id === match.winner)?.name || 'Unknown'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants List */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Tournament Participants
              </CardTitle>
              <CardDescription>
                All registered competitors in this tournament
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {participants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                        {participant.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm">
                        {participant.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rating: {participant.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournament Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <div className="font-medium">Tournament Start</div>
                    <div className="text-sm text-muted-foreground">
                      {tournament?.startDate?.toLocaleDateString() || 'TBD'}
                    </div>
                  </div>
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <div className="font-medium">Tournament End</div>
                    <div className="text-sm text-muted-foreground">
                      {tournament?.endDate?.toLocaleDateString() || 'TBD'}
                    </div>
                  </div>
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Rules & Prizes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Tournament Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Single elimination bracket format</li>
                    <li>• Best of 3 matches per round</li>
                    <li>• 15-minute time limit per match</li>
                    <li>• No rating changes during tournament</li>
                  </ul>
                </div>
                
                <Separator className="bg-yellow-500/20" />
                
                <div>
                  <h4 className="font-medium mb-2">Prize Distribution</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 1st Place: $500 + 100 rating</li>
                    <li>• 2nd Place: $300 + 75 rating</li>
                    <li>• 3rd Place: $150 + 50 rating</li>
                    <li>• Top 8: $50 + 25 rating each</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}