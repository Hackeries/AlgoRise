'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  Play,
  Search,
  Download,
  Share2,
  Star,
  Crown,
  Filter
} from "lucide-react";
import { motion } from 'framer-motion';

interface Replay {
  id: string;
  title: string;
  date: Date;
  duration: number;
  players: string[];
  winner: string;
  ratingChange: string;
  isPublic: boolean;
}

export default function ReplaysPage() {
  const [replays, setReplays] = useState<Replay[]>([]);
  const [filteredReplays, setFilteredReplays] = useState<Replay[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();

  // Mock data for replays
  useEffect(() => {
    const mockReplays: Replay[] = [
      {
        id: '1',
        title: 'Alice Johnson vs Bob Smith',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        duration: 320,
        players: ['Alice Johnson', 'Bob Smith'],
        winner: 'Alice Johnson',
        ratingChange: '+25',
        isPublic: true
      },
      {
        id: '2',
        title: 'Charlie Brown vs Diana Prince',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration: 450,
        players: ['Charlie Brown', 'Diana Prince'],
        winner: 'Diana Prince',
        ratingChange: '+18',
        isPublic: true
      },
      {
        id: '3',
        title: 'Eve Wilson vs Frank Miller',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: 280,
        players: ['Eve Wilson', 'Frank Miller'],
        winner: 'Eve Wilson',
        ratingChange: '+32',
        isPublic: false
      },
      {
        id: '4',
        title: 'Grace Lee vs Henry Taylor',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: 620,
        players: ['Grace Lee', 'Henry Taylor'],
        winner: 'Henry Taylor',
        ratingChange: '+15',
        isPublic: true
      },
      {
        id: '5',
        title: 'Ivy Chen vs Jack Davis',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        duration: 380,
        players: ['Ivy Chen', 'Jack Davis'],
        winner: 'Ivy Chen',
        ratingChange: '+22',
        isPublic: true
      }
    ];
    
    setReplays(mockReplays);
    setFilteredReplays(mockReplays);
  }, []);

  // Filter replays based on search term and filter
  useEffect(() => {
    let result = replays;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(replay => 
        replay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        replay.players.some(player => player.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (activeFilter === 'public') {
      result = result.filter(replay => replay.isPublic);
    } else if (activeFilter === 'private') {
      result = result.filter(replay => !replay.isPublic);
    }
    
    setFilteredReplays(result);
  }, [searchTerm, activeFilter, replays]);

  const viewReplay = (replayId: string) => {
    router.push(`/battle-arena/replays/${replayId}`);
  };

  const downloadReplay = (replayId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real implementation, this would download the replay file
    alert(`Downloading replay ${replayId}`);
  };

  const shareReplay = (replayId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real implementation, this would share the replay
    alert(`Sharing replay ${replayId}`);
  };

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
              Battle Replays
            </h1>
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
          </div>
          <p className="text-base md:text-lg text-blue-200 max-w-2xl mx-auto px-2">
            Watch, download, and share your past battles. Relive the excitement and learn from your matches.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search replays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-yellow-500/20"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              className="text-xs md:text-sm"
            >
              All
            </Button>
            <Button
              variant={activeFilter === 'public' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('public')}
              className="text-xs md:text-sm"
            >
              Public
            </Button>
            <Button
              variant={activeFilter === 'private' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('private')}
              className="text-xs md:text-sm"
            >
              Private
            </Button>
          </div>
        </div>

        {/* Replays Grid */}
        {filteredReplays.length === 0 ? (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Replays Found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                There are no replays matching your current search or filter. Try adjusting your criteria!
              </p>
              <Button onClick={() => { setSearchTerm(''); setActiveFilter('all'); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredReplays.map((replay) => (
              <motion.div
                key={replay.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/40 transition-all cursor-pointer"
                  onClick={() => viewReplay(replay.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                        {replay.title}
                      </CardTitle>
                      {!replay.isPublic && (
                        <Badge variant="secondary" className="bg-slate-700 text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs md:text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {replay.date.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {Math.floor(replay.duration / 60)}m {replay.duration % 60}s
                        </span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300">
                        {replay.ratingChange}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {replay.players.map((player, index) => (
                          <div 
                            key={index} 
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold border-2 border-slate-900"
                            title={player}
                          >
                            {player.charAt(0)}
                          </div>
                        ))}
                      </div>
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                        Winner: {replay.winner}
                      </Badge>
                    </div>
                    
                    <Separator className="bg-yellow-500/20" />
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1 border-yellow-500/30 hover:bg-yellow-500/10"
                        onClick={(e) => downloadReplay(replay.id, e)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        <span className="hidden xs:inline">Download</span>
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1 border-yellow-500/30 hover:bg-yellow-500/10"
                        onClick={(e) => shareReplay(replay.id, e)}
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        <span className="hidden xs:inline">Share</span>
                      </Button>
                      <Button 
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                        onClick={() => viewReplay(replay.id)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        <span className="hidden xs:inline">Watch</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Replay Info */}
        <div className="mt-8 md:mt-12">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                About Battle Replays
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-yellow-400 font-bold text-lg mb-2">1. Watch</div>
                <p className="text-sm text-muted-foreground">
                  Relive your battles with our interactive replay system. See every move, submission, and chat message.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-yellow-400 font-bold text-lg mb-2">2. Learn</div>
                <p className="text-sm text-muted-foreground">
                  Analyze your performance and learn from your mistakes. See how top players solve problems.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-yellow-400 font-bold text-lg mb-2">3. Share</div>
                <p className="text-sm text-muted-foreground">
                  Share your best battles with the community. Show off your skills and help others learn.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}