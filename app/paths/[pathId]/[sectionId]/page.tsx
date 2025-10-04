'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  Circle,
  Play,
  BookOpen,
  Target,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

type PathModule = {
  id: string;
  title: string;
  description: string;
  problems: number;
  estimatedTime: string;
  topics: string[];
  completed: boolean;
  locked: boolean;
};

type PathContent = {
  id: string;
  title: string;
  description: string;
  level: string;
  totalProblems: number;
  estimatedTime: string;
  progress: number;
  modules: PathModule[];
  features: string[];
};

// Mock data - in real app this would come from API
const PATH_CONTENT: Record<string, PathContent> = {
  'start-here': {
    id: 'start-here',
    title: 'Start Here',
    description:
      'Complete learning path from C++ basics to advanced competitive programming concepts.',
    level: 'Beginner to Advanced',
    totalProblems: 334,
    estimatedTime: '12-16 weeks',
    progress: 0,
    features: [
      'Step-by-step solutions',
      'Visual explanations',
      'CF basics guide',
      'CSES problems',
    ],
    modules: [
      {
        id: 'cpp-basics',
        title: 'C++ Basics',
        description:
          'Master C++ fundamentals - conditions, loops, functions, and basic I/O',
        problems: 50,
        estimatedTime: '2-3 weeks',
        topics: [
          'Variables',
          'Conditions',
          'Loops',
          'Functions',
          'Arrays',
          'Strings',
        ],
        completed: false,
        locked: false,
      },
      {
        id: 'mathematics',
        title: 'Mathematics for CP',
        description:
          'Essential mathematical concepts for competitive programming',
        problems: 60,
        estimatedTime: '3-4 weeks',
        topics: [
          'Number Theory',
          'Modular Arithmetic',
          'GCD/LCM',
          'Prime Numbers',
          'Combinatorics',
        ],
        completed: false,
        locked: true,
      },
      {
        id: 'stl',
        title: 'Standard Template Library (STL)',
        description:
          'Master C++ STL containers, algorithms, and data structures',
        problems: 30,
        estimatedTime: '2-3 weeks',
        topics: [
          'Vector',
          'Map',
          'Set',
          'Stack',
          'Queue',
          'Priority Queue',
          'Algorithms',
        ],
        completed: false,
        locked: true,
      },
      {
        id: 'cses-intro',
        title: 'CSES Introductory Problems',
        description:
          'Solve classic introductory problems from CSES Problem Set',
        problems: 20,
        estimatedTime: '2-3 weeks',
        topics: [
          'Weird Algorithm',
          'Missing Number',
          'Repetitions',
          'Increasing Array',
        ],
        completed: false,
        locked: true,
      },
      {
        id: 'div2a',
        title: 'Codeforces Div2A Problems',
        description:
          'Master the easiest problems in CF contests - build confidence',
        problems: 50,
        estimatedTime: '3-4 weeks',
        topics: ['Ad-hoc', 'Implementation', 'Math', 'Greedy'],
        completed: false,
        locked: true,
      },
      {
        id: 'div2b',
        title: 'Codeforces Div2B Problems',
        description:
          'Step up to harder implementation and algorithmic thinking',
        problems: 60,
        estimatedTime: '4-5 weeks',
        topics: ['Arrays', 'Strings', 'Math', 'Greedy', 'Sorting'],
        completed: false,
        locked: true,
      },
      {
        id: 'div2c',
        title: 'Codeforces Div2C Problems',
        description:
          'Advanced problem solving with data structures and algorithms',
        problems: 64,
        estimatedTime: '5-6 weeks',
        topics: [
          'DP',
          'Graphs',
          'Binary Search',
          'Two Pointers',
          'Data Structures',
        ],
        completed: false,
        locked: true,
      },
    ],
  },
};

// Helper function to get appropriate links for each module
function getModuleLink(moduleId: string): string {
  switch (moduleId) {
    case 'cpp-basics':
      return '/adaptive-sheet?tags=implementation,constructive algorithms&ratingBase=800';
    case 'mathematics':
      return '/adaptive-sheet?tags=math,number theory&ratingBase=900';
    case 'stl':
      return '/adaptive-sheet?tags=data structures,implementation&ratingBase=1000';
    case 'cses-intro':
      return 'https://cses.fi/problemset/';
    case 'div2a':
      return '/adaptive-sheet?tags=implementation,math&ratingBase=800';
    case 'div2b':
      return '/adaptive-sheet?tags=greedy,implementation&ratingBase=1100';
    case 'div2c':
      return '/adaptive-sheet?tags=dp,graphs,binary search&ratingBase=1400';
    default:
      return '/adaptive-sheet';
  }
}

