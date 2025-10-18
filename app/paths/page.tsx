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
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LEARNING_PATH_DATA, getTotalProblems } from '@/lib/learning-path-data';

interface UserProblem {
  problem_id: string;
  solved: boolean;
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
      <main className='mx-auto max-w-6xl px-4 py-10'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='flex items-center gap-3'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span>Loading your progress...</span>
          </div>
        </div>
      </main>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <main className='mx-auto max-w-6xl px-4 py-10'>
      <div className='mb-10'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-4xl font-bold flex items-center gap-3'>
              <TrendingUp className='h-10 w-10 text-primary' />
              Learning Paths
            </h1>
            <p className='text-muted-foreground mt-2 text-lg'>
              Master competitive programming with our structured, gamified
              learning journey
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4 mb-8'>
          <Card className='border-l-4 border-l-blue-500'>
            <CardContent className='p-5'>
              <div className='text-sm text-muted-foreground font-medium'>
                Total Problems
              </div>
              <div className='mt-2 text-3xl font-bold'>{totalProblems}</div>
            </CardContent>
          </Card>
          <Card className='border-l-4 border-l-green-500'>
            <CardContent className='p-5'>
              <div className='text-sm text-muted-foreground font-medium'>
                Completed
              </div>
              <div className='mt-2 text-3xl font-bold'>
                {Math.round((overallProgress * totalProblems) / 100)}
              </div>
            </CardContent>
          </Card>
          <Card className='border-l-4 border-l-yellow-500'>
            <CardContent className='p-5'>
              <div className='text-sm text-muted-foreground font-medium'>
                Estimated Time
              </div>
              <div className='mt-2 text-3xl font-bold'>30+ weeks</div>
            </CardContent>
          </Card>
          <Card className='border-l-4 border-l-purple-500'>
            <CardContent className='p-5'>
              <div className='text-sm text-muted-foreground font-medium'>
                Overall Progress
              </div>
              <div className='mt-2 text-3xl font-bold'>{overallProgress}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress Bar */}
        <Card className='bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
          <CardContent className='p-6'>
            <div className='flex justify-between items-center mb-3'>
              <span className='font-semibold text-lg'>
                Your Journey Progress
              </span>
              <Badge variant='default' className='text-base px-3 py-1'>
                {overallProgress}% Complete
              </Badge>
            </div>
            <Progress value={overallProgress} className='h-4' />
            <p className='text-sm text-muted-foreground mt-3'>
              {overallProgress === 100
                ? 'Congratulations! You have completed the entire learning path!'
                : overallProgress >= 75
                ? 'You are almost there! Keep pushing to complete the path.'
                : overallProgress >= 50
                ? 'Great progress! You are halfway through the journey.'
                : overallProgress >= 25
                ? 'Good start! Continue solving problems to advance.'
                : 'Start your journey by completing the first section.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Path Sections */}
      <div className='space-y-4'>
        {LEARNING_PATH_DATA.map(section => {
          const progress = getSectionProgress(section.id);
          const isExpanded = expandedSection === section.id;
          const isCompleted = progress === 100;

          return (
            <Card
              key={section.id}
              className={`border-2 transition-all hover:shadow-lg ${
                isCompleted
                  ? 'border-green-500/50 bg-gradient-to-r from-green-500/5 to-green-600/5'
                  : 'border-primary/30 hover:border-primary/50'
              }`}
            >
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4 flex-1'>
                    <div
                      className={`p-3 rounded-lg text-3xl ${
                        isCompleted ? 'bg-green-500/20' : 'bg-primary/20'
                      }`}
                    >
                      {section.icon}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3'>
                        <CardTitle className='text-2xl'>
                          {section.title}
                        </CardTitle>
                        {isCompleted && (
                          <Badge className='bg-green-600 hover:bg-green-600 text-white'>
                            <CheckCircle className='h-3 w-3 mr-1' /> Completed
                          </Badge>
                        )}
                      </div>
                      <CardDescription className='mt-2 text-base'>
                        {section.description}
                      </CardDescription>
                      <div className='flex items-center gap-4 mt-3 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Target className='h-4 w-4' />
                          {section.totalProblems} problems
                        </span>
                        <span className='flex items-center gap-1'>
                          <Clock className='h-4 w-4' />
                          {section.estimatedTime}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Zap className='h-4 w-4' />
                          {progress}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      setExpandedSection(isExpanded ? null : section.id)
                    }
                  >
                    <ChevronRight
                      className={`h-5 w-5 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className='mt-4'>
                  <div className='flex justify-between text-sm mb-2'>
                    <span className='font-medium'>Section Progress</span>
                    <span className='font-semibold'>{progress}%</span>
                  </div>
                  <Progress value={progress} className='h-3' />
                </div>
              </CardHeader>

              {/* Expanded Subsections */}
              {isExpanded && (
                <CardContent className='pt-0'>
                  <div className='space-y-3 mt-4'>
                    {section.subsections.map(subsection => {
                      const subProgress = getSubsectionProgress(
                        section.id,
                        subsection.id
                      );
                      const subCompleted = subProgress === 100;

                      return (
                        <Card
                          key={subsection.id}
                          className='border-l-4 border-l-primary/50 bg-muted/30'
                        >
                          <CardContent className='p-4'>
                            <div className='flex items-center justify-between'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-2'>
                                  <h4 className='font-semibold text-lg'>
                                    {subsection.title}
                                  </h4>
                                  {subCompleted && (
                                    <Badge className='bg-green-600 hover:bg-green-600'>
                                      <CheckCircle className='h-3 w-3 mr-1' />{' '}
                                      Done
                                    </Badge>
                                  )}
                                </div>
                                <p className='text-sm text-muted-foreground mb-3'>
                                  {subsection.description}
                                </p>
                                <div className='flex items-center gap-4 mb-3 text-xs text-muted-foreground'>
                                  <span className='flex items-center gap-1'>
                                    <Target className='h-3 w-3' />
                                    {subsection.problems.length} problems
                                  </span>
                                  <span className='flex items-center gap-1'>
                                    <Clock className='h-3 w-3' />
                                    {subsection.estimatedTime}
                                  </span>
                                  <span className='flex items-center gap-1'>
                                    <Flame className='h-3 w-3' />
                                    {subProgress}% complete
                                  </span>
                                </div>

                                {/* Subsection Progress Bar */}
                                <div className='mb-2'>
                                  <Progress
                                    value={subProgress}
                                    className='h-2'
                                  />
                                </div>
                              </div>
                              <div className='flex items-center gap-2 ml-4'>
                                <Button size='sm' asChild className='gap-2'>
                                  <Link
                                    href={`/paths/${section.id}/${subsection.id}`}
                                  >
                                    <PlayCircle className='h-4 w-4' />
                                    {subProgress > 0 ? 'Continue' : 'Start'}
                                  </Link>
                                </Button>
                              </div>
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

      {/* Getting Started Section */}
      <div className='mt-12 p-8 rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5'>
        <div className='flex items-center gap-4 mb-4'>
          <Trophy className='h-8 w-8 text-primary' />
          <h2 className='text-2xl font-bold'>
            Ready to Master Competitive Programming?
          </h2>
        </div>
        <p className='text-muted-foreground mb-6 text-lg'>
          Begin your competitive programming journey with our structured
          learning path. Start with Basic C++ and progress through each section
          at your own pace. Track your progress, earn achievements, and compete
          with others!
        </p>
        <Button asChild size='lg' className='gap-2'>
          <Link href='/paths/basic-cpp/cpp-basics'>
            <PlayCircle className='h-5 w-5' />
            Start Learning Journey
          </Link>
        </Button>
      </div>
    </main>
  );
}