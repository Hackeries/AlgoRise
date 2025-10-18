'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import {
  bubbleSortGenerator,
  selectionSortGenerator,
  insertionSortGenerator,
  quickSortGenerator,
  mergeSortGenerator,
  linearSearchGenerator,
  binarySearchGenerator,
  bfsGenerator,
  dfsGenerator,
  fibonacciGenerator,
  knapsackGenerator,
  type AlgorithmStep,
} from '@/lib/algorithm-utils';

type AlgorithmCategory = 'sorting' | 'searching' | 'dp' | 'graphs';

interface Algorithm {
  name: string;
  description: string;
  complexity: { time: string; space: string };
  generator: (arr?: number[], target?: number) => Generator<AlgorithmStep>;
}

const ALGORITHMS: Record<AlgorithmCategory, Record<string, Algorithm>> = {
  sorting: {
    bubbleSort: {
      name: 'Bubble Sort',
      description:
        'Simple sorting algorithm that repeatedly steps through the list',
      complexity: { time: 'O(n²)', space: 'O(1)' },
      generator: () => bubbleSortGenerator([64, 34, 25, 12, 22, 11, 90]),
    },
    selectionSort: {
      name: 'Selection Sort',
      description: 'Finds minimum element and places it at beginning',
      complexity: { time: 'O(n²)', space: 'O(1)' },
      generator: () => selectionSortGenerator([64, 34, 25, 12, 22, 11, 90]),
    },
    insertionSort: {
      name: 'Insertion Sort',
      description: 'Builds sorted array one item at a time',
      complexity: { time: 'O(n²)', space: 'O(1)' },
      generator: () => insertionSortGenerator([64, 34, 25, 12, 22, 11, 90]),
    },
    quickSort: {
      name: 'Quick Sort',
      description: 'Divide and conquer sorting algorithm using pivot',
      complexity: { time: 'O(n log n)', space: 'O(log n)' },
      generator: () => quickSortGenerator([64, 34, 25, 12, 22, 11, 90]),
    },
    mergeSort: {
      name: 'Merge Sort',
      description: 'Divide and conquer algorithm that divides array in half',
      complexity: { time: 'O(n log n)', space: 'O(n)' },
      generator: () => mergeSortGenerator([64, 34, 25, 12, 22, 11, 90]),
    },
  },
  searching: {
    linearSearch: {
      name: 'Linear Search',
      description: 'Search algorithm that checks each element sequentially',
      complexity: { time: 'O(n)', space: 'O(1)' },
      generator: () => linearSearchGenerator([64, 34, 25, 12, 22, 11, 90], 22),
    },
    binarySearch: {
      name: 'Binary Search',
      description:
        'Search algorithm for sorted arrays using divide and conquer',
      complexity: { time: 'O(log n)', space: 'O(1)' },
      generator: () => binarySearchGenerator([11, 12, 22, 25, 34, 64, 90], 22),
    },
  },
  dp: {
    fibonacci: {
      name: 'Fibonacci',
      description:
        'Dynamic programming approach to calculate Fibonacci numbers',
      complexity: { time: 'O(n)', space: 'O(n)' },
      generator: () => fibonacciGenerator(10),
    },
    knapsack: {
      name: '0/1 Knapsack',
      description: 'Classic DP problem for optimal item selection',
      complexity: { time: 'O(n*w)', space: 'O(n*w)' },
      generator: () => knapsackGenerator([10, 20, 30], [60, 100, 120], 50),
    },
  },
  graphs: {
    bfs: {
      name: 'BFS (Breadth-First Search)',
      description:
        'Graph traversal algorithm exploring neighbors level by level',
      complexity: { time: 'O(V+E)', space: 'O(V)' },
      generator: () => bfsGenerator([[1, 2], [0, 3], [0, 4], [1], [2]], 0),
    },
    dfs: {
      name: 'DFS (Depth-First Search)',
      description: 'Graph traversal algorithm exploring as far as possible',
      complexity: { time: 'O(V+E)', space: 'O(V)' },
      generator: () => dfsGenerator([[1, 2], [0, 3], [0, 4], [1], [2]], 0),
    },
  },
};

interface ProductionVisualizerProps {
  topic?: string;
}

