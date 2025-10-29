'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
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
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scoreboard } from '@/components/battle-arena/scoreboard';

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
}

interface SpectatorViewProps {
  battleId: string;
  players: Player[];
  problems: Problem[];
  spectators: Player[];
  isPublic: boolean;
}

export function SpectatorView({ 
  battleId, 
  players, 
  problems, 
  spectators,
  isPublic
}: SpectatorViewProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSpectating, setIsSpectating] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock data - in a real implementation, this would come from the backend
  const currentProblem = problems[0];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChatSend = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: "Spectator",
        content: newMessage,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const toggleSpectatorMode = () => {
    setIsSpectating(!isSpectating);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-2 md:p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3 md:gap-4">
          <div>
            <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 text-blue-200">
              <Eye className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
              Spectator View
              <Badge variant="secondary" className="ml-2 bg-cyan-500/20 text-cyan-300 text-xs md:text-sm">
                Live Battle
              </Badge>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Watching {players[0]?.name} vs {players[1]?.name}
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2 bg-slate-900/50 px-2 md:px-3 py-1 rounded-lg">
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-cyan-400" />
              <span className="font-mono text-sm md:text-base text-blue-200">{formatTime(time)}</span>
            </div>
            
            <Button 
              onClick={toggleSpectatorMode}
              variant={isSpectating ? "default" : "outline"}
              className="text-xs md:text-sm flex items-center gap-1 md:gap-2 h-8 md:h-10"
            >
              {isSpectating ? (
                <>
                  <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">Leave</span>
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">Spectate</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content - Split View - Mobile responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 h-[calc(100vh-140px)] md:h-[calc(100vh-180px)]">
          {/* Left Column - Problem and Spectator Info */}
          <div className="lg:col-span-2 flex flex-col gap-3 md:gap-6">
            {/* Problem/Spectator Tabs - Mobile responsive */}
            <Card className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-cyan-500/20 backdrop-blur-sm">
              <div className="border-b border-cyan-500/20">
                <div className="flex overflow-x-auto">
                  <Button
                    variant={activeTab === 'problem' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('problem')}
                    className="rounded-none border-0 text-xs md:text-sm py-2 md:py-3"
                  >
                    Problem
                  </Button>
                  <Button
                    variant={activeTab === 'spectators' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('spectators')}
                    className="rounded-none border-0 text-xs md:text-sm py-2 md:py-3"
                  >
                    Spectators
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
                      
                      <Separator className="my-6 bg-cyan-500/20" />
                      
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
                          <pre className="bg-slate-900/50 p-4 rounded-lg border border-cyan-500/20 text-blue-100">
                            {currentProblem.sampleInput}
                          </pre>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-blue-300">Sample Output</h3>
                          <pre className="bg-slate-900/50 p-4 rounded-lg border border-cyan-500/20 text-blue-100">
                            {currentProblem.sampleOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                )}
                
                {activeTab === 'spectators' && (
                  <ScrollArea className="h-full p-6">
                    <h2 className="text-xl font-bold mb-4 text-blue-200">Spectators ({spectators.length})</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {spectators.map((spectator) => (
                        <div 
                          key={spectator.id} 
                          className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                              {spectator.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm">
                              {spectator.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rating: {spectator.rating}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                currentTime={time} 
                totalDuration={3600}
              />
            </div>
            
            {/* Chat */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-200">
                  <MessageCircle className="h-5 w-5 text-cyan-400" />
                  Spectator Chat
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
                            ? 'bg-cyan-500/20 text-blue-100 rounded-br-none' 
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
                  <div ref={chatEndRef} />
                </ScrollArea>
                <div className="p-4 border-t border-cyan-500/20">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSend();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-900/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-sm min-h-12"
                    />
                    <Button 
                      onClick={handleChatSend}
                      size="icon"
                      className="h-12"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
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