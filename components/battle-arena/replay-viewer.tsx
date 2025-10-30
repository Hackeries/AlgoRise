'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Settings, 
  MessageCircle, 
  Users, 
  Trophy, 
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Crown,
  Flag,
  Rewind,
  FastForward,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scoreboard } from '@/components/battle-arena/scoreboard';
import dynamic from 'next/dynamic';

// Dynamically import the code editor to avoid SSR issues
const CodeEditor = dynamic(() => import('@/components/battle-arena/code-editor'), { 
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-900/50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-blue-200">Loading editor...</p>
      </div>
    </div>
  )
});

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

interface Submission {
  id: string;
  playerId: string;
  problemId: string;
  status: 'pending' | 'accepted' | 'wrong' | 'timeout' | 'compiling';
  language: string;
  time: number;
  memory: number;
  timestamp: number;
  codeText: string;
}

interface ReplayEvent {
  id: string;
  type: 'submission' | 'chat' | 'round_start' | 'round_end' | 'battle_start' | 'battle_end';
  timestamp: number;
  data: any;
}

interface ReplayViewerProps {
  battleId: string;
  players: Player[];
  problems: Problem[];
  events: ReplayEvent[];
}

export function ReplayViewer({ 
  battleId, 
  players, 
  problems,
  events
}: ReplayViewerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('problem');
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get the total duration from the last event
  const totalDuration = events.length > 0 ? events[events.length - 1].timestamp : 3600;

  // Process events as we progress through the replay
  useEffect(() => {
    // Find the event index that corresponds to the current time
    const eventIndex = events.findIndex(event => event.timestamp > currentTime);
    if (eventIndex !== -1 && eventIndex !== currentEventIndex) {
      setCurrentEventIndex(eventIndex);
      
      // Process the event
      const event = events[eventIndex];
      processEvent(event);
    }
  }, [currentTime, events, currentEventIndex]);

  const processEvent = (event: ReplayEvent) => {
    switch (event.type) {
      case 'submission':
        const newSubmission: Submission = {
          id: event.data.id,
          playerId: event.data.playerId,
          problemId: event.data.problemId,
          status: event.data.status,
          language: event.data.language,
          time: event.data.time,
          memory: event.data.memory,
          timestamp: event.data.timestamp,
          codeText: event.data.codeText
        };
        setSubmissions(prev => [newSubmission, ...prev]);
        break;
        
      case 'chat':
        setChatMessages(prev => [...prev, event.data]);
        break;
        
      case 'round_start':
        // Handle round start
        break;
        
      case 'round_end':
        // Handle round end
        break;
        
      default:
        break;
    }
  };

  // Playback controls
  const play = () => {
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const stop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentEventIndex(0);
    setSubmissions([]);
    setChatMessages([]);
  };

  const skipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    const newTime = Math.min(totalDuration, currentTime + 10);
    setCurrentTime(newTime);
  };

  const rewind = () => {
    setPlaybackSpeed(prev => Math.max(0.25, prev / 2));
  };

  const fastForward = () => {
    setPlaybackSpeed(prev => Math.min(4, prev * 2));
  };

  // Timer effect for playback
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + playbackSpeed;
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value);
    setCurrentTime(newTime);
  };

  const currentProblem = problems[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-2 md:p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3 md:gap-4">
          <div>
            <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 text-blue-200">
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" />
              Battle Replay
              <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-300 text-xs md:text-sm">
                {players[0]?.name} vs {players[1]?.name}
              </Badge>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Replay of battle #{battleId}
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2 bg-slate-900/50 px-2 md:px-3 py-1 rounded-lg">
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
              <span className="font-mono text-sm md:text-base text-blue-200">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <Card className="mb-4 md:mb-6 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-yellow-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center justify-center gap-2">
                <Button 
                  onClick={rewind}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Rewind className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={skipBack}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={isPlaying ? pause : play}
                  variant="default"
                  size="icon"
                  className="h-10 w-10"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                
                <Button 
                  onClick={skipForward}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={fastForward}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <FastForward className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={stop}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  value={currentTime}
                  onChange={handleTimelineChange}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Speed:</span>
                <Badge variant="secondary" className="bg-slate-800/50">
                  {playbackSpeed}x
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Split View - Mobile responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 h-[calc(100vh-240px)] md:h-[calc(100vh-280px)]">
          {/* Left Column - Problem and Editor */}
          <div className="lg:col-span-2 flex flex-col gap-3 md:gap-6">
            {/* Problem/Editor Tabs - Mobile responsive */}
            <Card className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-yellow-500/20 backdrop-blur-sm">
              <div className="border-b border-yellow-500/20">
                <div className="flex overflow-x-auto">
                  <Button
                    variant={activeTab === 'problem' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('problem')}
                    className="rounded-none border-0 text-xs md:text-sm py-2 md:py-3"
                  >
                    Problem
                  </Button>
                  <Button
                    variant={activeTab === 'editor' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('editor')}
                    className="rounded-none border-0 text-xs md:text-sm py-2 md:py-3"
                  >
                    Editor
                  </Button>
                  <Button
                    variant={activeTab === 'submissions' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('submissions')}
                    className="rounded-none border-0 text-xs md:text-sm py-2 md:py-3"
                  >
                    Submissions
                  </Button>
                </div>
              </div>
              
              <CardContent className="flex-1 p-0">
                {activeTab === 'problem' && (
                  <ScrollArea className="h-full p-6">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-blue-200">
                            {currentProblem.name}. {currentProblem.title}
                          </h2>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                              {currentProblem.solved} solved
                            </Badge>
                            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                              {currentProblem.timeLimit}ms
                            </Badge>
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                              {currentProblem.memoryLimit}MB
                            </Badge>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-300">
                          Round 1
                        </Badge>
                      </div>
                      
                      <Separator className="my-6 bg-yellow-500/20" />
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-blue-300">Description</h3>
                          <p className="text-blue-100">{currentProblem.description}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-blue-300">Input</h3>
                          <p className="text-blue-100">{currentProblem.input}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-blue-300">Output</h3>
                          <p className="text-blue-100">{currentProblem.output}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-blue-300">Sample Input</h3>
                          <pre className="bg-slate-900/50 p-4 rounded-lg border border-yellow-500/20 text-blue-100">
                            {currentProblem.sampleInput}
                          </pre>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-blue-300">Sample Output</h3>
                          <pre className="bg-slate-900/50 p-4 rounded-lg border border-yellow-500/20 text-blue-100">
                            {currentProblem.sampleOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                )}
                
                {activeTab === 'editor' && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-slate-800/50">
                          {language.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-yellow-500/20">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <CodeEditor 
                        language={language} 
                        value={code} 
                        onChange={setCode}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === 'submissions' && (
                  <ScrollArea className="h-full p-6">
                    <h2 className="text-xl font-bold mb-4 text-blue-200">Submission History</h2>
                    {submissions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="bg-slate-900/50 rounded-full p-4 inline-block mb-4">
                          <Flag className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No submissions yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submissions will appear as the replay progresses
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...submissions].reverse().map((submission) => (
                          <motion.div
                            key={submission.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/50 rounded-lg p-4 border border-yellow-500/20"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {submission.status === 'accepted' ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : submission.status === 'pending' ? (
                                  <div className="h-5 w-5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin"></div>
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <div>
                                  <div className="font-medium">
                                    {submission.status === 'accepted' ? 'Accepted' : 
                                     submission.status === 'pending' ? 'Pending' : 'Wrong Answer'}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(submission.timestamp).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm">
                                  {submission.language.toUpperCase()}
                                </div>
                                {submission.status === 'accepted' && (
                                  <div className="text-xs text-muted-foreground">
                                    {submission.time}ms, {submission.memory}KB
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Scoreboard and Chat */}
          <div className="flex flex-col gap-6">
            {/* Scoreboard */}
            <div className="flex-1">
              <Scoreboard 
                players={players} 
                problems={problems} 
                currentTime={currentTime} 
                totalDuration={totalDuration}
              />
            </div>
            
            {/* Chat */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-yellow-500/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-200">
                  <MessageCircle className="h-5 w-5 text-yellow-400" />
                  Battle Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-64">
                <ScrollArea className="flex-1 p-4">
                  <AnimatePresence>
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-3 ${message.sender === 'You' ? 'text-right' : ''}`}
                      >
                        <div className={`inline-block max-w-xs px-3 py-2 rounded-lg ${
                          message.sender === 'You' 
                            ? 'bg-yellow-500/20 text-blue-100 rounded-br-none' 
                            : 'bg-slate-800/50 text-blue-100 rounded-bl-none'
                        }`}>
                          <div className="font-medium text-xs text-muted-foreground mb-1">
                            {message.sender}
                          </div>
                          <div>{message.content}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}