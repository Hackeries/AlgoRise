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
import { LEARNING_PATH_DATA } from '@/lib/learning-path-data';

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

  // Compute totals dynamically from subsection problem counts
  const totalProblems = LEARNING_PATH_DATA.reduce((sum, section) => {
    const sectionTotal = section.subsections.reduce(
      (subSum, sub) => subSum + sub.problems.length,
      0
    );
    return sum + sectionTotal;
  }, 0);

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
        solvedProblems?.map((p: { problem_id: string }) => p.problem_id) || []
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
        const sectionTotal = section.subsections.reduce(
          (subSum, sub) => subSum + sub.problems.length,
          0
        );
        return sum + Math.round((progress * sectionTotal) / 100);
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
    <main className='mx-auto max-w-6xl px-4 py-10 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen'>
      <div className='mb-10'>
        {/* Enhanced Hero */}
        <div className='relative overflow-hidden rounded-2xl glass-intense p-8 sm:p-10 mb-8 hover-lift'>
          <div className='absolute inset-0 -z-10'>
            <div className='absolute top-0 right-0 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[100px] animate-pulse' />
            <div className='absolute bottom-0 left-0 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[100px] animate-pulse' style={{ animationDelay: '1s' }} />
          </div>
          <div className='flex items-start justify-between gap-6'>
            <div className='flex-1'>
              <h1 className='text-4xl sm:text-5xl font-bold tracking-tight flex items-center gap-3'>
                <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30'>
                  <TrendingUp className='h-10 w-10 text-blue-500 animate-pulse' />
                </div>
                <span className='gradient-text'>Learning Paths</span>
              </h1>
              <p className='text-muted-foreground mt-3 text-base sm:text-lg leading-relaxed'>
                <span className='font-semibold text-foreground'>Master competitive programming</span> with structured, curated learning paths designed for success.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card className='card-3d border-l-4 border-l-blue-500 hover-lift'>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between mb-2'>
                  <Target className='h-7 w-7 text-blue-500' />
                </div>
                <div className='text-sm text-muted-foreground font-medium'>
                  Total Problems
                </div>
                <div className='mt-2 text-3xl font-bold'>{totalProblems}</div>
              </CardContent>
            </Card>
            <Card className='card-3d border-l-4 border-l-green-500 hover-lift'>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between mb-2'>
                  <CheckCircle className='h-7 w-7 text-green-500' />
                </div>
                <div className='text-sm text-muted-foreground font-medium'>
                  Completed
                </div>
                <div className='mt-2 text-3xl font-bold'>
                  {Math.round((overallProgress * totalProblems) / 100)}
                </div>
              </CardContent>
            </Card>
            <Card className='card-3d border-l-4 border-l-purple-500 hover-lift'>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between mb-2'>
                  <Clock className='h-7 w-7 text-purple-500' />
                </div>
                <div className='text-sm text-muted-foreground font-medium'>
                  Estimated Time
                </div>
                <div className='mt-2 text-3xl font-bold'>30+ weeks</div>
              </CardContent>
            </Card>
            <Card className='card-3d border-l-4 border-l-orange-500 hover-lift'>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between mb-2'>
                  <Zap className='h-7 w-7 text-orange-500' />
                </div>
                <div className='text-sm text-muted-foreground font-medium'>
                  Overall Progress
                </div>
                <div className='mt-2 text-3xl font-bold'>{overallProgress}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress */}
          <div className='mt-6'>
            <div className='flex justify-between items-center mb-2'>
              <span className='font-semibold'>Your Journey Progress</span>
              <Badge variant='default' className='px-3 py-1'>
                {overallProgress}% Complete
              </Badge>
            </div>
            <Progress value={overallProgress} className='h-3' />
          </div>
        </div>
      </div>

      {/* Learning Path Sections */}
      <div className='space-y-4'>
        {LEARNING_PATH_DATA.map((section, index) => {
          const progress = getSectionProgress(section.id);
          const isExpanded = expandedSection === section.id;
          const isCompleted = progress === 100;

          return (
            <Card key={section.id} className='border transition-all card-3d-ultra hover-shine'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4 flex-1'>
                    <div
                      className={`p-3 rounded-lg text-3xl shadow-lg ${
                        isCompleted ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-primary/20 to-accent/20'
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
                          {
                            section.subsections.reduce(
                              (s, sub) => s + sub.problems.length,
                              0
                            )
                          }{' '}
                          problems
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
                        <Card key={subsection.id} className='bg-muted/30'>
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
      <div className='mt-12 p-8 rounded-xl border bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/15'>
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
        <Button asChild size='lg' className='gap-2'></Button>
      </div>
    </main>
  );
}
