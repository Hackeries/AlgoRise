import { TrainHeader } from '@/components/train/header';
import { DailyChallenge } from '@/components/train/daily-challenge';
import { TopicLadder } from '@/components/train/topic-ladder';
import { ProblemRecos } from '@/components/train/problem-recos';
import { Speedrun } from '@/components/train/speedrun';
import { UpcomingContests } from '@/components/train/contests';

export default function TrainingHub() {
  return (
    <main className='min-h-screen bg-background text-foreground'>
      <section className='max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6'>
        <TrainHeader />

        {/* Row 1: Topic Ladder + Daily Challenge */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-2'>
            <TopicLadder />
          </div>
          <div className='lg:col-span-1'>
            <DailyChallenge />
          </div>
        </div>

        {/* Row 2: Problem Recos + Speedrun */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-2'>
            <ProblemRecos />
          </div>
          <div className='lg:col-span-1'>
            <Speedrun />
          </div>
        </div>

        {/* Row 3: Contests */}
        <div className='grid grid-cols-1 gap-4'>
          <UpcomingContests />
        </div>
      </section>
    </main>
  );
}
