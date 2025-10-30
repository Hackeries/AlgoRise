'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { RealTimeNotificationManager } from '@/lib/realtime-notifications';
import { 
  Sword, 
  Users, 
  Trophy, 
  Clock, 
  Zap,
  Play,
  Plus,
  Search,
  Crown,
  Star,
  Menu,
  X,
  Flame,
  Sparkles,
  History,
  Users2
} from "lucide-react";
import { motion } from 'framer-motion';

export default function BattleArenaPage() {
  const [activeTab, setActiveTab] = useState("queue");
  const [userRating, setUserRating] = useState(1200);
  const [queueStatus, setQueueStatus] = useState({
    totalPlayers: 0,
    averageWaitTime: 0,
    formatDistribution: { best_of_1: 0, best_of_3: 0, best_of_5: 0 }
  });
  const [userBattles, setUserBattles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  // Fetch user rating and queue status on mount
  useEffect(() => {
    fetchUserRating();
    fetchQueueStatus();
    fetchUserBattles();
    
    // Set up real-time notifications
    const rtManager = RealTimeNotificationManager.getInstance();
    
    // Clean up on unmount
    return () => {
      // Any cleanup if needed
    };
  }, []);

  const fetchUserRating = async () => {
    try {
      // In a real implementation, this would fetch from the battle_ratings table
      // For now, we'll use a default rating
      setUserRating(1200);
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll initialize with empty data
      setQueueStatus({
        totalPlayers: 0,
        averageWaitTime: 0,
        formatDistribution: { 
          best_of_1: 0, 
          best_of_3: 0, 
          best_of_5: 0 
        }
      });
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const fetchUserBattles = async () => {
    try {
      // In a real implementation, this would fetch from the battles table
      // For now, we'll use empty array
      setUserBattles([]);
    } catch (error) {
      console.error('Error fetching user battles:', error);
    }
  };

  const joinQueue = async (format: 'best_of_1' | 'best_of_3' | 'best_of_5' = 'best_of_3') => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'join_queue', format }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Queue Joined",
          description: result.message,
        });
        
        // Refresh queue status
        fetchQueueStatus();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      toast({
        title: "Error",
        description: "Failed to join queue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPrivateBattle = async () => {
    // In a real implementation, this would open a dialog to select opponent
    toast({
      title: "Private Battle",
      description: "Feature coming soon! You'll be able to invite friends to battles.",
    });
  };

  const startPracticeBattle = async () => {
    // In a real implementation, this would start a practice battle with a bot
    toast({
      title: "Practice Battle",
      description: "Starting practice battle with AI opponent...",
    });
    
    // Simulate starting a practice battle
    setTimeout(() => {
      toast({
        title: "Practice Battle Started",
        description: "You're now in a practice battle with an AI opponent.",
      });
    }, 1000);
  };

  const viewBattle = (battleId: string) => {
    router.push(`/battle-arena/${battleId}`);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const tier = getRatingTier(userRating);

  // Battle Card Component for ICPC-style UI
  const BattleCard = ({ 
    icon: Icon, 
    title, 
    description, 
    stats, 
    onClick,
    gradient,
    accentColor
  }: any) => (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
    >
      <Card className="h-full border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg" 
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">{description}</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {stats.map((stat: any, idx: number) => (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-semibold text-sm">{stat.value}</p>
              </div>
            ))}
          </div>
          <Button 
            onClick={onClick}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            Start Battle
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with ICPC styling - Mobile responsive */}
        <motion.div 
          className="mb-6 md:mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Flame className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Code Battle Arena
            </h1>
            <Flame className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
          </div>
          <p className="text-base md:text-lg text-blue-200 max-w-2xl mx-auto px-2">
            Compete in real-time ICPC-style duels. Climb the leaderboards and prove your algorithmic mastery.
          </p>
        </motion.div>

        {/* Rating and Leaderboard Section - Mobile responsive */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 md:mb-8 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Sword className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
              Battle Arena
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Real-time competitive programming battles
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/battle-arena/leaderboard')} 
              className="w-full sm:w-auto text-sm md:text-base border-blue-500/30 hover:bg-blue-500/10"
            >
              <Trophy className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Leaderboard</span>
              <span className="xs:hidden">LB</span>
            </Button>
            
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-blue-500/20 rounded-lg p-3 md:p-4 flex items-center gap-3 md:gap-4 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-blue-400">{userRating}</div>
                <div className={`text-xs md:text-sm ${tier.color}`}>{tier.label}</div>
              </div>
              <Separator orientation="vertical" className="h-10 md:h-12 hidden sm:block bg-blue-500/20" />
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                <span className="font-medium text-xs md:text-sm hidden sm:block text-blue-200">Battle Rating</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile menu for tabs */}
        <div className="lg:hidden mb-4">
          <div className="flex gap-1 bg-slate-900/50 border border-blue-500/20 rounded-lg p-1">
            <Button
              variant={activeTab === "queue" ? "default" : "ghost"}
              onClick={() => setActiveTab("queue")}
              className="flex-1 text-xs py-2 h-auto rounded-md"
            >
              <Play className="h-3 w-3 mr-1" />
              Play
            </Button>
            <Button
              variant={activeTab === "team" ? "default" : "ghost"}
              onClick={() => setActiveTab("team")}
              className="flex-1 text-xs py-2 h-auto rounded-md"
            >
              <Users className="h-3 w-3 mr-1" />
              Teams
            </Button>
            <Button
              variant={activeTab === "practice" ? "default" : "ghost"}
              onClick={() => setActiveTab("practice")}
              className="flex-1 text-xs py-2 h-auto rounded-md"
            >
              <Zap className="h-3 w-3 mr-1" />
              Practice
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              onClick={() => setActiveTab("history")}
              className="flex-1 text-xs py-2 h-auto rounded-md"
            >
              <History className="h-3 w-3 mr-1" />
              History
            </Button>
          </div>
        </div>

        {/* Main Content Tabs - Mobile responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden lg:grid w-full grid-cols-4 bg-slate-900/50 border border-blue-500/20 rounded-xl p-1 mb-6 md:mb-8 gap-1">
            <TabsTrigger 
              value="queue" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 rounded-lg transition-all duration-300"
            >
              <Play className="h-4 w-4 mr-2" />
              Quick Play
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-lg transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Team Battles
            </TabsTrigger>
            <TabsTrigger 
              value="practice" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-lg transition-all duration-300"
            >
              <Zap className="h-4 w-4 mr-2" />
              Practice
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 rounded-lg transition-all duration-300"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Quick Play Tab - Mobile responsive */}
          <TabsContent value="queue" className="mt-4 md:mt-6">
            <motion.div 
              className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <BattleCard
                icon={Sword}
                title="1v1 Duels"
                description="Fast-paced head-to-head battles where speed and accuracy matter"
                stats={[
                  { label: 'Format', value: 'Best of 1/3' },
                  { label: 'Scoring', value: 'Fastest AC' },
                  { label: 'Reward', value: 'ELO Points' },
                ]}
                onClick={() => joinQueue('best_of_3')}
                accentColor="#3b82f6"
              />
              
              <BattleCard
                icon={Users2}
                title="3v3 Teams"
                description="Collaborative team competitions with strategic problem-solving"
                stats={[
                  { label: 'Team Size', value: '3 Players' },
                  { label: 'Scoring', value: 'ICPC Rules' },
                  { label: 'Duration', value: '60 Minutes' },
                ]}
                onClick={() => router.push('/battle-arena/team/create')}
                accentColor="#a855f7"
              />
              
              <BattleCard
                icon={Crown}
                title="Ranked Battles"
                description="Competitive ranked matches that affect your leaderboard position"
                stats={[
                  { label: 'Format', value: 'Best of 3/5' },
                  { label: 'Queue Time', value: '~2 min' },
                  { label: 'Skill Range', value: '±200 ELO' },
                ]}
                onClick={() => joinQueue('best_of_3')}
                accentColor="#f59e0b"
              />
            </motion.div>

            {/* Queue Status Card - Mobile responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                    Queue Status
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Current matchmaking statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 text-center">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Players in queue</p>
                      <p className="text-xl md:text-2xl font-bold text-blue-400">{queueStatus.totalPlayers}</p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 text-center">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Avg. wait time</p>
                      <p className="text-xl md:text-2xl font-bold text-cyan-400">{formatTime(queueStatus.averageWaitTime)}</p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 text-center">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Active Battles</p>
                      <p className="text-xl md:text-2xl font-bold text-purple-400">24</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-blue-500/20" />
                  
                  <div>
                    <h4 className="font-medium mb-3 text-sm md:text-base text-blue-200">Format Distribution</h4>
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <Sword className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                          Best of 1
                        </span>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs md:text-sm">
                          {queueStatus.formatDistribution.best_of_1}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <Sword className="h-3 w-3 md:h-4 md:w-4 text-cyan-400" />
                          Best of 3
                        </span>
                        <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 text-xs md:text-sm">
                          {queueStatus.formatDistribution.best_of_3}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <Sword className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                          Best of 5
                        </span>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs md:text-sm">
                          {queueStatus.formatDistribution.best_of_5}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Team Battles Tab - Mobile responsive */}
          <TabsContent value="team" className="mt-4 md:mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/20 backdrop-blur-sm">
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                    Team Battles
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Create or join a 3v3 ICPC-style team battle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-slate-800/50 rounded-lg p-4 md:p-6">
                      <h3 className="text-base md:text-xl font-semibold mb-2 flex items-center gap-2">
                        <Plus className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                        Create Team
                      </h3>
                      <p className="text-muted-foreground text-xs md:text-sm mb-4">
                        Create a new team and invite your friends to compete in ICPC-style battles.
                      </p>
                      <Button 
                        onClick={() => router.push('/battle-arena/team/create')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-sm md:text-base"
                      >
                        Create Team
                      </Button>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4 md:p-6">
                      <h3 className="text-base md:text-xl font-semibold mb-2 flex items-center gap-2">
                        <Search className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                        Join Team
                      </h3>
                      <p className="text-muted-foreground text-xs md:text-sm mb-4">
                        Join an existing team using an invitation code or search for public teams.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => router.push('/battle-arena/team/join')}
                        className="w-full border-purple-500/30 hover:bg-purple-500/10 text-sm md:text-base"
                      >
                        Join Team
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="bg-purple-500/20" />
                  
                  <div>
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
                      <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                      Featured Teams
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-purple-500/10">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm md:text-base">Team Alpha</h4>
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                              Rank #{item}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <div className="flex -space-x-1">
                              {[1, 2, 3].map((avatar) => (
                                <div key={avatar} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-500/20 border border-purple-500/30" />
                              ))}
                            </div>
                            <span>3 members</span>
                          </div>
                          <Button size="sm" variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10 text-xs md:text-sm">
                            View Team
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Practice Tab - Mobile responsive */}
          <TabsContent value="practice" className="mt-4 md:mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-green-500/20 backdrop-blur-sm">
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                    Practice Battles
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Hone your skills with AI opponents of varying difficulty
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <Card className="bg-slate-800/50 border-green-500/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm md:text-lg flex items-center gap-2">
                          <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                          Easy Bot
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4">
                        <p className="text-muted-foreground text-xs md:text-sm mb-3">
                          Perfect for beginners learning the ropes
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs md:text-sm">
                            <span>Rating:</span>
                            <span className="text-green-400">800-1200</span>
                          </div>
                          <div className="flex justify-between text-xs md:text-sm">
                            <span>Accuracy:</span>
                            <span className="text-green-400">~40%</span>
                          </div>
                        </div>
                        <Button 
                          onClick={startPracticeBattle}
                          className="w-full bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                        >
                          Practice
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-800/50 border-cyan-500/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm md:text-lg flex items-center gap-2">
                          <Zap className="h-3 w-3 md:h-4 md:w-4 text-cyan-400" />
                          Medium Bot
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4">
                        <p className="text-muted-foreground text-xs md:text-sm mb-3">
                          Ideal for intermediate programmers
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs md:text-sm">
                            <span>Rating:</span>
                            <span className="text-cyan-400">1200-1800</span>
                          </div>
                          <div className="flex justify-between text-xs md:text-sm">
                            <span>Accuracy:</span>
                            <span className="text-cyan-400">~60%</span>
                          </div>
                        </div>
                        <Button 
                          onClick={startPracticeBattle}
                          className="w-full bg-cyan-600 hover:bg-cyan-700 text-xs md:text-sm"
                        >
                          Practice
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-800/50 border-purple-500/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm md:text-lg flex items-center gap-2">
                          <Flame className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                          Hard Bot
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4">
                        <p className="text-muted-foreground text-xs md:text-sm mb-3">
                          Challenge for advanced programmers
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs md:text-sm">
                            <span>Rating:</span>
                            <span className="text-purple-400">1800+</span>
                          </div>
                          <div className="flex justify-between text-xs md:text-sm">
                            <span>Accuracy:</span>
                            <span className="text-purple-400">~80%</span>
                          </div>
                        </div>
                        <Button 
                          onClick={startPracticeBattle}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-xs md:text-sm"
                        >
                          Practice
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator className="bg-green-500/20" />
                  
                  <div className="bg-slate-800/50 rounded-lg p-3 md:p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2 text-sm md:text-base">
                      <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
                      Practice Tips
                    </h3>
                    <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                      <li>• Practice battles don't affect your ELO rating</li>
                      <li>• Bots simulate real opponents with varying skill levels</li>
                      <li>• Use practice to test new algorithms and techniques</li>
                      <li>• Review your solutions after each practice battle</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* History Tab - Mobile responsive */}
          <TabsContent value="history" className="mt-4 md:mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-500/20 backdrop-blur-sm">
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <History className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                    Battle History
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Your recent battles and performance statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userBattles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 md:py-12">
                      <div className="bg-slate-800/50 rounded-full p-3 md:p-4 mb-4">
                        <Sword className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold mb-2">No Battles Yet</h3>
                      <p className="text-muted-foreground text-center mb-6 max-w-md text-sm md:text-base">
                        You haven't participated in any battles. Join a queue or start a practice battle to get started!
                      </p>
                      <div className="flex gap-2 md:gap-3">
                        <Button 
                          onClick={() => setActiveTab("queue")}
                          className="text-sm md:text-base"
                        >
                          Join Queue
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("practice")}
                          className="border-yellow-500/30 hover:bg-yellow-500/10 text-sm md:text-base"
                        >
                          Practice
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {userBattles.map((battle) => (
                        <div 
                          key={battle.id} 
                          className="border border-yellow-500/10 rounded-lg p-3 md:p-4 hover:bg-yellow-500/5 cursor-pointer transition-colors"
                          onClick={() => viewBattle(battle.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="bg-yellow-500/10 p-1 md:p-2 rounded-lg">
                                <Sword className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm md:text-base">
                                  {battle.format.replace('_', ' ').toUpperCase()} Battle
                                </h4>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  {new Date(battle.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 md:gap-4">
                              <Badge 
                                variant={
                                  battle.status === 'completed' ? 'default' : 
                                  battle.status === 'in_progress' ? 'secondary' : 'outline'
                                }
                                className="text-xs"
                              >
                                {battle.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mt-2 md:mt-3 flex items-center gap-3 md:gap-4 text-xs md:text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                              <span>
                                2 participants
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                              <span>
                                {battle.battle_rounds?.length || 0} rounds
                              </span>
                            </div>
                            
                            {battle.winner_user_id && (
                              <div className="flex items-center gap-1">
                                <Crown className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                                <span className={battle.winner_user_id === "you" ? "text-green-400" : "text-red-400"}>
                                  {battle.winner_user_id === "you" ? "You won" : "You lost"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}