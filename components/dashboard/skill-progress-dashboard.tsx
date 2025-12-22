'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Trophy, 
  Flame, 
  Target, 
  Award,
  Star,
  Zap,
  Brain,
  Code,
  GitBranch,
  Database
} from 'lucide-react';

interface TopicMastery {
  topicSlug: string;
  topicName: string;
  problemsAttempted: number;
  problemsSolved: number;
  masteryPercentage: number;
  lastPracticed: string | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: string;
}

interface SkillStats {
  totalProblemsSolved: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  rank: number | null;
  rating: number;
  topicsCompleted: number;
  achievementsEarned: number;
}

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  'arrays': <Code className="w-4 h-4" />,
  'linked-lists': <GitBranch className="w-4 h-4" />,
  'trees': <GitBranch className="w-4 h-4" />,
  'graphs': <GitBranch className="w-4 h-4" />,
  'dynamic-programming': <Brain className="w-4 h-4" />,
  'sorting': <Database className="w-4 h-4" />,
  'binary-search': <Target className="w-4 h-4" />,
  'default': <Zap className="w-4 h-4" />,
};

const TIER_COLORS = {
  bronze: 'bg-amber-600 text-white',
  silver: 'bg-gray-400 text-white',
  gold: 'bg-yellow-500 text-white',
  platinum: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
};

export function SkillProgressDashboard() {
  const [stats, setStats] = useState<SkillStats | null>(null);
  const [topicMastery, setTopicMastery] = useState<TopicMastery[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For now, we'll use mock data
    const mockStats: SkillStats = {
      totalProblemsSolved: 127,
      currentStreak: 14,
      longestStreak: 28,
      totalPoints: 2450,
      rank: 156,
      rating: 1547,
      topicsCompleted: 5,
      achievementsEarned: 8,
    };

    const mockTopics: TopicMastery[] = [
      { topicSlug: 'arrays', topicName: 'Arrays & Strings', problemsAttempted: 45, problemsSolved: 38, masteryPercentage: 84, lastPracticed: '2024-01-15' },
      { topicSlug: 'binary-search', topicName: 'Binary Search', problemsAttempted: 22, problemsSolved: 18, masteryPercentage: 72, lastPracticed: '2024-01-14' },
      { topicSlug: 'dynamic-programming', topicName: 'Dynamic Programming', problemsAttempted: 30, problemsSolved: 15, masteryPercentage: 45, lastPracticed: '2024-01-13' },
      { topicSlug: 'graphs', topicName: 'Graphs', problemsAttempted: 18, problemsSolved: 12, masteryPercentage: 55, lastPracticed: '2024-01-12' },
      { topicSlug: 'trees', topicName: 'Trees', problemsAttempted: 25, problemsSolved: 20, masteryPercentage: 68, lastPracticed: '2024-01-11' },
    ];

    const mockAchievements: Achievement[] = [
      { id: 'streak_7', name: '7-Day Warrior', description: 'Maintain a 7-day streak', icon: 'flame', tier: 'bronze', earnedAt: '2024-01-10' },
      { id: 'problems_50', name: 'Code Warrior', description: 'Solve 50 problems', icon: 'code', tier: 'silver', earnedAt: '2024-01-08' },
      { id: 'problems_100', name: 'Algorithm Master', description: 'Solve 100 problems', icon: 'code', tier: 'gold', earnedAt: '2024-01-15' },
    ];

    setTimeout(() => {
      setStats(mockStats);
      setTopicMastery(mockTopics);
      setAchievements(mockAchievements);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gradient-to-br from-muted to-muted/50 rounded-xl" />
              ))}
            </div>
            <div className="space-y-3 pt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gradient-to-r from-muted to-muted/50 rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalProblemsSolved}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Problems Solved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg animate-pulse">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.currentStreak}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.rating}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">#{stats?.rank}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Global Rank</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-panel">
          <TabsTrigger value="topics" className="data-[state=active]:bg-primary/10">Topic Mastery</TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-primary/10">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Topic Mastery Progress
              </CardTitle>
              <CardDescription>
                Track your progress across different DSA topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topicMastery.map((topic) => (
                <div key={topic.topicSlug} className="space-y-2 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {TOPIC_ICONS[topic.topicSlug] || TOPIC_ICONS['default']}
                      </div>
                      <span className="font-medium">{topic.topicName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono">{topic.problemsSolved}/{topic.problemsAttempted} solved</span>
                      <Badge 
                        variant={topic.masteryPercentage >= 80 ? 'default' : 'secondary'}
                        className="font-semibold"
                      >
                        {topic.masteryPercentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={topic.masteryPercentage} 
                    className="h-2.5"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500">
                  <Award className="w-5 h-5 text-white" />
                </div>
                Achievements Earned
              </CardTitle>
              <CardDescription>
                {achievements.length} achievements unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="flex items-center gap-3 p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover-lift"
                  >
                    <div className={`p-3 rounded-full ${TIER_COLORS[achievement.tier]} shadow-lg`}>
                      {achievement.icon === 'flame' ? <Flame className="w-5 h-5" /> : 
                       achievement.icon === 'code' ? <Code className="w-5 h-5" /> :
                       <Star className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <Badge variant="outline" className="mt-1 text-xs capitalize">
                        {achievement.tier}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Additional Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-500">{stats?.longestStreak}</p>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{stats?.totalPoints}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{stats?.topicsCompleted}</p>
              <p className="text-xs text-muted-foreground">Topics Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{stats?.achievementsEarned}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SkillProgressDashboard;
