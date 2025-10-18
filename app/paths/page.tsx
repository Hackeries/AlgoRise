'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronRight,
  Clock,
  Target,
  CheckCircle,
  PlayCircle,
  Loader2,
  Zap,
  Trophy,
  Flame,
  TrendingUp,
  Star,
  Award,
  Sparkles,
  Lock,
  Crown,
  Rocket,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LEARNING_PATH_DATA, getTotalProblems } from '@/lib/learning-path-data';

interface UserProblem {
  problem_id: string;
  solved: boolean;
}

interface GamificationStats {
  totalXP: number;
  currentStreak: number;
  totalBadges: number;
  level: number;
}

export default function LearningPathsPage() {
  const supabase = createClient();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [sectionProgress, setSectionProgress] = useState<
    Record<string, number>
  >({});
  const [subsectionProgress, setSubsectionProgress] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [gamificationStats, setGamificationStats] = useState<GamificationStats>(
    {
      totalXP: 0,
      currentStreak: 0,
      totalBadges: 0,
      level: 1,
    }
  );

  const totalProblems = getTotalProblems();

  useEffect(() => {
    loadAllProgress();
  }, []);

  const loadAllProgress = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const allProblemIds = LEARNING_PATH_DATA.flatMap(section =>
        section.subsections.flatMap(subsection =>
          subsection.problems.map(problem => problem.id)
        )
      );

      const { data: solvedProblems, error } = await supabase
        .from('user_problems')
        .select('problem_id')
        .eq('user_id', user.id)
        .in('problem_id', allProblemIds)
        .eq('solved', true);

      if (error) {
        console.error('Error loading progress:', error);
        setLoading(false);
        return;
      }

      const solvedProblemIds = new Set(
        solvedProblems?.map((p: UserProblem) => p.problem_id) || []
      );
      const solvedCount = solvedProblemIds.size;

      const newSectionProgress: Record<string, number> = {};
      const newSubsectionProgress: Record<string, number> = {};

      LEARNING_PATH_DATA.forEach(section => {
        let sectionSolved = 0;
        let sectionTotal = 0;

        section.subsections.forEach(subsection => {
          const subsectionSolved = subsection.problems.filter(problem =>
            solvedProblemIds.has(problem.id)
          ).length;
          const subsectionTotal = subsection.problems.length;

          const subsectionPercentage =
            subsectionTotal > 0
              ? Math.round((subsectionSolved / subsectionTotal) * 100)
              : 0;

          newSubsectionProgress[`${section.id}-${subsection.id}`] =
            subsectionPercentage;

          sectionSolved += subsectionSolved;
          sectionTotal += subsectionTotal;
        });

        const sectionPercentage =
          sectionTotal > 0
            ? Math.round((sectionSolved / sectionTotal) * 100)
            : 0;

        newSectionProgress[section.id] = sectionPercentage;
      });

      setSectionProgress(newSectionProgress);
      setSubsectionProgress(newSubsectionProgress);

      const xpPerProblem = 10;
      const totalXP = solvedCount * xpPerProblem;
      const level = Math.floor(totalXP / 100) + 1;
      const totalBadges = Math.floor(solvedCount / 5);
      const currentStreak = Math.floor(Math.random() * 7) + 1;

      setGamificationStats({
        totalXP,
        currentStreak,
        totalBadges,
        level,
      });
    } catch (error) {
      console.error('Error in loadAllProgress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionProgress = (sectionId: string): number => {
    return sectionProgress[sectionId] || 0;
  };

  const getSubsectionProgress = (
    sectionId: string,
    subsectionId: string
  ): number => {
    return subsectionProgress[`${sectionId}-${subsectionId}`] || 0;
  };

  const calculateOverallProgress = (): number => {
    const totalSolved = Object.values(sectionProgress).reduce(
      (sum, progress, index) => {
        const section = LEARNING_PATH_DATA[index];
        return sum + Math.round((progress * section.totalProblems) / 100);
      },
      0
    );

    return totalProblems > 0
      ? Math.round((totalSolved / totalProblems) * 100)
      : 0;
  };

  if (loading) {
    return (
      <main className='mx-auto max-w-7xl px-4 py-10'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='flex items-center gap-3'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span>Loading your epic journey...</span>
          </div>
        </div>
      </main>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <main className='mx-auto max-w-7xl px-4 py-10'>
      <div className='mb-12'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <div className='relative'>
                <Rocket className='h-12 w-12 text-amber-500 animate-bounce' />
                <Sparkles className='h-6 w-6 text-yellow-400 absolute -top-1 -right-1' />
              </div>
              <h1 className='text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
                Your CP Journey
              </h1>
            </div>
            <p className='text-lg text-muted-foreground'>
              Master algorithms, earn badges, climb the leaderboard 🚀
            </p>
          </div>
          <div className='text-right'>
            <div className='text-4xl font-black text-amber-500'>
              Level {gamificationStats.level}
            </div>
            <div className='text-sm text-muted-foreground'>
              Elite Programmer
            </div>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-5 mb-8'>
          <Card className='border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:border-blue-500/60 transition-all'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-xs text-muted-foreground font-semibold uppercase tracking-wider'>
                    Total XP
                  </div>
                  <div className='mt-2 text-3xl font-black text-blue-600'>
                    {gamificationStats.totalXP}
                  </div>
                </div>
                <Zap className='h-8 w-8 text-blue-500 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card className='border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5 hover:border-red-500/60 transition-all'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-xs text-muted-foreground font-semibold uppercase tracking-wider'>
                    Streak
                  </div>
                  <div className='mt-2 text-3xl font-black text-red-600'>
                    {gamificationStats.currentStreak}
                  </div>
                </div>
                <Flame className='h-8 w-8 text-red-500 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card className='border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 hover:border-yellow-500/60 transition-all'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-xs text-muted-foreground font-semibold uppercase tracking-wider'>
                    Badges
                  </div>
                  <div className='mt-2 text-3xl font-black text-yellow-600'>
                    {gamificationStats.totalBadges}
                  </div>
                </div>
                <Award className='h-8 w-8 text-yellow-500 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card className='border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:border-green-500/60 transition-all'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-xs text-muted-foreground font-semibold uppercase tracking-wider'>
                    Completed
                  </div>
                  <div className='mt-2 text-3xl font-black text-green-600'>
                    {Math.round((overallProgress * totalProblems) / 100)}
                  </div>
                </div>
                <CheckCircle className='h-8 w-8 text-green-500 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card className='border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:border-purple-500/60 transition-all'>
            <CardContent className='p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-xs text-muted-foreground font-semibold uppercase tracking-wider'>
                    Progress
                  </div>
                  <div className='mt-2 text-3xl font-black text-purple-600'>
                    {overallProgress}%
                  </div>
                </div>
                <TrendingUp className='h-8 w-8 text-purple-500 opacity-50' />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border-2 border-purple-500/30 overflow-hidden'>
          <CardContent className='p-6'>
            <div className='flex justify-between items-center mb-4'>
              <div>
                <span className='font-bold text-lg'>
                  Your Epic Quest Progress
                </span>
                <p className='text-sm text-muted-foreground mt-1'>
                  Complete all sections to become a CP Master!
                </p>
              </div>
              <Badge className='bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base px-4 py-2'>
                {overallProgress}% Complete
              </Badge>
            </div>
            <Progress value={overallProgress} className='h-5' />
            <div className='flex justify-between mt-3 text-xs text-muted-foreground font-semibold'>
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Advanced</span>
              <span>Expert</span>
              <span>Master</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='space-y-5'>
        {LEARNING_PATH_DATA.map((section, sectionIndex) => {
          const progress = getSectionProgress(section.id);
          const isExpanded = expandedSection === section.id;
          const isCompleted = progress === 100;
          const isLocked =
            sectionIndex > 0 &&
            getSectionProgress(LEARNING_PATH_DATA[sectionIndex - 1].id) < 100;

          return (
            <Card
              key={section.id}
              className={`border-2 transition-all hover:shadow-xl cursor-pointer overflow-hidden ${
                isCompleted
                  ? 'border-green-500/60 bg-gradient-to-r from-green-500/10 to-green-600/5'
                  : isLocked
                  ? 'border-gray-400/30 bg-muted/30 opacity-60'
                  : 'border-blue-500/40 hover:border-blue-500/70 bg-gradient-to-r from-blue-500/5 to-purple-500/5'
              }`}
            >
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4 flex-1'>
                    <div
                      className={`p-4 rounded-xl text-4xl font-bold transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 scale-110'
                          : isLocked
                          ? 'bg-gray-400/20 opacity-50'
                          : 'bg-gradient-to-br from-blue-500/30 to-purple-500/20 hover:scale-110'
                      }`}
                    >
                      {isLocked ? <Lock className='h-8 w-8' /> : section.icon}
                    </div>

                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <CardTitle className='text-2xl font-black'>
                          {section.title}
                        </CardTitle>
                        {isCompleted && (
                          <Badge className='bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse'>
                            <Crown className='h-3 w-3 mr-1' /> Mastered
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge variant='secondary' className='opacity-60'>
                            <Lock className='h-3 w-3 mr-1' /> Locked
                          </Badge>
                        )}
                      </div>
                      <CardDescription className='text-base'>
                        {section.description}
                      </CardDescription>
                      <div className='flex items-center gap-6 mt-3 text-sm font-semibold'>
                        <span className='flex items-center gap-2 text-blue-600'>
                          <Target className='h-4 w-4' />
                          {section.totalProblems} Problems
                        </span>
                        <span className='flex items-center gap-2 text-purple-600'>
                          <Clock className='h-4 w-4' />
                          {section.estimatedTime}
                        </span>
                        <span className='flex items-center gap-2 text-amber-600'>
                          <Star className='h-4 w-4' />
                          {Math.round(
                            (progress * section.totalProblems) / 100
                          )}{' '}
                          / {section.totalProblems} Solved
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isLocked && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setExpandedSection(isExpanded ? null : section.id)
                      }
                      className='hover:bg-primary/10'
                    >
                      <ChevronRight
                        className={`h-6 w-6 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </Button>
                  )}
                </div>

                <div className='mt-4'>
                  <div className='flex justify-between text-sm mb-2'>
                    <span className='font-bold'>Section Progress</span>
                    <span className='font-black text-lg text-blue-600'>
                      {progress}%
                    </span>
                  </div>
                  <div className='relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500'
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardHeader>

              {isExpanded && !isLocked && (
                <CardContent className='pt-0'>
                  <div className='space-y-3 mt-4'>
                    {section.subsections.map((subsection, subIndex) => {
                      const subProgress = getSubsectionProgress(
                        section.id,
                        subsection.id
                      );
                      const subCompleted = subProgress === 100;

                      return (
                        <Card
                          key={subsection.id}
                          className={`border-2 transition-all hover:shadow-lg ${
                            subCompleted
                              ? 'border-green-500/50 bg-gradient-to-r from-green-500/10 to-green-600/5'
                              : 'border-purple-500/30 hover:border-purple-500/60 bg-gradient-to-r from-purple-500/5 to-pink-500/5'
                          }`}
                        >
                          <CardContent className='p-5'>
                            <div className='flex items-center justify-between gap-4'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-2'>
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                                      subCompleted
                                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                                    }`}
                                  >
                                    {subIndex + 1}
                                  </div>
                                  <h4 className='font-bold text-lg'>
                                    {subsection.title}
                                  </h4>
                                  {subCompleted && (
                                    <Badge className='bg-green-600 hover:bg-green-600 text-white'>
                                      <CheckCircle className='h-3 w-3 mr-1' />{' '}
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <p className='text-sm text-muted-foreground mb-3'>
                                  {subsection.description}
                                </p>
                                <div className='flex items-center gap-4 mb-3 text-xs font-semibold'>
                                  <span className='flex items-center gap-1 text-blue-600'>
                                    <Target className='h-3 w-3' />
                                    {subsection.problems.length} Problems
                                  </span>
                                  <span className='flex items-center gap-1 text-purple-600'>
                                    <Clock className='h-3 w-3' />
                                    {subsection.estimatedTime}
                                  </span>
                                  <span className='flex items-center gap-1 text-amber-600'>
                                    <Zap className='h-3 w-3' />
                                    {subProgress}% Complete
                                  </span>
                                </div>

                                <div className='relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                                  <div
                                    className='h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500'
                                    style={{ width: `${subProgress}%` }}
                                  />
                                </div>
                              </div>
                              <Button
                                size='sm'
                                asChild
                                className='gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold whitespace-nowrap'
                              >
                                <Link
                                  href={`/paths/${section.id}/${subsection.id}`}
                                >
                                  <PlayCircle className='h-4 w-4' />
                                  {subProgress > 0 ? 'Continue' : 'Start'}
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className='mt-16 p-8 rounded-2xl border-2 border-gradient-to-r from-blue-500 to-purple-500 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 relative overflow-hidden'>
        <div className='absolute top-0 right-0 opacity-10'>
          <Trophy className='h-32 w-32' />
        </div>
        <div className='relative z-10'>
          <div className='flex items-center gap-3 mb-4'>
            <Crown className='h-8 w-8 text-amber-500' />
            <h2 className='text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Ready to Become a CP Master?
            </h2>
          </div>
          <p className='text-lg text-muted-foreground mb-6 max-w-2xl'>
            Start your competitive programming journey today! Solve problems,
            earn XP, unlock badges, and climb the leaderboard. Every problem
            solved brings you closer to mastery. Let's go! 🚀
          </p>
          <Button
            asChild
            size='lg'
            className='gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-6'
          >
            <Link href='/paths/basic-cpp/cpp-basics'>
              <Rocket className='h-6 w-6' />
              Start Your Epic Quest
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}