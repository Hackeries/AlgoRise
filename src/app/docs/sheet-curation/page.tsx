'use client';
import { CheckCircle2, Database, BarChart2, Zap, Repeat } from 'lucide-react';

export default function SheetCurationPage() {
  const steps = [
    {
      icon: Database,
      title: 'Collect CF Data',
      desc: 'Analyze recent rounds and tags to capture fresh difficulty and topic signals.',
    },
    {
      icon: BarChart2,
      title: 'Difficulty Bucketing',
      desc: 'Map problems to levels using rating bands and solver distribution.',
    },
    {
      icon: Zap,
      title: 'Signal Scoring',
      desc: 'Weight acceptance ratio, editorial clarity, uniqueness, and topic coverage.',
    },
    {
      icon: Repeat,
      title: 'Playtest & Iterate',
      desc: 'Pilot with learners, prune duplicates, add bridging tasks where needed.',
    },
  ];

  const topics = [
    {
      level: 'Intro Pack',
      color: 'text-gray-400',
      items: [
        'Basics',
        'I/O',
        'Math-1',
        'Arrays',
        'STL',
        'Two Pointers',
        'Prefix Sum',
      ],
    },
    {
      level: 'Level 1',
      color: 'text-green-500',
      items: [
        'Sorting/Greedy',
        'Binary Search',
        'Hashing',
        'Stacks/Queues',
        'Brute-Force Patterns',
      ],
    },
    {
      level: 'Level 2',
      color: 'text-cyan-400',
      items: [
        'Graphs (BFS/DFS)',
        'Shortest Paths',
        'Intro DP',
        'Number Theory-1',
        'Implementation',
      ],
    },
    {
      level: 'Level 3',
      color: 'text-blue-500',
      items: [
        'Advanced DP',
        'Combinatorics',
        'Trees/LCA',
        'Bitmasking',
        'Math-2',
        'Segment Trees',
      ],
    },
    {
      level: 'Level 4',
      color: 'text-purple-500',
      items: [
        'Hard Graphs',
        'Flows/Matching',
        'Advanced DP Mix',
        'Interactive & Constructive',
        'Tricks',
      ],
    },
    {
      level: 'Subscription',
      color: 'text-red-500',
      items: [
        '20–30 fresh weekly picks',
        'Contest digestion',
        'Weakness-based tilting',
      ],
    },
  ];

  return (
    <main className='max-w-5xl mx-auto px-6 py-12'>
      {/* Header */}
      <header className='mb-10 text-center'>
        <h1 className='text-3xl md:text-4xl font-bold text-pretty'>
          How we curate Codeforces sheets
        </h1>
        <p className='text-muted-foreground mt-2 max-w-2xl mx-auto'>
          A repeatable pipeline converting real contest signal into structured
          learning—no fluff, just progress.
        </p>
      </header>

      {/* Steps */}
      <section className='mb-12'>
        <h2 className='text-xl font-semibold mb-6'>The Curation Pipeline</h2>
        <ol className='grid gap-6 md:grid-cols-2'>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li
                key={s.title}
                className='flex flex-col gap-3 rounded-lg border p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow min-h-[180px]'
              >
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <div className='text-sm font-mono opacity-70'>
                    Step {i + 1}
                  </div>
                </div>
                <h3 className='font-semibold text-lg'>{s.title}</h3>
                <p className='text-sm text-muted-foreground'>{s.desc}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Topics */}
      <section className='mb-12'>
        <h2 className='text-xl font-semibold mb-6'>Topics by Level</h2>
        <div className='grid gap-6 md:grid-cols-2'>
          {topics.map(t => (
            <div
              key={t.level}
              className='rounded-lg border p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow min-h-[180px]'
            >
              <div className='flex items-center justify-between mb-2'>
                <h3 className={`font-semibold ${t.color}`}>{t.level}</h3>
                <span className='text-xs rounded-full px-2 py-0.5 bg-primary text-primary-foreground'>
                  Curated
                </span>
              </div>
              <ul className='mt-2 text-sm leading-relaxed list-disc pl-5 space-y-1'>
                {t.items.map(it => (
                  <li key={it} className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-primary' />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Always Stays */}
      <section className='mb-12'>
        <h2 className='text-xl font-semibold mb-3'>What always stays</h2>
        <ul className='list-disc pl-5 leading-relaxed text-sm space-y-1'>
          <li>Weekly cadence with consistent difficulty ramp.</li>
          <li>Real contest tasks—no synthetic toy problems.</li>
          <li>Editorial-first picks to ensure learnability.</li>
          <li>Coverage breadth with spaced revisits via revisions.</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className='flex flex-col md:flex-row items-center justify-between border-t pt-6 mt-6 gap-4'>
        <p className='text-sm text-muted-foreground'>
          Want personalized sets? Subscription adds weekly picks tuned to your
          recent performance.
        </p>
        <a
          href='/pricing'
          className='text-sm underline underline-offset-4 font-medium hover:text-primary transition-colors'
        >
          Explore plans
        </a>
      </footer>
    </main>
  );
}
