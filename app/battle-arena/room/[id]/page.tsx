'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { SpectatorView } from '@/components/battle-arena/spectator-view';
import dynamic from 'next/dynamic';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Trophy, CheckCircle2, Flag, Code2, Send, Users } from 'lucide-react';
import { useBattleRealtime, useTeamChat, broadcastCodeUpdate } from '@/hooks/use-battle-realtime';
import { CodeEditor } from '@/components/battle-arena/code-editor';
import { ProblemDetails } from '@/components/battle-arena/problem-details';
import { SubmissionsList } from '@/components/battle-arena/submissions-list';
import { motion } from 'framer-motion';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
 main

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
}

export default function BattleRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [spectators, setSpectators] = useState<Player[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock data - in a real implementation, this would come from the backend
  const players: Player[] = [
    {
      id: "1",
      name: "You",
      rating: 1850,
      solved: 2,
      penalty: 32,
      isOnline: true
    },
    {
      id: "2",
      name: "Opponent",
      rating: 1780,
      solved: 1,
      penalty: 25,
      isOnline: true
    }
  ];

  const problems: Problem[] = [
    {
      id: "A",
      name: "A",
      title: "Sum of Two Numbers",
      description: "Given two integers a and b, return their sum.",
      input: "Two integers a and b (1 ≤ a, b ≤ 1000)",
      output: "Print the sum of a and b",
      sampleInput: "3 5",
      sampleOutput: "8",
      timeLimit: 1000,
      memoryLimit: 256,
      solved: 4,
      attempts: 6
    },
    {
      id: "B",
      name: "B",
      title: "Array Rotation",
      description: "Given an array of n integers and a number k, rotate the array to the right by k steps.",
      input: "First line contains two integers n and k. Second line contains n integers.",
      output: "Print the rotated array.",
      sampleInput: "5 2\n1 2 3 4 5",
      sampleOutput: "4 5 1 2 3",
      timeLimit: 2000,
      memoryLimit: 512,
      solved: 2,
      attempts: 5
    }
  ];

  const currentProblem = problems[0];

  // Mock spectators data
  const mockSpectators: Player[] = [
    {
      id: "3",
      name: "Spectator1",
      rating: 1650,
      solved: 0,
      penalty: 0,
      isOnline: true
    },
    {
      id: "4",
      name: "Spectator2",
      rating: 1420,
      solved: 0,
      penalty: 0,
      isOnline: true
    },
    {
      id: "5",
      name: "Spectator3",
      rating: 1980,
      solved: 0,
      penalty: 0,
      isOnline: true
    }
  ];

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

  const handleSubmit = () => {
    const newSubmission: Submission = {
      id: Date.now().toString(),
      playerId: "1",
      problemId: currentProblem.id,
      status: 'pending',
      language,
      time: 0,
      memory: 0,
      timestamp: Date.now()
    };
    
    setSubmissions(prev => [newSubmission, ...prev]);
    
    // Simulate submission processing
    setTimeout(() => {
      setSubmissions(prev => prev.map(sub => 
        sub.id === newSubmission.id 
          ? { ...sub, status: 'accepted', time: 42, memory: 128 } 
          : sub
      ));
    }, 2000);
  };

  const handleChatSend = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: "You",
        content: newMessage,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate opponent response
      setTimeout(() => {
        const responses = [
          "Good luck with that problem!",
          "I'm working on problem B right now",
          "This is a tough one!",
          "How's your solution coming along?"
        ];
        
        const opponentMessage = {
          id: (Date.now() + 1).toString(),
          sender: "Opponent",
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: Date.now()
        };
        
        setChatMessages(prev => [...prev, opponentMessage]);
      }, 3000);
    }
  };

  const toggleSpectatorMode = () => {
    setIsSpectator(!isSpectator);
    setSpectators(mockSpectators);
  };

  // If user is a spectator, show spectator view
  if (isSpectator) {
    return (
      <SpectatorView 
        battleId={params.id}
        players={players}
        problems={problems}
        spectators={mockSpectators}
        isPublic={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-2 md:p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3 md:gap-4">
          <div>
            <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 text-blue-200">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" />
              Battle Room
              <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-300 text-xs md:text-sm">
                1v1 Duel
              </Badge>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Best of 3 - Round 1 of 3
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2 bg-slate-900/50 px-2 md:px-3 py-1 rounded-lg">
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-cyan-400" />
              <span className="font-mono text-sm md:text-base text-blue-200">{formatTime(time)}</span>
            </div>
            
            <Button 
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "destructive" : "default"}
              className="text-xs md:text-sm flex items-center gap-1 md:gap-2 h-8 md:h-10"
            >
              {isRunning ? (
                <>
                  <Square className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">Stop</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">Start</span>
                </>
              )}
            </Button>
            
            <Button 
              onClick={toggleSpectatorMode}
              variant="outline"
              size="icon"
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <Eye className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            
            <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content - Split View - Mobile responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 h-[calc(100vh-140px)] md:h-[calc(100vh-180px)]">
          {/* Left Column - Problem and Editor */}
          <div className="lg:col-span-2 flex flex-col gap-3 md:gap-6">
            {/* Problem/Editor Tabs - Mobile responsive */}
            <Card className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-blue-500/20 backdrop-blur-sm">
              <div className="border-b border-blue-500/20">
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
                      
                      <Separator className="my-6 bg-blue-500/20" />
                      
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
                          <pre className="bg-slate-900/50 p-4 rounded-lg border border-blue-500/20 text-blue-100">
                            {currentProblem.sampleInput}
                          </pre>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-blue-300">Sample Output</h3>
                          <pre className="bg-slate-900/50 p-4 rounded-lg border border-blue-500/20 text-blue-100">
                            {currentProblem.sampleOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                )}
                
                {activeTab === 'editor' && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="w-32 bg-slate-900/50 border-blue-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="c">C</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-blue-500/20">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                        <Button onClick={handleSubmit} className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Run Code
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
                          Submit your solution to see results here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...submissions].reverse().map((submission) => (
                          <motion.div
                            key={submission.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/50 rounded-lg p-4 border border-blue-500/20"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {submission.status === 'accepted' ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : submission.status === 'pending' ? (
                                  <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
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
                currentTime={time} 
                totalDuration={3600}
              />
            </div>
            
            {/* Chat */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-blue-500/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-200">
                  <MessageCircle className="h-5 w-5 text-cyan-400" />
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
                            ? 'bg-blue-500/20 text-blue-100 rounded-br-none' 
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
                <div className="p-4 border-t border-blue-500/20">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSend();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-900/50 border-blue-500/20 min-h-12"
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