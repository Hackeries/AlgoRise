'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Rewind,
  FastForward,
  Clock,
  Code,
  MessageSquare,
  CheckCircle,
  XCircle,
  User,
  Trophy
} from 'lucide-react';

interface ReplayEvent {
  id: string;
  type: 'submission' | 'chat' | 'problem_view' | 'battle_start' | 'battle_end';
  timestamp: number;
  userId: string;
  userName: string;
  data: {
    problemId?: string;
    verdict?: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE';
    message?: string;
    code?: string;
    language?: string;
  };
}

interface ReplayPlayer {
  id: string;
  name: string;
  rating: number;
  color: string;
}

interface EnhancedReplayViewerProps {
  battleId: string;
  events: ReplayEvent[];
  players: ReplayPlayer[];
  duration: number; // in seconds
}

export function EnhancedReplayViewer({
  battleId,
  events,
  players,
  duration
}: EnhancedReplayViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<ReplayEvent | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<ReplayEvent[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Playback control
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + (playbackSpeed * 0.1);
        if (newTime >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, duration]);

  // Update visible events based on current time
  useEffect(() => {
    const eventsUpToNow = events.filter(
      (event) => event.timestamp <= currentTime
    );
    setVisibleEvents(eventsUpToNow);
  }, [currentTime, events]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
    setIsPlaying(false);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
    setIsPlaying(false);
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10));
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleJumpToEvent = (event: ReplayEvent) => {
    setCurrentTime(event.timestamp);
    setSelectedEvent(event);
    setIsPlaying(false);
  };

  const getEventIcon = (type: ReplayEvent['type']) => {
    switch (type) {
      case 'submission':
        return <Code className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'problem_view':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (event: ReplayEvent) => {
    if (event.type === 'submission') {
      if (event.data.verdict === 'AC') return 'text-green-400 bg-green-500/10 border-green-500/30';
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
    if (event.type === 'chat') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const getPlayer = (userId: string) => {
    return players.find(p => p.id === userId);
  };

  return (
    <div className="space-y-4">
      {/* Video/Timeline Display */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-6">
          {/* Timeline Visualization */}
          <div className="mb-6">
            <div className="relative h-24 bg-slate-800/50 rounded-lg overflow-hidden" ref={timelineRef}>
              {/* Event markers */}
              {events.map((event) => {
                const position = (event.timestamp / duration) * 100;
                const player = getPlayer(event.userId);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => handleJumpToEvent(event)}
                    className={`absolute top-0 h-full w-1 cursor-pointer transition-all ${
                      event.type === 'submission' && event.data.verdict === 'AC'
                        ? 'bg-green-500 hover:bg-green-400'
                        : event.type === 'submission'
                        ? 'bg-red-500 hover:bg-red-400'
                        : 'bg-blue-500 hover:bg-blue-400'
                    }`}
                    style={{ left: `${position}%` }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      {getEventIcon(event.type)}
                    </div>
                  </motion.div>
                );
              })}

              {/* Current time indicator */}
              <motion.div
                className="absolute top-0 h-full w-1 bg-white shadow-lg shadow-white/50 z-10"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                  {formatTime(currentTime)}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="space-y-4">
            {/* Seek Bar */}
            <Slider
              value={[currentTime]}
              min={0}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  <Rewind className="h-4 w-4" />
                </Button>

                <Button
                  onClick={handleSkipBack}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  onClick={handlePlayPause}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </Button>

                <Button
                  onClick={handleSkipForward}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                <Button
                  onClick={() => setCurrentTime(duration)}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  <FastForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {/* Playback Speed */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Speed:</span>
                  <div className="flex gap-1">
                    {[0.5, 1, 2, 4].map((speed) => (
                      <Button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        variant={playbackSpeed === speed ? 'default' : 'outline'}
                        size="sm"
                        className={
                          playbackSpeed === speed
                            ? 'bg-blue-600'
                            : 'border-slate-600 text-slate-400'
                        }
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Display */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="font-mono text-sm text-blue-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Event Feed */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Trophy className="h-5 w-5" />
                Event Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {visibleEvents.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Press play to watch the replay</p>
                    </div>
                  ) : (
                    visibleEvents.map((event, index) => {
                      const player = getPlayer(event.userId);
                      
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedEvent(event)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${getEventColor(event)} ${
                            selectedEvent?.id === event.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                              style={{ backgroundColor: player?.color || '#64748b' }}
                            >
                              {player?.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{player?.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {formatTime(event.timestamp)}
                                </Badge>
                              </div>
                              
                              <div className="text-sm">
                                {event.type === 'submission' && (
                                  <div className="flex items-center gap-2">
                                    {event.data.verdict === 'AC' ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span>
                                      Submitted Problem {event.data.problemId} -{' '}
                                      <span className={event.data.verdict === 'AC' ? 'text-green-400' : 'text-red-400'}>
                                        {event.data.verdict}
                                      </span>
                                    </span>
                                  </div>
                                )}
                                
                                {event.type === 'chat' && (
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-blue-400" />
                                    <span className="text-slate-300">{event.data.message}</span>
                                  </div>
                                )}
                                
                                {event.type === 'problem_view' && (
                                  <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-purple-400" />
                                    <span>Viewing Problem {event.data.problemId}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Player Stats & Code View */}
        <div className="space-y-4">
          {/* Players */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <User className="h-5 w-5" />
                Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{player.name}</div>
                      <div className="text-xs text-slate-400">Rating: {player.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Event Details */}
          {selectedEvent && selectedEvent.data.code && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Code className="h-5 w-5" />
                  Code Submission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedEvent.data.language}
                    </Badge>
                    <Badge
                      className={
                        selectedEvent.data.verdict === 'AC'
                          ? 'bg-green-600'
                          : 'bg-red-600'
                      }
                    >
                      {selectedEvent.data.verdict}
                    </Badge>
                  </div>
                  <ScrollArea className="h-64">
                    <pre className="text-xs bg-slate-950 p-4 rounded-lg overflow-x-auto">
                      <code className="text-slate-300">{selectedEvent.data.code}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
