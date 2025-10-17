// Battle room page for active battles

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RealTimeNotificationManager } from "@/lib/realtime-notifications";
import { 
  Sword, 
  Users, 
  Trophy, 
  Clock, 
  Zap,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  Code,
  Terminal,
  Crown,
  Timer,
  Eye,
  EyeOff,
  User,
  Send,
  MessageCircle,
  Menu,
  X
} from "lucide-react";

export default function BattleRoomPage({ params }: { params: { id: string } }) {
  const battleId = params.id;
  const [battle, setBattle] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [userRole, setUserRole] = useState<'host' | 'guest' | 'spectator'>('spectator');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [opponentStatus, setOpponentStatus] = useState('waiting'); // waiting, coding, submitted
  const [spectators, setSpectators] = useState<any[]>([]);
  const [isSpectator, setIsSpectator] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // code, chat, info
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Fetch battle details and set up real-time listeners
  useEffect(() => {
    fetchBattleDetails();
    fetchChatMessages();
    setupRealTimeListeners();
    
    // Clean up
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Clean up Supabase channel
      if (supabase) {
        const channels = supabase.getChannels();
        channels.forEach((channel: any) => {
          if (channel.topic?.includes(`battle:${battleId}`)) {
            supabase.removeChannel(channel);
          }
        });
      }
    };
  }, [battleId]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchBattleDetails = async () => {
    try {
      const response = await fetch(`/api/battles/${battleId}`);
      const result = await response.json();
      
      if (result.battle) {
        setBattle(result.battle);
        
        // Set submissions
        setSubmissions(result.battle.battle_submissions || []);
        
        // Find current round
        const rounds = result.battle.battle_rounds || [];
        const current = rounds.find((r: any) => !r.ended_at) || rounds[rounds.length - 1];
        setCurrentRound(current);
        
        // Set timer if round is active
        if (current && !current.ended_at) {
          const duration = current.duration_seconds || 3600;
          setTimeLeft(duration);
          
          // Start timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        
        // Check if user is a spectator
        // This would be determined by checking the battle_spectators table
        // For now, we'll set a default
        setIsSpectator(false);
      }
    } catch (error) {
      console.error('Error fetching battle details:', error);
      toast({
        title: "Error",
        description: "Failed to load battle details",
        variant: "destructive",
      });
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await fetch(`/api/battles/${battleId}/chat`);
      const result = await response.json();
      
      if (result.messages) {
        setChatMessages(result.messages);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const setupRealTimeListeners = () => {
    // Set up Supabase real-time listeners for battle updates
    const channel = supabase.channel(`battle:${battleId}`);
    
    // Listen for battle updates
    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'battles',
          filter: `id=eq.${battleId}`
        },
        (payload: any) => {
          console.log('Battle updated:', payload);
          // Update battle state
          setBattle((prev: any) => ({
            ...prev,
            ...payload.new
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_rounds',
          filter: `battle_id=eq.${battleId}`
        },
        (payload: any) => {
          console.log('New round created:', payload);
          // Update rounds
          setBattle((prev: any) => ({
            ...prev,
            battle_rounds: [...(prev.battle_rounds || []), payload.new]
          }));
          
          // Set current round if it's the first one
          if (!currentRound) {
            setCurrentRound(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'battle_rounds',
          filter: `battle_id=eq.${battleId}`
        },
        (payload: any) => {
          console.log('Round updated:', payload);
          // Update specific round
          setBattle((prev: any) => ({
            ...prev,
            battle_rounds: (prev.battle_rounds || []).map((round: any) => 
              round.id === payload.new.id ? payload.new : round
            )
          }));
          
          // Update current round if it's the one being updated
          if (currentRound && currentRound.id === payload.new.id) {
            setCurrentRound(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_submissions',
          filter: `battle_id=eq.${battleId}`
        },
        (payload: any) => {
          console.log('New submission:', payload);
          // Update submissions
          setBattle((prev: any) => ({
            ...prev,
            battle_submissions: [...(prev.battle_submissions || []), payload.new]
          }));
          setSubmissions((prev: any[]) => [...prev, payload.new]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'battle_submissions',
          filter: `battle_id=eq.${battleId}`
        },
        (payload: any) => {
          console.log('Submission updated:', payload);
          // Update specific submission
          setBattle((prev: any) => ({
            ...prev,
            battle_submissions: (prev.battle_submissions || []).map((submission: any) => 
              submission.id === payload.new.id ? payload.new : submission
            )
          }));
          setSubmissions((prev: any[]) => 
            prev.map((submission: any) => 
              submission.id === payload.new.id ? payload.new : submission
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_spectators',
          filter: `battle_id=eq.${battleId}`
        },
        (payload: any) => {
          console.log('New spectator:', payload);
          // Update spectators list
          setSpectators((prev: any[]) => [...prev, payload.new]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'battle_spectators',
          filter: `battle_id=eq.${battleId}`
        },
        (payload: any) => {
          console.log('Spectator left:', payload);
          // Update spectators list
          setSpectators((prev: any[]) => prev.filter((s: any) => s.user_id !== payload.old.user_id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_chat',
          filter: `battle_id=eq.${battleId}`
        },
        (payload: any) => {
          console.log('New chat message:', payload);
          // Update chat messages
          setChatMessages((prev: any[]) => [...prev, payload.new]);
        }
      )
      .subscribe();
  };

  const joinAsSpectator = async () => {
    try {
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'spectate',
          battleId
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Spectator Mode",
          description: "You are now spectating this battle",
        });
        setIsSpectator(true);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error joining as spectator:', error);
      toast({
        title: "Error",
        description: "Failed to join as spectator",
        variant: "destructive",
      });
    }
  };

  const leaveSpectatorMode = async () => {
    try {
      // This would be implemented in a separate API endpoint
      toast({
        title: "Spectator Mode",
        description: "You have left spectator mode",
      });
      setIsSpectator(false);
    } catch (error) {
      console.error('Error leaving spectator mode:', error);
      toast({
        title: "Error",
        description: "Failed to leave spectator mode",
        variant: "destructive",
      });
    }
  };

  const toggleBattleVisibility = async (isPublic: boolean) => {
    try {
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set_visibility',
          battleId,
          isPublic
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Battle Visibility",
          description: `Battle is now ${isPublic ? 'public' : 'private'}`,
        });
        // Update battle state
        setBattle((prev: any) => ({
          ...prev,
          is_public: isPublic
        }));
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling battle visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update battle visibility",
        variant: "destructive",
      });
    }
  };

  const startBattle = async () => {
    try {
      const response = await fetch(`/api/battles/${battleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Battle Started",
          description: "The battle has begun! Good luck!",
        });
        fetchBattleDetails();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting battle:', error);
      toast({
        title: "Error",
        description: "Failed to start battle",
        variant: "destructive",
      });
    }
  };

  const submitSolution = async () => {
    if (!currentRound || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/battles/${battleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundId: currentRound.id,
          codeText: code,
          language,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Solution Submitted",
          description: "Your solution has been submitted for judging.",
        });
        setCode('');
        setOpponentStatus('submitted');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast({
        title: "Error",
        description: "Failed to submit solution",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSendingMessage(true);
    
    try {
      const response = await fetch(`/api/battles/${battleId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim()
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNewMessage('');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getParticipant = (userId: string) => {
    return battle?.battle_participants?.find((p: any) => p.user_id === userId);
  };

  const getOpponent = () => {
    return null; // Simplified for now
  };

  const getUserParticipant = () => {
    return null; // Simplified for now
  };

  const opponent = getOpponent();
  const userParticipant = getUserParticipant();

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
      case 'compilation_error':
        return <Badge variant="destructive">Compilation Error</Badge>;
      case 'runtime_error':
        return <Badge variant="destructive">Runtime Error</Badge>;
      case 'time_limit_exceeded':
        return <Badge variant="destructive">Time Limit Exceeded</Badge>;
      case 'memory_limit_exceeded':
        return <Badge variant="destructive">Memory Limit Exceeded</Badge>;
      case 'wrong_answer':
        return <Badge variant="destructive">Wrong Answer</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'compiling':
        return <Badge variant="secondary">Compiling</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatChatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!battle) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sword className="h-6 w-6 text-blue-500" />
            Battle Arena
          </h1>
          <p className="text-muted-foreground">
            {battle.format.replace('_', ' ').toUpperCase()} Battle
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={
            battle.status === 'completed' ? 'default' : 
            battle.status === 'in_progress' ? 'secondary' : 'outline'
          }>
            {battle.status.replace('_', ' ')}
          </Badge>
          
          {userRole === 'host' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toggleBattleVisibility(!battle.is_public)}
            >
              {battle.is_public ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Make Private</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Make Public</span>
                </>
              )}
            </Button>
          )}
          
          {isSpectator ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={leaveSpectatorMode}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Leave Spectator</span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={joinAsSpectator}
            >
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Spectate</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Info</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Participants and info (hidden on mobile when not active) */}
        <div className={`${activeTab !== 'info' ? 'hidden lg:block' : ''} space-y-6`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
                    H
                  </div>
                  <div>
                    <div className="font-medium">
                      Host Player
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rating: {getParticipant(battle.host_user_id)?.rating_before || 1200}
                    </div>
                  </div>
                </div>
                {battle.winner_user_id === battle.host_user_id && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-8 h-8 flex items-center justify-center">
                    G
                  </div>
                  <div>
                    <div className="font-medium">
                      Guest Player
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rating: {getParticipant(battle.guest_user_id)?.rating_before || 1200}
                    </div>
                  </div>
                </div>
                {battle.winner_user_id === battle.guest_user_id && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </CardContent>
          </Card>
          
          {currentRound && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Current Round
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Round:</span>
                  <Badge>{currentRound.round_number}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Problem:</span>
                  <span className="font-medium">{currentRound.title}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Rating:</span>
                  <Badge variant="secondary">{currentRound.rating}</Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span>Time Left:</span>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span className={`font-mono ${timeLeft < 300 ? 'text-red-500' : ''}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Spectators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Spectators ({spectators.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {spectators.length === 0 ? (
                <p className="text-muted-foreground text-sm">No spectators yet</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {spectators.map((spectator: any) => (
                    <div key={spectator.user_id} className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {spectator.users?.email?.split('@')[0] || 'Anonymous'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Submissions history */}
          {submissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-60 overflow-y-auto">
                {submissions.map((submission: any) => (
                  <div key={submission.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">
                        {new Date(submission.submitted_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSubmissionStatusBadge(submission.status)}
                      {submission.execution_time_ms && (
                        <span className="text-xs text-muted-foreground">
                          {submission.execution_time_ms}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Center column - Code editor (hidden on mobile when not active) */}
        <div className={`${activeTab !== 'code' ? 'hidden lg:block' : ''} lg:col-span-2 space-y-6`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Editor
              </CardTitle>
              <CardDescription>
                Write and submit your solution for the current problem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">
                    {currentRound?.title || 'Problem Title'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Rating: {currentRound?.rating || 1200}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="language">Language:</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32">
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
              </div>
              
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Write your ${language} solution here\n// Implement the solution for ${currentRound?.title || 'the problem'}\n\n`}
                className="min-h-[300px] sm:min-h-[400px] font-mono"
                disabled={battle.status !== 'in_progress' || isSubmitting || isSpectator}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {opponentStatus === 'submitted' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span className="hidden sm:inline">Opponent Submitted</span>
                    </Badge>
                  )}
                </div>
                
                {!isSpectator && (
                  <Button 
                    onClick={submitSolution} 
                    disabled={
                      battle.status !== 'in_progress' || 
                      isSubmitting || 
                      !code.trim() ||
                      !!currentRound?.winner_user_id
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Submit Solution</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Submission status */}
          {currentRound?.winner_user_id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentRound.winner_user_id === 'user' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Round Won!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      Round Lost
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {currentRound.winner_user_id === 'user' 
                    ? "Congratulations! You won this round." 
                    : "Your opponent won this round."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right column - Chat (hidden on mobile when not active) */}
        <div className={`${activeTab !== 'chat' ? 'hidden lg:block' : ''} space-y-6`}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Battle Chat
              </CardTitle>
              <CardDescription>
                Chat with participants and spectators
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4 max-h-[400px]" ref={chatScrollRef}>
                <div className="space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Be the first to send a message!</p>
                    </div>
                  ) : (
                    chatMessages.map((message: any) => (
                      <div key={message.id} className="group">
                        <div className="flex items-start gap-2">
                          <div className="bg-muted rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-xs font-medium">
                              {message.users?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium text-sm">
                                {message.users?.email?.split('@')[0] || 'Anonymous'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatChatTime(message.created_at)}
                              </span>
                            </div>
                            <p className="text-sm mt-1 break-words">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <div className="mt-4 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={isSendingMessage}
                />
                <Button 
                  onClick={sendMessage} 
                  size="icon"
                  disabled={!newMessage.trim() || isSendingMessage}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}