export default function PathDetailPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const [pathData, setPathData] = useState<PathContent | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // In real app, fetch from API
    const data = PATH_CONTENT[pathId];
    setPathData(data || null);
  }, [pathId]);

  if (!pathData) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>Path not found</h2>
          <p className='text-muted-foreground mb-4'>
            The learning path you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href='/paths'>Browse All Paths</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className='mx-auto max-w-4xl px-4 py-10'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground mb-2'>
          <Link href='/paths' className='hover:text-foreground'>
            Learning Paths
          </Link>
          <span>/</span>
          <span>{pathData.title}</span>
        </div>

        <h1 className='text-3xl font-bold mb-4'>{pathData.title}</h1>
        <p className='text-muted-foreground text-lg mb-6'>
          {pathData.description}
        </p>

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='text-center p-4 rounded-lg bg-muted/20'>
            <div className='text-2xl font-bold text-blue-400'>
              {pathData.progress}%
            </div>
            <div className='text-sm text-muted-foreground'>Complete</div>
          </div>
          <div className='text-center p-4 rounded-lg bg-muted/20'>
            <div className='text-2xl font-bold text-green-400'>
              {pathData.totalProblems}
            </div>
            <div className='text-sm text-muted-foreground'>Problems</div>
          </div>
          <div className='text-center p-4 rounded-lg bg-muted/20'>
            <div className='text-2xl font-bold text-amber-400'>
              {pathData.estimatedTime}
            </div>
            <div className='text-sm text-muted-foreground'>Duration</div>
          </div>
          <div className='text-center p-4 rounded-lg bg-muted/20'>
            <div className='text-2xl font-bold text-purple-400'>
              {pathData.level}
            </div>
            <div className='text-sm text-muted-foreground'>Level</div>
          </div>
        </div>

        <Progress value={pathData.progress} className='h-3 mb-6' />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='modules'>Modules</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='mt-6'>
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-5 w-5' />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {pathData.features.map((feature, index) => (
                    <li key={index} className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-400' />
                      <span className='text-sm'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BookOpen className='h-5 w-5' />
                  Path Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {pathData.modules.map((module, index) => (
                    <div key={module.id} className='flex items-center gap-3'>
                      <div className='flex-shrink-0'>
                        {module.completed ? (
                          <CheckCircle className='h-5 w-5 text-green-400' />
                        ) : module.locked ? (
                          <Circle className='h-5 w-5 text-muted-foreground' />
                        ) : (
                          <Play className='h-5 w-5 text-blue-400' />
                        )}
                      </div>
                      <div className='flex-1'>
                        <div className='font-medium text-sm'>
                          {module.title}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {module.problems} problems • {module.estimatedTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='modules' className='mt-6'>
          <div className='space-y-4'>
            {pathData.modules.map((module, index) => (
              <Card
                key={module.id}
                className={module.locked ? 'opacity-60' : ''}
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex-shrink-0'>
                        {module.completed ? (
                          <CheckCircle className='h-6 w-6 text-green-400' />
                        ) : module.locked ? (
                          <Circle className='h-6 w-6 text-muted-foreground' />
                        ) : (
                          <Play className='h-6 w-6 text-blue-400' />
                        )}
                      </div>
                      <div>
                        <CardTitle className='text-lg'>
                          Module {index + 1}: {module.title}
                        </CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        module.completed
                          ? 'default'
                          : module.locked
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {module.completed
                        ? 'Complete'
                        : module.locked
                          ? 'Locked'
                          : 'Available'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <Target className='h-4 w-4' />
                        {module.problems} problems
                      </span>
                      <span className='flex items-center gap-1'>
                        <Clock className='h-4 w-4' />
                        {module.estimatedTime}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-1 mb-4'>
                    {module.topics.map(topic => (
                      <Badge
                        key={topic}
                        variant='secondary'
                        className='text-xs'
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    disabled={module.locked}
                    className='w-full'
                    asChild={!module.locked}
                  >
                    {module.locked ? (
                      'Complete previous modules to unlock'
                    ) : (
                      <Link href={getModuleLink(module.id)}>
                        {module.completed ? 'Review Module' : 'Start Module'}
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
