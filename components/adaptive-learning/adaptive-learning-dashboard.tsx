'use client';

/**
 * Adaptive Learning Dashboard
 * Main dashboard showing skill profile, recommendations, learning paths, and reviews
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Trophy, 
  Zap, 
  BookOpen,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface SkillProfile {
  current_skill_level: number;
  problems_per_week: number;
  avg_solve_time_seconds?: number;
  improvement_rate: number;
  total_problems_attempted: number;
  total_problems_solved: number;
  overall_success_rate: number;
  current_streak: number;
  weak_topics: string[];
  strong_topics: string[];
}

interface RecommendedProblem {
  problem_id: string;
  problem_title: string;
  problem_url?: string;
  rating: number;
  tags: string[];
  recommendation_reason: string;
  priority_score: number;
  category: 'skill_level' | 'weak_topic' | 'exploratory' | 'spaced_repetition';
}

interface LearningPathProgress {
  path: {
    id: string;
    name: string;
    description: string;
    level_number: number;
  };
  problems_completed: number;
  total_problems: number;
  completion_percentage: number;
  status: string;
}

interface DueReview {
  problem: {
    problem_id: string;
    problem_title: string;
    problem_url?: string;
    rating?: number;
    review_count: number;
  };
  daysOverdue: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export function AdaptiveLearningDashboard() {
  const [loading, setLoading] = useState(true);
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedProblem[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPathProgress[]>([]);
  const [dueReviews, setDueReviews] = useState<DueReview[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load metrics
      const metricsRes = await fetch('/api/adaptive-learning/metrics');
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setSkillProfile(data.skillProfile);
      }

      // Load recommendations
      const recRes = await fetch('/api/adaptive-learning/recommendations');
      if (recRes.ok) {
        const data = await recRes.json();
        setRecommendations(data.recommendations || []);
      }

      // Load learning paths
      const pathsRes = await fetch('/api/adaptive-learning/learning-paths?overview=true');
      if (pathsRes.ok) {
        const data = await pathsRes.json();
        setLearningPaths(data.allPaths || []);
      }

      // Load due reviews
      const reviewsRes = await fetch('/api/adaptive-learning/spaced-repetition');
      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setDueReviews(data.dueReviews || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/adaptive-learning/recommendations?refresh=true');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            Adaptive Learning Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized learning powered by AI
          </p>
        </div>
      </div>

      {/* Skill Profile Overview */}
      {skillProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Skill Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skillProfile.current_skill_level}</div>
              {skillProfile.improvement_rate !== 0 && (
                <p className={`text-xs ${skillProfile.improvement_rate > 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1 mt-1`}>
                  <TrendingUp className="h-3 w-3" />
                  {skillProfile.improvement_rate > 0 ? '+' : ''}{skillProfile.improvement_rate.toFixed(1)}%
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(skillProfile.overall_success_rate * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {skillProfile.total_problems_solved} / {skillProfile.total_problems_attempted} solved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skillProfile.problems_per_week}</div>
              <p className="text-xs text-muted-foreground mt-1">problems / week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-500" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skillProfile.current_streak}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Best: {skillProfile.longest_streak}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">
            Recommendations
            {recommendations.length > 0 && (
              <Badge variant="secondary" className="ml-2">{recommendations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="learning-paths">
            Learning Paths
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews
            {dueReviews.length > 0 && (
              <Badge variant="destructive" className="ml-2">{dueReviews.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommended Problems</h2>
            <Button
              onClick={refreshRecommendations}
              disabled={refreshing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No recommendations available. Solve some problems to get personalized suggestions!
                  </p>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((rec) => (
                <RecommendationCard key={rec.problem_id} recommendation={rec} />
              ))
            )}
          </div>
        </TabsContent>

        {/* Learning Paths Tab */}
        <TabsContent value="learning-paths" className="space-y-4">
          <h2 className="text-xl font-semibold">Your Learning Journey</h2>
          
          <div className="grid gap-4">
            {learningPaths.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Start your learning journey by solving problems!
                  </p>
                </CardContent>
              </Card>
            ) : (
              learningPaths.map((path) => (
                <LearningPathCard key={path.path.id} pathProgress={path} />
              ))
            )}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Spaced Repetition Reviews</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Practice problems you struggled with to improve retention
            </p>
          </div>

          <div className="grid gap-4">
            {dueReviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p className="text-muted-foreground">
                    No reviews due today. Great job! 🎉
                  </p>
                </CardContent>
              </Card>
            ) : (
              dueReviews.map((review) => (
                <ReviewCard key={review.problem.problem_id} review={review} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Weak & Strong Topics */}
      {skillProfile && (skillProfile.weak_topics.length > 0 || skillProfile.strong_topics.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Topic Mastery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillProfile.weak_topics.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 text-red-500">
                  Areas to Improve
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillProfile.weak_topics.map((topic) => (
                    <Badge key={topic} variant="destructive">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}

            {skillProfile.strong_topics.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 text-green-500">
                  Strong Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillProfile.strong_topics.map((topic) => (
                    <Badge key={topic} variant="default" className="bg-green-500">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Recommendation Card Component
function RecommendationCard({ recommendation }: { recommendation: RecommendedProblem }) {
  const categoryColors = {
    skill_level: 'bg-blue-500/20 text-blue-700',
    weak_topic: 'bg-red-500/20 text-red-700',
    exploratory: 'bg-purple-500/20 text-purple-700',
    spaced_repetition: 'bg-yellow-500/20 text-yellow-700',
  };

  const categoryIcons = {
    skill_level: Target,
    weak_topic: Brain,
    exploratory: Zap,
    spaced_repetition: RefreshCw,
  };

  const Icon = categoryIcons[recommendation.category];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              <Link
                href={recommendation.problem_url || '#'}
                target="_blank"
                className="hover:text-purple-500 transition-colors"
              >
                {recommendation.problem_title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {recommendation.recommendation_reason}
            </CardDescription>
          </div>
          <Badge className={categoryColors[recommendation.category]}>
            {recommendation.category.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">Rating: {recommendation.rating}</Badge>
            {recommendation.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <Button asChild size="sm">
            <Link href={recommendation.problem_url || '#'} target="_blank">
              Solve Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Learning Path Card Component
function LearningPathCard({ pathProgress }: { pathProgress: LearningPathProgress }) {
  const statusColors = {
    not_started: 'text-gray-500',
    in_progress: 'text-blue-500',
    completed: 'text-green-500',
    paused: 'text-yellow-500',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {pathProgress.path.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {pathProgress.path.description}
            </CardDescription>
          </div>
          <Badge className={statusColors[pathProgress.status as keyof typeof statusColors]}>
            {pathProgress.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {pathProgress.problems_completed} / {pathProgress.total_problems} problems
            </span>
          </div>
          <Progress value={pathProgress.completion_percentage} className="h-2" />
        </div>
        
        <Button asChild variant="outline" className="w-full">
          <Link href={`/learning-paths/${pathProgress.path.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: DueReview }) {
  const urgencyColors = {
    critical: 'bg-red-500/20 text-red-700 border-red-500',
    high: 'bg-orange-500/20 text-orange-700 border-orange-500',
    medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500',
    low: 'bg-blue-500/20 text-blue-700 border-blue-500',
  };

  return (
    <Card className={`border-l-4 ${urgencyColors[review.urgency]}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              <Link
                href={review.problem.problem_url || '#'}
                target="_blank"
                className="hover:text-purple-500 transition-colors"
              >
                {review.problem.problem_title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1">
              {review.daysOverdue > 0 ? (
                <span className="text-red-500 font-medium">
                  {review.daysOverdue} day{review.daysOverdue !== 1 ? 's' : ''} overdue
                </span>
              ) : (
                'Due today'
              )}
              {' • '}
              Reviewed {review.problem.review_count} time{review.problem.review_count !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Badge variant="outline">{review.urgency} priority</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={review.problem.problem_url || '#'} target="_blank">
            <RefreshCw className="mr-2 h-4 w-4" />
            Review Now
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
