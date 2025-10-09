'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LEARNING_PATH_DATA } from '@/lib/learning-path-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Clock, CheckCircle, Loader2, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SubsectionPage() {
  const supabase = createClient();
  const params = useParams();
  const sectionId = params.sectionId as string;
  const subsectionId = params.subsectionId as string;

  // State management
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [revisionProblems, setRevisionProblems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [updatingProblem, setUpdatingProblem] = useState<string | null>(null);
  const [updatingRevision, setUpdatingRevision] = useState<string | null>(null);

  // Find the section and subsection
  const section = LEARNING_PATH_DATA.find(s => s.id === sectionId);
  const subsection = section?.subsections.find(sub => sub.id === subsectionId);

  // Load solved problems and revision status from Supabase on mount
  useEffect(() => {
    if (subsection) {
      loadUserProgress();
    }
  }, [subsection]);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log('No authenticated user');
        setLoading(false);
        return;
      }

      // Get all problem IDs for this subsection
      const problemIds = subsection?.problems.map(p => p.id) || [];

      const { data, error } = await supabase
        .from('user_problems')
        .select('problem_id, solved, marked_for_revision')
        .eq('user_id', user.id)
        .in('problem_id', problemIds);

      if (error) {
        console.error('Error loading user progress:', error);
        return;
      }

      // Convert to Sets for easy lookup
      const solved = new Set(
        data?.filter(item => item.solved).map(item => item.problem_id) || []
      );
      const revision = new Set(
        data?.filter(item => item.marked_for_revision).map(item => item.problem_id) || []
      );
      
      setSolvedProblems(solved);
      setRevisionProblems(revision);
    } catch (error) {
      console.error('Error in loadUserProgress:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProblemStatus = async (problemId: string) => {
    try {
      setUpdatingProblem(problemId);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please log in to track your progress');
        return;
      }

      const isCurrentlySolved = solvedProblems.has(problemId);
      const newSolvedStatus = !isCurrentlySolved;

      // Update in Supabase - specify the unique constraint for upsert
      const { error } = await supabase.from('user_problems').upsert(
        {
          user_id: user.id,
          problem_id: problemId,
          solved: newSolvedStatus,
          solved_at: newSolvedStatus ? new Date().toISOString() : null,
        },
        {
          onConflict: 'user_id,problem_id',
        }
      );

      if (error) {
        console.error('Error updating problem status:', error);
        alert('Failed to update problem status. Please try again.');
        return;
      }

      // Update local state
      setSolvedProblems(prev => {
        const newSet = new Set(prev);
        if (newSolvedStatus) {
          newSet.add(problemId);
        } else {
          newSet.delete(problemId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error in toggleProblemStatus:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setUpdatingProblem(null);
    }
  };

  const toggleRevisionStatus = async (problemId: string) => {
    try {
      setUpdatingRevision(problemId);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please log in to mark problems for revision');
        return;
      }

      const isCurrentlyMarked = revisionProblems.has(problemId);
      const newRevisionStatus = !isCurrentlyMarked;

      // Update in Supabase
      const { error } = await supabase.from('user_problems').upsert(
        {
          user_id: user.id,
          problem_id: problemId,
          marked_for_revision: newRevisionStatus,
          revision_marked_at: newRevisionStatus ? new Date().toISOString() : null,
        },
        {
          onConflict: 'user_id,problem_id',
        }
      );

      if (error) {
        console.error('Error updating revision status:', error);
        alert('Failed to update revision status. Please try again.');
        return;
      }

      // Update local state
      setRevisionProblems(prev => {
        const newSet = new Set(prev);
        if (newRevisionStatus) {
          newSet.add(problemId);
        } else {
          newSet.delete(problemId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error in toggleRevisionStatus:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setUpdatingRevision(null);
    }
  };

  if (!section || !subsection) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>Content not found</h2>
          <p className='text-muted-foreground mb-4'>
            The learning content you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href='/paths'>Browse Learning Paths</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate completion stats
  const totalProblems = subsection.problems.length;
  const solvedCount = solvedProblems.size;
  const revisionCount = revisionProblems.size;
  const completionPercentage =
    totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  return (
    <main className='mx-auto max-w-4xl px-4 py-10'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
        <Link href='/paths' className='hover:text-foreground'>
          Learning Paths
        </Link>
        <span>/</span>
        <span>{section.title}</span>
        <span>/</span>
        <span>{subsection.title}</span>
      </div>

      {/* Back button */}
      <Button variant='ghost' asChild className='mb-6'>
        <Link href='/paths'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Learning Paths
        </Link>
      </Button>

      {/* Header */}
      <Card className='mb-8'>
        <CardHeader>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-3 rounded-lg bg-blue-500/20 text-2xl'>
              {section.icon}
            </div>
            <div>
              <CardTitle className='text-2xl'>{subsection.title}</CardTitle>
              <CardDescription className='text-lg mt-2'>
                {subsection.description}
              </CardDescription>
            </div>
          </div>

          <div className='flex items-center gap-6 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Target className='h-4 w-4' />
              <span>{totalProblems} problems</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              <span>{subsection.estimatedTime}</span>
            </div>
            {!loading && (
              <>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4' />
                  <span>
                    {solvedCount}/{totalProblems} completed (
                    {completionPercentage}%)
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Star className='h-4 w-4' />
                  <span>{revisionCount} marked for revision</span>
                </div>
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Problems List */}
      <Card>
        <CardHeader>
          <CardTitle>Problems to Solve</CardTitle>
          <CardDescription>
            Complete these problems to master {subsection.title}. Click the
            circle to mark as solved and the star to mark for revision.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin mr-2' />
              <span>Loading progress...</span>
            </div>
          ) : (
            <div className='space-y-3'>
              {subsection.problems.map((problem, index) => {
                const isSolved = solvedProblems.has(problem.id);
                const isMarkedForRevision = revisionProblems.has(problem.id);
                const isUpdating = updatingProblem === problem.id;
                const isUpdatingRev = updatingRevision === problem.id;

                return (
                  <div
                    key={problem.id}
                    className='flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => toggleProblemStatus(problem.id)}
                        className='flex-shrink-0 hover:scale-110 transition-transform cursor-pointer disabled:cursor-not-allowed'
                        title={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
                        ) : isSolved ? (
                          <CheckCircle className='h-5 w-5 text-green-500 hover:text-green-600' />
                        ) : (
                          <div className='h-5 w-5 rounded-full border-2 border-muted-foreground hover:border-green-500 transition-colors' />
                        )}
                      </button>
                      <div>
                        <div
                          className={`font-medium ${isSolved ? 'line-through text-muted-foreground' : ''}`}
                        >
                          Problem {index + 1}: {problem.title}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Difficulty: {problem.difficulty}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant={isSolved ? 'default' : 'outline'}>
                        {isSolved ? 'Solved' : 'Pending'}
                      </Badge>
                      <Button size='sm' variant='outline' asChild>
                        <Link href={problem.url} target='_blank'>
                          Solve
                        </Link>
                      </Button>
                      <button
                        onClick={() => toggleRevisionStatus(problem.id)}
                        className='flex-shrink-0 hover:scale-110 transition-transform cursor-pointer disabled:cursor-not-allowed p-1'
                        title={isMarkedForRevision ? 'Remove from revision' : 'Mark for revision'}
                        disabled={isUpdatingRev}
                      >
                        {isUpdatingRev ? (
                          <Loader2 className='h-5 w-5 animate-spin text-amber-500' />
                        ) : (
                          <Star
                            className={`h-5 w-5 transition-colors ${
                              isMarkedForRevision
                                ? 'fill-amber-500 text-amber-500 hover:fill-amber-600 hover:text-amber-600'
                                : 'text-muted-foreground hover:text-amber-500'
                            }`}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
