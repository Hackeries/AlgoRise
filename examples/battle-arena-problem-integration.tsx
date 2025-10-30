/**
 * Complete Battle Arena Integration Example
 * Shows how to use the problem sourcing system in a real battle
 */

'use client';

import { useState, useEffect } from 'react';
import { ProblemDisplay } from '@/components/problems/problem-display';
import { fetchMatchmakingProblems, recordProblemView } from '@/lib/problems/problem-fetcher';
import type { Problem } from '@/types/problems';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BattleArenaProps {
  userId: string;
  battleId: string;
}

export function BattleArenaExample({ userId, battleId }: BattleArenaProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(1200);

  // Step 1: Fetch problems when battle starts
  useEffect(() => {
    async function initializeBattle() {
      try {
        // In a real app, get rating from database
        // const rating = await getUserRating(userId);
        // setUserRating(rating);

        // Fetch problems matching user's rating
        const fetchedProblems = await fetchMatchmakingProblems(userId, {
          targetRating: userRating,
          ratingRange: 200,  // ±200 rating
          count: 2,          // 2 problems for this battle
          daysThreshold: 7,  // Don't repeat problems from last 7 days
        });

        if (!fetchedProblems || fetchedProblems.length === 0) {
          throw new Error('No suitable problems found');
        }

        setProblems(fetchedProblems);

        // Record that user has seen the first problem
        if (fetchedProblems[0]) {
          await recordProblemView(
            userId,
            fetchedProblems[0].id,
            battleId,
            undefined // roundId if you have one
          );
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing battle:', err);
        setError(err instanceof Error ? err.message : 'Failed to load problems');
        setLoading(false);
      }
    }

    initializeBattle();
  }, [userId, battleId, userRating]);

  // Step 2: Handle problem navigation
  const goToNextProblem = async () => {
    const nextIndex = currentProblemIndex + 1;
    if (nextIndex < problems.length) {
      setCurrentProblemIndex(nextIndex);

      // Record view for next problem
      await recordProblemView(
        userId,
        problems[nextIndex].id,
        battleId
      );
    }
  };

  const goToPreviousProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };

  // Step 3: Handle problem submission
  const handleSubmission = async (code: string, isCorrect: boolean, timeSpent: number) => {
    const currentProblem = problems[currentProblemIndex];

    try {
      // Update problem interaction
      await fetch(`/api/problems/${currentProblem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isCorrect ? 'solve' : 'attempt',
          timeSpentSeconds: timeSpent,
          battleId,
        }),
      });

      if (isCorrect) {
        // Show success message
        alert('Problem solved! 🎉');
        
        // Move to next problem if available
        if (currentProblemIndex < problems.length - 1) {
          goToNextProblem();
        }
      } else {
        alert('Wrong answer. Try again! 💪');
      }
    } catch (err) {
      console.error('Error submitting solution:', err);
      alert('Failed to submit solution. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding perfect problems for you...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Battle Arena</h1>
            <p className="text-sm text-muted-foreground">
              Your Rating: {userRating} • Battle ID: {battleId.slice(0, 8)}...
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Problem {currentProblemIndex + 1} of {problems.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem Display */}
          <div className="lg:col-span-1">
            <ProblemDisplay
              problem={currentProblem}
              showHints={true}
              compact={false}
            />

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousProblem}
                disabled={currentProblemIndex === 0}
              >
                ← Previous Problem
              </Button>
              <Button
                variant="outline"
                onClick={goToNextProblem}
                disabled={currentProblemIndex >= problems.length - 1}
              >
                Next Problem →
              </Button>
            </div>
          </div>

          {/* Code Editor (Placeholder) */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Your Solution</h2>
              
              {/* In a real app, this would be a code editor component */}
              <div className="bg-muted/30 p-4 rounded-lg border border-border min-h-[400px] font-mono text-sm mb-4">
                <p className="text-muted-foreground">
                  // Write your code here...
                  <br />
                  // This is a placeholder - integrate with Monaco Editor or similar
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    // Mock submission - in real app, run against test cases
                    const mockCorrect = Math.random() > 0.5;
                    const mockTime = Math.floor(Math.random() * 300) + 60;
                    handleSubmission('mock code', mockCorrect, mockTime);
                  }}
                  className="flex-1"
                >
                  Submit Solution
                </Button>
                <Button variant="outline">
                  Test with Examples
                </Button>
              </div>
            </Card>

            {/* Problem List */}
            <Card className="mt-6 p-4">
              <h3 className="font-semibold mb-3">Problems in this Battle</h3>
              <div className="space-y-2">
                {problems.map((problem, index) => (
                  <button
                    key={problem.id}
                    onClick={() => setCurrentProblemIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      index === currentProblemIndex
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{problem.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {problem.platform} • Rating: {problem.difficulty_rating}
                        </p>
                      </div>
                      {index === currentProblemIndex && (
                        <span className="text-primary font-bold">●</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * USAGE IN YOUR APP:
 * 
 * import { BattleArenaExample } from '@/examples/battle-arena-problem-integration';
 * 
 * function BattlePage({ params }) {
 *   const { user } = useAuth();
 *   
 *   return (
 *     <BattleArenaExample 
 *       userId={user.id}
 *       battleId={params.battleId}
 *     />
 *   );
 * }
 */
