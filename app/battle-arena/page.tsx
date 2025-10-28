<<<<<<< HEAD
// Battle Arena main page

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RealTimeNotificationManager } from "@/lib/realtime-notifications";
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
  X
} from "lucide-react";

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
      // For now, we'll simulate the data
      setQueueStatus({
        totalPlayers: Math.floor(Math.random() * 10),
        averageWaitTime: Math.floor(Math.random() * 120),
        formatDistribution: { 
          best_of_1: Math.floor(Math.random() * 5), 
          best_of_3: Math.floor(Math.random() * 7), 
          best_of_5: Math.floor(Math.random() * 3) 
        }
      });
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const fetchUserBattles = async () => {
    try {
      // In a real implementation, this would fetch from the battles table
      // For now, we'll use mock data
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

  return (
    <div className="container py-8">
      {/* Mobile menu button */}
      <div className="lg:hidden mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sword className="h-6 w-6 text-blue-500" />
          Code Battle Arena
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mb-6 p-4 bg-card border rounded-lg">
          <div className="flex flex-col gap-4">
            <Button 
              variant={activeTab === "queue" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("queue");
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <Play className="h-4 w-4 mr-2" />
              Join Queue
            </Button>
            <Button 
              variant={activeTab === "private" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("private");
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Private Battle
            </Button>
            <Button 
              variant={activeTab === "history" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("history");
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <Clock className="h-4 w-4 mr-2" />
              Battle History
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                router.push('/battle-arena/leaderboard');
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold hidden lg:flex items-center gap-2">
            <Sword className="h-8 w-8 text-blue-500" />
            Code Battle Arena
          </h1>
          <p className="text-muted-foreground">
            Compete in real-time coding duels against other programmers
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={() => router.push('/battle-arena/leaderboard')} className="w-full sm:w-auto">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </Button>
          
          <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{userRating}</div>
              <div className={`text-sm ${tier.color}`}>{tier.label}</div>
            </div>
            <Separator orientation="vertical" className="h-12 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-medium hidden sm:block">Battle Rating</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 hidden lg:grid">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Join Queue
          </TabsTrigger>
          <TabsTrigger value="private" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Private Battle
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Battle History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Match
                </CardTitle>
                <CardDescription>
                  Join the matchmaking queue for an instant battle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => joinQueue('best_of_1')}
                    disabled={isLoading}
                    className="h-20 flex flex-col gap-2"
                  >
                    <Sword className="h-6 w-6" />
                    <span>Best of 1</span>
                    <Badge variant="secondary" className="text-xs">
                      Quick
                    </Badge>
                  </Button>
                  
                  <Button 
                    onClick={() => joinQueue('best_of_3')}
                    disabled={isLoading}
                    className="h-20 flex flex-col gap-2"
                  >
                    <Sword className="h-6 w-6" />
                    <span>Best of 3</span>
                    <Badge variant="secondary" className="text-xs">
                      Standard
                    </Badge>
                  </Button>
                  
                  <Button 
                    onClick={() => joinQueue('best_of_5')}
                    disabled={isLoading}
                    className="h-20 flex flex-col gap-2"
                  >
                    <Sword className="h-6 w-6" />
                    <span>Best of 5</span>
                    <Badge variant="secondary" className="text-xs">
                      Epic
                    </Badge>
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => joinQueue('best_of_3')} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Joining Queue..." : "Join Queue (Best of 3)"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Queue Status
                </CardTitle>
                <CardDescription>
                  Current matchmaking statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Players in queue:</span>
                  <span className="font-bold">{queueStatus.totalPlayers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Average wait time:</span>
                  <span className="font-bold">{formatTime(queueStatus.averageWaitTime)}</span>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Format Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sword className="h-4 w-4" />
                        Best of 1
                      </span>
                      <Badge>{queueStatus.formatDistribution.best_of_1}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sword className="h-4 w-4" />
                        Best of 3
                      </span>
                      <Badge>{queueStatus.formatDistribution.best_of_3}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sword className="h-4 w-4" />
                        Best of 5
                      </span>
                      <Badge>{queueStatus.formatDistribution.best_of_5}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="private" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Private Battle
              </CardTitle>
              <CardDescription>
                Challenge a friend to a private coding duel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-muted rounded-full p-4 mb-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Invite Friends</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Create a private battle and share the link with your friends to challenge them.
                </p>
                <Button onClick={createPrivateBattle} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Private Battle
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Battle History
              </CardTitle>
              <CardDescription>
                Your recent battles and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userBattles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-muted rounded-full p-4 mb-4">
                    <Sword className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Battles Yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    You haven't participated in any battles. Join the queue to get started!
                  </p>
                  <Button onClick={() => setActiveTab("queue")}>
                    Join Queue
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBattles.map((battle) => (
                    <div 
                      key={battle.id} 
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => viewBattle(battle.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Sword className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {battle.format.replace('_', ' ').toUpperCase()} Battle
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(battle.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={
                              battle.status === 'completed' ? 'default' : 
                              battle.status === 'in_progress' ? 'secondary' : 'outline'
                            }
                          >
                            {battle.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            2 participants
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {battle.battle_rounds?.length || 0} rounds
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
=======
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sword,
  Users,
  Trophy,
  History,
  Zap,
  Flame,
  Crown,
  ArrowRight,
  Sparkles,
  Clock,
  Users2,
} from 'lucide-react';
import { motion } from 'framer-motion';
export default function BattleArenaPage() {
  const [selectedMode, setSelectedMode] = useState<'1v1' | '3v3' | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const BattleCard = ({
    icon: Icon,
    title,
    description,
    stats,
    href,
    gradient,
    accentColor,
    id,
  }: any) => (
    <motion.div
      variants={itemVariants}
      onHoverStart={() => setHoveredCard(id)}
      onHoverEnd={() => setHoveredCard(null)}
    >
      <Link href={href}>
        <motion.div
          className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 cursor-pointer group h-full`}
          style={{
            background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
            borderColor: accentColor,
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: `0 20px 40px ${accentColor}40`,
          }}
        >
          <motion.div
            className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accentColor}20, transparent 80%)`,
            }}
          />

          <div className='relative p-6 md:p-8 h-full flex flex-col'>
            {/* Header with icon */}
            <div className='flex items-start justify-between mb-6'>
              <motion.div
                animate={
                  hoveredCard === id
                    ? { scale: 1.1, rotate: 5 }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-xl ${accentColor} bg-opacity-20`}
              >
                <Icon className='w-6 h-6' style={{ color: accentColor }} />
              </motion.div>
              <motion.div
                animate={hoveredCard === id ? { x: 5 } : { x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight
                  className='w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity'
                  style={{ color: accentColor }}
                />
              </motion.div>
            </div>

            {/* Title and description */}
            <div className='mb-6 flex-grow'>
              <h3 className='text-2xl md:text-3xl font-bold text-white mb-2'>
                {title}
              </h3>
              <p className='text-sm md:text-base opacity-90 text-white/80'>
                {description}
              </p>
            </div>

            {/* Stats grid */}
            <div className='grid grid-cols-3 gap-3 mb-6'>
              {stats.map((stat: any, idx: number) => (
                <motion.div
                  key={idx}
                  className='p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20'
                  whileHover={{ scale: 1.05 }}
                >
                  <p className='text-xs opacity-75 text-white/70 mb-1'>
                    {stat.label}
                  </p>
                  <p className='font-semibold text-white text-sm'>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className='w-full font-semibold py-6 text-base rounded-xl text-white border-0 transition-all duration-300'
                style={{ backgroundColor: accentColor }}
              >
                Get Started
                <motion.div
                  animate={hoveredCard === id ? { x: 5 } : { x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className='w-4 h-4 ml-2' />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8'>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          className='mb-12 text-center'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className='inline-block mb-4'>
            <motion.div
              className='flex items-center justify-center gap-3 mb-4'
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              <Flame className='w-8 h-8 text-orange-500' />
              <h1 className='text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent'>
                Battle Arena
              </h1>
              <Flame className='w-8 h-8 text-orange-500' />
            </motion.div>
          </div>
          <p className='text-lg text-blue-200 max-w-2xl mx-auto mb-2'>
            Compete in real-time duels or team battles. Climb the leaderboards
            and prove your algorithmic mastery.
          </p>
          <motion.div
            className='flex items-center justify-center gap-2 text-sm text-blue-300/70'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <Sparkles className='w-4 h-4' />
            <span>Choose your battle mode below</span>
          </motion.div>
        </motion.div>

        <Tabs defaultValue='quick-play' className='w-full'>
          <TabsList className='grid w-full grid-cols-4 bg-slate-900/50 border border-blue-500/20 rounded-xl p-1 mb-8 gap-1'>
            <TabsTrigger
              value='quick-play'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 rounded-lg transition-all duration-300'
            >
              <Sword className='w-4 h-4 mr-2' />
              Quick Play
            </TabsTrigger>
            <TabsTrigger
              value='team-battles'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-lg transition-all duration-300'
            >
              <Users className='w-4 h-4 mr-2' />
              Team Battles
            </TabsTrigger>
            <TabsTrigger
              value='leaderboards'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 rounded-lg transition-all duration-300'
            >
              <Trophy className='w-4 h-4 mr-2' />
              Leaderboards
            </TabsTrigger>
            <TabsTrigger
              value='history'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-lg transition-all duration-300'
            >
              <History className='w-4 h-4 mr-2' />
              History
            </TabsTrigger>
          </TabsList>

          {/* Quick Play Tab */}
          <TabsContent value='quick-play' className='space-y-4'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-4'
            >
              <BattleCard
                id='1v1'
                icon={Sword}
                title='1v1 Duels'
                description='Fast-paced head-to-head battles where speed and accuracy matter'
                stats={[
                  { label: 'Format', value: 'Best of 1 or 3' },
                  { label: 'Scoring', value: 'Fastest AC' },
                  { label: 'Reward', value: 'ELO Points' },
                ]}
                href='/battle-arena/queue/1v1'
                gradient={[
                  'rgba(59, 130, 246, 0.2)',
                  'rgba(34, 211, 238, 0.2)',
                ]}
                accentColor='#3b82f6'
              />
            </motion.div>
          </TabsContent>

          {/* Team Battles Tab */}
          <TabsContent value='team-battles' className='space-y-4'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-4'
            >
              <BattleCard
                id='3v3'
                icon={Users}
                title='3v3 ICPC-Style Battles'
                description='Collaborative team competitions with strategic problem-solving'
                stats={[
                  { label: 'Team Size', value: 'Exactly 3' },
                  { label: 'Scoring', value: 'ICPC Rules' },
                  { label: 'Duration', value: '60 Minutes' },
                ]}
                href='/battle-arena/team/create'
                gradient={[
                  'rgba(168, 85, 247, 0.2)',
                  'rgba(236, 72, 153, 0.2)',
                ]}
                accentColor='#a855f7'
              />
            </motion.div>
          </TabsContent>

          {/* Leaderboards Tab */}
          <TabsContent value='leaderboards' className='space-y-4'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='grid grid-cols-1 md:grid-cols-2 gap-4'
            >
              <BattleCard
                id='1v1-lb'
                icon={Trophy}
                title='1v1 Rankings'
                description='Top individual competitors and their ELO ratings'
                stats={[
                  { label: 'Players', value: 'Ranked' },
                  { label: 'Rating', value: 'ELO Based' },
                  { label: 'Updated', value: 'Real-time' },
                ]}
                href='/battle-arena/leaderboards/1v1'
                gradient={['rgba(234, 179, 8, 0.2)', 'rgba(249, 115, 22, 0.2)']}
                accentColor='#eab308'
              />
              <BattleCard
                id='3v3-lb'
                icon={Users2}
                title='3v3 Rankings'
                description='Top teams and their collective performance metrics'
                stats={[
                  { label: 'Teams', value: 'Ranked' },
                  { label: 'Rating', value: 'Team ELO' },
                  { label: 'Updated', value: 'Real-time' },
                ]}
                href='/battle-arena/leaderboards/3v3'
                gradient={['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.2)']}
                accentColor='#f97316'
              />
            </motion.div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value='history' className='space-y-4'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-4'
            >
              <BattleCard
                id='history'
                icon={History}
                title='Battle History'
                description='Review your past battles, statistics, and performance trends'
                stats={[
                  { label: 'Battles', value: 'All Time' },
                  { label: 'Stats', value: 'Detailed' },
                  { label: 'Trends', value: 'Analytics' },
                ]}
                href='/battle-arena/history'
                gradient={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)']}
                accentColor='#22c55e'
              />
            </motion.div>
          </TabsContent>
        </Tabs>
        <motion.div
          className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-4'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div
            variants={itemVariants}
            className='p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20 backdrop-blur-sm'
          >
            <div className='flex items-center gap-3 mb-2'>
              <Zap className='w-5 h-5 text-blue-400' />
              <p className='text-sm text-blue-300/70'>Live Matchmaking</p>
            </div>
            <p className='text-base text-blue-200'>Realtime rooms powered by Supabase</p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className='p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 backdrop-blur-sm'
          >
            <div className='flex items-center gap-3 mb-2'>
              <Clock className='w-5 h-5 text-purple-400' />
              <p className='text-sm text-purple-300/70'>Seamless Experience</p>
            </div>
            <p className='text-base text-purple-200'>Smooth animations and modern UI theme</p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className='p-6 rounded-xl bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/20 backdrop-blur-sm'
          >
            <div className='flex items-center gap-3 mb-2'>
              <Crown className='w-5 h-5 text-yellow-400' />
              <p className='text-sm text-yellow-300/70'>Private Beta</p>
            </div>
            <p className='text-base text-yellow-200'>No placeholder stats shown during beta</p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
>>>>>>> upstream/main
