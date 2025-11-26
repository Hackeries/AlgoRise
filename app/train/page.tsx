import { TrainHeader } from '@/components/train/header';
import { DailyChallenge } from '@/components/train/daily-challenge';
import { TopicLadder } from '@/components/train/topic-ladder';
import { ProblemRecos } from '@/components/train/problem-recos';
import { Speedrun } from '@/components/train/speedrun';
import { UpcomingContests } from '@/components/train/contests';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Zap, TestTube, Play, Target } from 'lucide-react';

export default function TrainingHub() {
  return (
    <main className='min-h-screen bg-background text-foreground'>
      <section className='max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6'>
        <TrainHeader />

        {/* Training Session Section */}
        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Adaptive Training Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Start an adaptive training session with real-time feedback, hints, and personalized recommendations.
              Practice CP/DSA problems with session metrics and topic mastery tracking.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/train/session">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Play className="mr-2 h-4 w-4" />
                  Start Training Session
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Problem Generator Section */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Problem Generator & Custom Test Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Generate unlimited practice problems and comprehensive test cases using algorithmic templates.
              Create custom test cases for thorough solution validation.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/problem-generator">
                <Button>
                  Generate Problems
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/test-suites">
                <Button variant="outline">
                  <TestTube className="mr-2 h-4 w-4" />
                  Manage Test Suites
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Row 1: Topic Ladder + Daily Challenge */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-2'>
            <TopicLadder />
          </div>
          <div className='lg:col-span-1'>
            <DailyChallenge />
          </div>
        </div>

        {/* Row 2: Problem Recommendations + Speedrun */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <ProblemRecos />
          <Speedrun />
        </div>

        {/* Row 3: Upcoming Contests */}
        <UpcomingContests />
      </section>
    </main>
  );
}
