'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  Play,
  Download,
  Share2,
  Star,
  Crown
} from "lucide-react";
import { motion } from 'framer-motion';
import { ReplayViewer } from '@/components/battle-arena/replay-viewer';

interface Player {
  id: string;
  name: string;
  rating: number;
  solved: number;
  penalty: number;
  isOnline: boolean;
}

interface Problem {
  id: string;
  name: string;
  title: string;
  description: string;
  input: string;
  output: string;
  sampleInput: string;
  sampleOutput: string;
  timeLimit: number;
  memoryLimit: number;
  solved: number;
  attempts: number;
}

interface ReplayEvent {
  id: string;
  type: 'submission' | 'chat' | 'round_start' | 'round_end' | 'battle_start' | 'battle_end';
  timestamp: number;
  data: any;
}

export default function ReplayPage({ params }: { params: { id: string } }) {
  const [replayData, setReplayData] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [events, setEvents] = useState<ReplayEvent[]>([]);
  const router = useRouter();

  // Fetch replay data
  useEffect(() => {
    // In a real implementation, this would fetch from the replays table
    // For now, we'll use empty data
    setReplayData(null);
    setPlayers([]);
    setProblems([]);
    setEvents([]);
  }, [params.id]);

  const downloadReplay = () => {
    // In a real implementation, this would download the replay file
    alert("Replay download would start here");
  };

  const shareReplay = () => {
    // In a real implementation, this would share the replay
    alert("Replay sharing would start here");
  };

  if (!replayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-blue-200">Loading replay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
      {/* Replay Header */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
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
                  Battle Replay
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {replayData.title}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={downloadReplay}
                  variant="outline"
                  className="border-yellow-500/30 hover:bg-yellow-500/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={shareReplay}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Date</div>
                <div className="font-semibold">
                  {replayData.date.toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <div className="font-semibold">
                  {Math.floor(replayData.duration / 60)}m {replayData.duration % 60}s
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Winner</div>
                <div className="font-semibold text-yellow-400">
                  {replayData.winner}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Rating Change</div>
                <div className="font-semibold text-green-400">
                  {replayData.ratingChange}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Replay Viewer */}
      <ReplayViewer 
        battleId={replayData.battleId}
        players={players}
        problems={problems}
        events={events}
      />
      
      {/* Replay Info */}
      <div className="p-4 md:p-8 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                          {player.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Rating: {player.rating}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-slate-800/50">
                        {player.solved} solved
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Replay Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Replay Information</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Battle ID: {replayData.battleId}</li>
                      <li>• Recorded: {replayData.date.toLocaleString()}</li>
                      <li>• Duration: {Math.floor(replayData.duration / 60)}m {replayData.duration % 60}s</li>
                      <li>• Events: {events.length} events recorded</li>
                    </ul>
                  </div>
                  
                  <Separator className="bg-yellow-500/20" />
                  
                  <div>
                    <h4 className="font-medium mb-2">How to Use</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use playback controls to navigate the battle</li>
                      <li>• Adjust speed to slow down or speed up replay</li>
                      <li>• View code submissions as they happened</li>
                      <li>• See chat messages in real-time</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}