const ProductionVisualizer: React.FC<ProductionVisualizerProps> = ({
  topic,
}) => {
  const getInitialCategory = (): AlgorithmCategory => {
    if (topic === 'sorting') return 'sorting';
    if (topic === 'graphs') return 'graphs';
    if (topic === 'dp') return 'dp';
    if (topic === 'binary-search') return 'searching';
    return 'sorting';
  };

  const [category, setCategory] = useState<AlgorithmCategory>(
    getInitialCategory()
  );
  const [algorithm, setAlgorithm] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);

  useEffect(() => {
    const firstAlgorithm = Object.keys(ALGORITHMS[category])[0];
    setAlgorithm(firstAlgorithm);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [category]);

  useEffect(() => {
    if (!algorithm) return;
    const algo =
      ALGORITHMS[category][
        algorithm as keyof (typeof ALGORITHMS)[AlgorithmCategory]
      ];
    if (algo) {
      const generator = algo.generator();
      const newSteps: AlgorithmStep[] = [];
      let result = generator.next();
      while (!result.done) {
        newSteps.push(result.value);
        result = generator.next();
      }
      setSteps(newSteps);
      setCurrentStep(0);
    }
  }, [algorithm, category]);

  const currentAlgorithm =
    ALGORITHMS[category][
      algorithm as keyof (typeof ALGORITHMS)[AlgorithmCategory]
    ];
  const currentStepData = steps[currentStep] || {};

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value as AlgorithmCategory);
  }, []);

  const handleAlgorithmChange = useCallback((value: string) => {
    setAlgorithm(value);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  const handleStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className='w-full max-w-6xl mx-auto p-4 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Visualizer</CardTitle>
          <CardDescription>
            Interactive step-by-step visualization of classical algorithms
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Category and Algorithm Selection */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium mb-2 block'>Category</label>
              <Tabs value={category} onValueChange={handleCategoryChange}>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='sorting'>Sorting</TabsTrigger>
                  <TabsTrigger value='searching'>Search</TabsTrigger>
                  <TabsTrigger value='dp'>DP</TabsTrigger>
                  <TabsTrigger value='graphs'>Graphs</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <label className='text-sm font-medium mb-2 block'>
                Algorithm
              </label>
              <Tabs value={algorithm} onValueChange={handleAlgorithmChange}>
                <TabsList className='grid w-full grid-cols-3'>
                  {Object.entries(ALGORITHMS[category]).map(([key, algo]) => (
                    <TabsTrigger key={key} value={key} className='text-xs'>
                      {algo.name.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Visualization Area */}
          <Card className='bg-slate-50 dark:bg-slate-900 p-6'>
            <div className='flex items-end justify-center gap-2 h-64'>
              {currentStepData.array?.map((value: number, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-end justify-center rounded transition-all duration-300 ${
                    currentStepData.sorted?.includes(idx)
                      ? 'bg-green-500'
                      : currentStepData.comparing?.includes(idx)
                      ? 'bg-yellow-500'
                      : currentStepData.swapping?.includes(idx)
                      ? 'bg-red-500'
                      : currentStepData.highlight?.includes(idx)
                      ? 'bg-purple-500'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    height: `${(value / 100) * 100}%`,
                    width: `${100 / (currentStepData.array?.length || 1)}%`,
                  }}
                >
                  <span className='text-xs font-bold text-white'>{value}</span>
                </div>
              ))}
            </div>
            <p className='text-center mt-4 text-sm font-medium'>
              {currentStepData.message}
            </p>
          </Card>

          {/* Algorithm Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded'>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                Time Complexity
              </p>
              <p className='font-mono font-bold'>
                {currentAlgorithm?.complexity.time}
              </p>
            </div>
            <div className='p-3 bg-purple-50 dark:bg-purple-900/20 rounded'>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                Space Complexity
              </p>
              <p className='font-mono font-bold'>
                {currentAlgorithm?.complexity.space}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className='space-y-4'>
            <div className='flex gap-2 flex-wrap'>
              <Button onClick={handlePlay} disabled={isPlaying} size='sm'>
                <Play className='w-4 h-4 mr-2' />
                Play
              </Button>
              <Button
                onClick={handlePause}
                disabled={!isPlaying}
                size='sm'
                variant='outline'
              >
                <Pause className='w-4 h-4 mr-2' />
                Pause
              </Button>
              <Button
                onClick={handleStep}
                disabled={isPlaying}
                size='sm'
                variant='outline'
              >
                <StepForward className='w-4 h-4 mr-2' />
                Step
              </Button>
              <Button onClick={handleReset} size='sm' variant='outline'>
                <RotateCcw className='w-4 h-4 mr-2' />
                Reset
              </Button>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Speed: {speed}x</label>
              <Slider
                value={[speed]}
                onValueChange={value => setSpeed(value[0])}
                min={0.5}
                max={3}
                step={0.5}
                className='w-full'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Step: {currentStep + 1} / {steps.length}
              </label>
              <Slider
                value={[currentStep]}
                onValueChange={value => setCurrentStep(value[0])}
                min={0}
                max={steps.length - 1}
                step={1}
                className='w-full'
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export { ProductionVisualizer };
export default ProductionVisualizer;