'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCFVerification } from '@/lib/context/cf-verification';
import {
  TrendingUp,
  Trophy,
  Flame,
  Activity,
  Calendar,
  StickyNote,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Radar } from 'react-chartjs-2';

// Chart.js explicit registration
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CFProblem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
  verdict?: string;
  timeConsumedMillis?: number;
  creationTimeSeconds: number;
}

interface DailyStats {
  problemsSolved: number;
  hintsUsed: number;
  totalSubmissions: number;
  averageTime: number;
  tags: { [key: string]: number };
}

interface ProblemNote {
  problemId: string;
  problemName: string;
  note: string;
  createdAt: string;
  tags: string[];
  category: 'hint' | 'solution' | 'approach' | 'mistake' | 'general';
  difficulty?: number;
}

export function CFDashboard() {
  const { isVerified, verificationData } = useCFVerification();
  const { toast } = useToast();

  const [cfProblems, setCfProblems] = useState<CFProblem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [problemNotes, setProblemNotes] = useState<ProblemNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteCategory, setNoteCategory] =
    useState<ProblemNote['category']>('general');
  const [selectedProblem, setSelectedProblem] = useState<CFProblem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [recommendedProblems, setRecommendedProblems] = useState<CFProblem[]>(
    []
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);
  useEffect(() => {
    if (isVerified && verificationData) {
      fetchTodayProblems();
      loadNotes();
      loadStreak();
      fetchRecommendations();
    }
  }, [isVerified, verificationData]);

  // Fetch recent submissions
  const fetchTodayProblems = async () => {
    if (!verificationData) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://codeforces.com/api/user.status?handle=${verificationData.handle}&from=1&count=100`
      );
      const data = await res.json();
      if (data.status === 'OK') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayProblems = data.result.filter(
          (p: any) => new Date(p.creationTimeSeconds * 1000) >= today
        );
        setCfProblems(todayProblems);
        computeStats(todayProblems);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to fetch Codeforces data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (problems: CFProblem[]) => {
    const solved = problems.filter(p => p.verdict === 'OK');
    const failed = problems.filter(p => p.verdict && p.verdict !== 'OK');
    const totalTime = solved.reduce(
      (sum, p) => sum + (p.timeConsumedMillis || 0),
      0
    );
    const tags: { [key: string]: number } = {};
    problems.forEach(p =>
      p.tags?.forEach(tag => (tags[tag] = (tags[tag] || 0) + 1))
    );
    const uniqueProblems = new Set(
      problems.map(p => `${p.contestId}${p.index}`)
    );
    const hintsUsed =
      failed.length + Math.max(0, problems.length - uniqueProblems.size);
    setDailyStats({
      problemsSolved: solved.length,
      hintsUsed,
      totalSubmissions: problems.length,
      averageTime: solved.length ? totalTime / solved.length : 0,
      tags,
    });
  };

  const loadStreak = () => {
    const stored = localStorage.getItem('cf_daily_streak');
    setCurrentStreak(stored ? parseInt(stored) : 0);
  };

  const loadNotes = () => {
    const stored = localStorage.getItem('cf_problem_notes');
    if (stored) setProblemNotes(JSON.parse(stored));
  };

  const saveNote = () => {
    if (!selectedProblem || !newNote.trim()) return;
    const note: ProblemNote = {
      problemId: `${selectedProblem.contestId}${selectedProblem.index}`,
      problemName: selectedProblem.name,
      note: newNote.trim(),
      createdAt: new Date().toISOString(),
      tags: selectedProblem.tags,
      category: noteCategory,
      difficulty: selectedProblem.rating,
    };
    const updated = [note, ...problemNotes];
    setProblemNotes(updated);
    localStorage.setItem('cf_problem_notes', JSON.stringify(updated));
    setNewNote('');
    setNoteCategory('general');
    setSelectedProblem(null);
    toast({
      title: 'Note Saved',
      description: `Saved for ${selectedProblem.name}`,
    });
  };

  const deleteNote = (noteId: string) => {
    const updated = problemNotes.filter(note => note.problemId !== noteId);
    setProblemNotes(updated);
    localStorage.setItem('cf_problem_notes', JSON.stringify(updated));
    toast({ title: 'Note Deleted' });
  };

  // Fetch recommended problems based on rating
  const fetchRecommendations = async () => {
    if (!verificationData) return;
    try {
      const res = await fetch('https://codeforces.com/api/problemset.problems');
      const data = await res.json();
      if (data.status === 'OK') {
        const solvedProblems = new Set(
          cfProblems.map(p => `${p.contestId}${p.index}`)
        );
        const userRating = verificationData.rating || 0;
        const recommended = data.result.problems
          .filter(
            (p: any) =>
              !solvedProblems.has(`${p.contestId}${p.index}`) &&
              p.rating &&
              p.rating >= userRating - 200 &&
              p.rating <= userRating + 200
          )
          .slice(0, 5);
        setRecommendedProblems(recommended);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isMounted) return <div className='text-center py-6'>Loading...</div>;
  if (!isVerified)
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Card className='w-full max-w-md text-center'>
          <CardHeader>
            <Trophy className='mx-auto h-12 w-12 text-yellow-400 mb-2' />
            <CardTitle>Connect Your CF Account</CardTitle>
            <CardDescription>Verify to see your CP dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className='w-full' asChild>
              <a href='/settings'>Verify Now</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  const verdictColor = (v?: string) =>
    v === 'OK'
      ? 'text-green-400'
      : v?.includes('WRONG')
        ? 'text-red-500'
        : 'text-yellow-400';

  return (
    <div className='space-y-6 px-4 py-6'>
      {/* Performance Header */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='hover:scale-105 transition-transform'>
          <CardHeader className='flex justify-between'>
            <CardTitle>Rating</CardTitle>
            <TrendingUp />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-400'>
              {verificationData?.rating || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              {verificationData?.rank || 'Unrated'}
            </p>
          </CardContent>
        </Card>

        <Card className='hover:scale-105 transition-transform'>
          <CardHeader className='flex justify-between'>
            <CardTitle>Max Rating</CardTitle>
            <Trophy />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-400'>
              {verificationData?.maxRating || 0}
            </div>
          </CardContent>
        </Card>

        <Card className='hover:scale-105 transition-transform'>
          <CardHeader className='flex justify-between'>
            <CardTitle>Streak</CardTitle>
            <Flame />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-400'>
              {currentStreak}
            </div>
          </CardContent>
        </Card>

        <Card className='hover:scale-105 transition-transform'>
          <CardHeader className='flex justify-between'>
            <CardTitle>Today's Solved</CardTitle>
            <Activity />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-400'>
              {dailyStats?.problemsSolved || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Recommended Problems */}
        <Card>
          <CardHeader>
            <CardTitle>🧠 Recommended Problems</CardTitle>
            <CardDescription>
              Based on your current rating & weak tags
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 max-h-96 overflow-y-auto'>
            {recommendedProblems.length ? (
              recommendedProblems.map((p, i) => (
                <div
                  key={i}
                  className='flex justify-between items-center p-3 border rounded hover:bg-neutral-800 transition'
                >
                  <div>
                    <div className='font-medium'>{p.name}</div>
                    <div className='text-xs text-muted-foreground'>
                      {p.contestId}
                      {p.index} • Rating: {p.rating}
                    </div>
                    <div className='flex gap-1 mt-1'>
                      {p.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <a
                    target='_blank'
                    href={`https://codeforces.com/contest/${p.contestId}/problem/${p.index}`}
                    className='text-sm text-blue-400 hover:underline'
                  >
                    CF
                  </a>
                </div>
              ))
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No recommendations yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className='flex flex-col justify-between'>
          <CardHeader>
            <CardTitle>⚡ Quick Actions</CardTitle>
            <CardDescription>
              Jump to adaptive sheets, contests, or study plans
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button asChild className='w-full'>
              <a href='/adaptive-sheets'>🎯 Start Practice</a>
            </Button>
            <Button asChild className='w-full'>
              <a href='/contests'>⚡ Virtual Contest</a>
            </Button>
            <Button asChild className='w-full'>
              <a href='/learning-path'>📚 Study Plan</a>
            </Button>
          </CardContent>
        </Card>

        {/* Radar Tag Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>🔥 Weak Tags</CardTitle>
            <CardDescription>Tags where your accuracy is low</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyStats && dailyStats.tags ? (
              <Radar
                data={{
                  labels: Object.keys(dailyStats.tags),
                  datasets: [
                    {
                      label: 'Problems Attempted',
                      data: Object.values(dailyStats.tags),
                      backgroundColor: 'rgba(255, 99, 132, 0.2)',
                      borderColor: 'rgba(255, 99, 132, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  scales: {
                    r: {
                      min: 0,
                      ticks: { stepSize: 1 },
                    },
                  },
                  plugins: { legend: { position: 'top' } },
                }}
              />
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
