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
  Zap
} from "lucide-react";
import { motion } from 'framer-motion';

interface Tournament {
  id: string;
  name: string;
  description: string;
  status: 'upcoming' | 'registration' | 'in_progress' | 'completed';
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  minRating: number;
  maxRating: number;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const router = useRouter();
  const { toast } = useToast();

  // Mock data for tournaments
  useEffect(() => {
    const mockTournaments: Tournament[] = [
      {
        id: '1',
        name: 'Weekly ICPC Challenge',
        description: 'Weekly competitive programming tournament with ICPC-style problems',
        status: 'registration',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxParticipants: 64,
        currentParticipants: 42,
        entryFee: 0,
        prizePool: 1000,
        format: 'single_elimination',
        minRating: 1200,
        maxRating: 2500
      },
      {
        id: '2',
        name: 'Grandmaster Showdown',
        description: 'Exclusive tournament for top-rated programmers',
        status: 'upcoming',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        maxParticipants: 32,
        currentParticipants: 0,
        entryFee: 10,
        prizePool: 5000,
        format: 'double_elimination',
        minRating: 2000,
        maxRating: 3000
      },
      {
        id: '3',
        name: 'Beginner\'s Cup',
        description: 'Tournament designed for newcomers to competitive programming',
        status: 'in_progress',
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        maxParticipants: 128,
        currentParticipants: 128,
        entryFee: 0,
        prizePool: 500,
        format: 'single_elimination',
        minRating: 800,
        maxRating: 1500
      }
    ];
    setTournaments(mockTournaments);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-300';
      case 'registration': return 'bg-green-500/20 text-green-300';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-300';
      case 'completed': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'single_elimination': return 'Single Elimination';
      case 'double_elimination': return 'Double Elimination';
      case 'round_robin': return 'Round Robin';
      default: return format;
    }
  };

  const joinTournament = (tournamentId: string) => {
    toast({
      title: "Join Tournament",
      description: "Successfully registered for the tournament!",
    });
    router.push(`/battle-arena/tournaments/${tournamentId}`);
  };

  const createTournament = () => {
    toast({
      title: "Create Tournament",
      description: "Tournament creation feature coming soon!",
    });
  };

  const filteredTournaments = tournaments.filter(tournament => 
    activeTab === 'all' || tournament.status === activeTab
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-6 md:mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Tournament Arena
            </h1>
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
          </div>
          <p className="text-base md:text-lg text-blue-200 max-w-2xl mx-auto px-2">
            Compete in structured tournaments with elimination brackets and climb to the top of the leaderboard.
          </p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Crown className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
              Active Tournaments
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Join ongoing competitions or register for upcoming events
            </p>
          </div>
          
          <Button 
            onClick={createTournament}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className="text-xs md:text-sm"
          >
            All
          </Button>
          <Button
            variant={activeTab === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setActiveTab('upcoming')}
            className="text-xs md:text-sm"
          >
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Button>
          <Button
            variant={activeTab === 'registration' ? 'default' : 'outline'}
            onClick={() => setActiveTab('registration')}
            className="text-xs md:text-sm"
          >
            <Play className="h-3 w-3 mr-1" />
            Registration Open
          </Button>
          <Button
            variant={activeTab === 'in_progress' ? 'default' : 'outline'}
            onClick={() => setActiveTab('in_progress')}
            className="text-xs md:text-sm"
          >
            <Flame className="h-3 w-3 mr-1" />
            In Progress
          </Button>
        </div>

        {/* Tournament Grid */}
        {filteredTournaments.length === 0 ? (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Tournaments Found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                There are no tournaments matching your current filter. Check back later for new events!
              </p>
              <Button onClick={() => setActiveTab('all')}>
                View All Tournaments
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/40 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                        {tournament.name}
                      </CardTitle>
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs md:text-sm">
                      {tournament.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {tournament.startDate.toLocaleDateString()} - {tournament.endDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-muted-foreground">Participants</div>
                        <div className="font-semibold">
                          {tournament.currentParticipants}/{tournament.maxParticipants}
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-muted-foreground">Prize Pool</div>
                        <div className="font-semibold text-yellow-400">
                          ${tournament.prizePool}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {tournament.minRating} - {tournament.maxRating} rating
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {getFormatLabel(tournament.format)}
                      </Badge>
                    </div>
                    
                    <Separator className="bg-yellow-500/20" />
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => router.push(`/battle-arena/tournaments/${tournament.id}`)}
                        variant="outline"
                        className="flex-1 border-yellow-500/30 hover:bg-yellow-500/10"
                      >
                        View Details
                      </Button>
                      {(tournament.status === 'registration' || tournament.status === 'upcoming') && (
                        <Button 
                          onClick={() => joinTournament(tournament.id)}
                          className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tournament Info */}
        <div className="mt-8 md:mt-12">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                How Tournaments Work
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-yellow-400 font-bold text-lg mb-2">1. Register</div>
                <p className="text-sm text-muted-foreground">
                  Join an upcoming tournament during the registration period. Some tournaments may require an entry fee.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-yellow-400 font-bold text-lg mb-2">2. Compete</div>
                <p className="text-sm text-muted-foreground">
                  Battle against other participants in elimination rounds. Winners advance to the next bracket stage.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-yellow-400 font-bold text-lg mb-2">3. Win</div>
                <p className="text-sm text-muted-foreground">
                  Climb the brackets and reach the finals. Top performers receive prize rewards and rating bonuses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}