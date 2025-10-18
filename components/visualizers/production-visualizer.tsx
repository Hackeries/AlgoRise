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

type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'dp'
  | 'graphs'
  | 'datastructures';

interface AlgorithmStep {
  array?: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  message: string;
}

interface Algorithm {
  name: string;
  description: string;
  complexity: { time: string; space: string };
  steps: AlgorithmStep[];
}

const ALGORITHMS: Record<AlgorithmCategory, Record<string, Algorithm>> = {
  sorting: {
    bubbleSort: {
      name: 'Bubble Sort',
      description:
        'Simple sorting algorithm that repeatedly steps through the list',
      complexity: { time: 'O(n²)', space: 'O(1)' },
      steps: generateBubbleSortSteps([64, 34, 25, 12, 22, 11, 90]),
    },
    quickSort: {
      name: 'Quick Sort',
      description: 'Divide and conquer sorting algorithm using pivot',
      complexity: { time: 'O(n log n)', space: 'O(log n)' },
      steps: generateQuickSortSteps([64, 34, 25, 12, 22, 11, 90]),
    },
    mergeSort: {
      name: 'Merge Sort',
      description: 'Divide and conquer algorithm that divides array in half',
      complexity: { time: 'O(n log n)', space: 'O(n)' },
      steps: generateMergeSortSteps([64, 34, 25, 12, 22, 11, 90]),
    },
    insertionSort: {
      name: 'Insertion Sort',
      description: 'Builds sorted array one item at a time',
      complexity: { time: 'O(n²)', space: 'O(1)' },
      steps: generateInsertionSortSteps([64, 34, 25, 12, 22, 11, 90]),
    },
  },
  searching: {
    linearSearch: {
      name: 'Linear Search',
      description: 'Search algorithm that checks each element sequentially',
      complexity: { time: 'O(n)', space: 'O(1)' },
      steps: generateLinearSearchSteps([64, 34, 25, 12, 22, 11, 90], 22),
    },
    binarySearch: {
      name: 'Binary Search',
      description:
        'Search algorithm for sorted arrays using divide and conquer',
      complexity: { time: 'O(log n)', space: 'O(1)' },
      steps: generateBinarySearchSteps([11, 12, 22, 25, 34, 64, 90], 22),
    },
  },
  dp: {
    fibonacci: {
      name: 'Fibonacci',
      description:
        'Dynamic programming approach to calculate Fibonacci numbers',
      complexity: { time: 'O(n)', space: 'O(n)' },
      steps: generateFibonacciSteps(10),
    },
    knapsack: {
      name: '0/1 Knapsack',
      description: 'Classic DP problem for optimal item selection',
      complexity: { time: 'O(n*w)', space: 'O(n*w)' },
      steps: generateKnapsackSteps(),
    },
    lcs: {
      name: 'Longest Common Subsequence',
      description: 'Find longest subsequence common to two sequences',
      complexity: { time: 'O(m*n)', space: 'O(m*n)' },
      steps: generateLCSSteps(),
    },
  },
  graphs: {
    bfs: {
      name: 'BFS (Breadth-First Search)',
      description:
        'Graph traversal algorithm exploring neighbors level by level',
      complexity: { time: 'O(V+E)', space: 'O(V)' },
      steps: generateBFSSteps(),
    },
    dfs: {
      name: 'DFS (Depth-First Search)',
      description: 'Graph traversal algorithm exploring as far as possible',
      complexity: { time: 'O(V+E)', space: 'O(V)' },
      steps: generateDFSSteps(),
    },
    dijkstra: {
      name: "Dijkstra's Algorithm",
      description: 'Shortest path algorithm for weighted graphs',
      complexity: { time: 'O((V+E)logV)', space: 'O(V)' },
      steps: generateDijkstraSteps(),
    },
  },
  datastructures: {
    stack: {
      name: 'Stack Operations',
      description: 'LIFO data structure operations (Push, Pop)',
      complexity: { time: 'O(1)', space: 'O(n)' },
      steps: generateStackSteps(),
    },
    queue: {
      name: 'Queue Operations',
      description: 'FIFO data structure operations (Enqueue, Dequeue)',
      complexity: { time: 'O(1)', space: 'O(n)' },
      steps: generateQueueSteps(),
    },
  },
};

function generateBubbleSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const array = [...arr];
  steps.push({ array: [...array], message: 'Initial array' });

  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      steps.push({
        array: [...array],
        comparing: [j, j + 1],
        message: `Comparing ${array[j]} and ${array[j + 1]}`,
      });

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        steps.push({
          array: [...array],
          swapping: [j, j + 1],
          message: `Swapped ${array[j + 1]} and ${array[j]}`,
        });
      }
    }
  }

  steps.push({
    array: [...array],
    sorted: array.map((_, i) => i),
    message: 'Array sorted!',
  });
  return steps;
}

function generateQuickSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [
    { array: [...arr], message: 'Starting Quick Sort' },
  ];
  const array = [...arr];

  function quickSort(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  function partition(low: number, high: number): number {
    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({
        array: [...array],
        comparing: [j, high],
        message: `Comparing ${array[j]} with pivot ${pivot}`,
      });

      if (array[j] < pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        steps.push({
          array: [...array],
          swapping: [i, j],
          message: `Swapped ${array[j]} and ${array[i]}`,
        });
      }
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    steps.push({
      array: [...array],
      swapping: [i + 1, high],
      message: `Pivot ${pivot} in place`,
    });

    return i + 1;
  }

  quickSort(0, array.length - 1);
  steps.push({
    array: [...array],
    sorted: array.map((_, i) => i),
    message: 'Array sorted!',
  });
  return steps;
}

function generateMergeSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [
    { array: [...arr], message: 'Starting Merge Sort' },
  ];
  const array = [...arr];

  function mergeSort(left: number, right: number): void {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    }
  }

  function merge(left: number, mid: number, right: number): void {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({
        array: [...array],
        comparing: [left + i, mid + 1 + j],
        message: `Comparing ${leftArr[i]} and ${rightArr[j]}`,
      });

      if (leftArr[i] <= rightArr[j]) {
        array[k++] = leftArr[i++];
      } else {
        array[k++] = rightArr[j++];
      }

      steps.push({ array: [...array], message: `Merged elements` });
    }

    while (i < leftArr.length) array[k++] = leftArr[i++];
    while (j < rightArr.length) array[k++] = rightArr[j++];
  }

  mergeSort(0, array.length - 1);
  steps.push({
    array: [...array],
    sorted: array.map((_, i) => i),
    message: 'Array sorted!',
  });
  return steps;
}

function generateInsertionSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const array = [...arr];
  steps.push({ array: [...array], message: 'Initial array' });

  for (let i = 1; i < array.length; i++) {
    const key = array[i];
    let j = i - 1;

    steps.push({
      array: [...array],
      comparing: [i],
      message: `Inserting ${key}`,
    });

    while (j >= 0 && array[j] > key) {
      steps.push({
        array: [...array],
        comparing: [j, j + 1],
        message: `Comparing ${array[j]} and ${key}`,
      });

      array[j + 1] = array[j];
      j--;

      steps.push({
        array: [...array],
        swapping: [j + 1],
        message: `Shifted ${array[j + 1]}`,
      });
    }

    array[j + 1] = key;
    steps.push({
      array: [...array],
      sorted: array.slice(0, i + 1).map((_, idx) => idx),
      message: `${key} inserted in correct position`,
    });
  }

  steps.push({
    array: [...array],
    sorted: array.map((_, i) => i),
    message: 'Array sorted!',
  });
  return steps;
}

function generateLinearSearchSteps(
  arr: number[],
  target: number
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [
    { array: [...arr], message: `Searching for ${target}` },
  ];
  for (let i = 0; i < arr.length; i++) {
    steps.push({
      array: [...arr],
      comparing: [i],
      message: `Checking index ${i}: ${arr[i]}`,
    });
    if (arr[i] === target) {
      steps.push({
        array: [...arr],
        sorted: [i],
        message: `Found ${target} at index ${i}!`,
      });
      return steps;
    }
  }
  steps.push({ array: [...arr], message: `${target} not found` });
  return steps;
}

function generateBinarySearchSteps(
  arr: number[],
  target: number
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [
    { array: [...arr], message: `Binary search for ${target}` },
  ];
  let left = 0,
    right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps.push({
      array: [...arr],
      comparing: [mid],
      message: `Checking middle: ${arr[mid]}`,
    });
    if (arr[mid] === target) {
      steps.push({
        array: [...arr],
        sorted: [mid],
        message: `Found ${target} at index ${mid}!`,
      });
      return steps;
    }
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  steps.push({ array: [...arr], message: `${target} not found` });
  return steps;
}

function generateFibonacciSteps(n: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [{ message: `Calculating Fibonacci(${n})` }];
  const dp: number[] = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({ array: dp.slice(0, i + 1), message: `F(${i}) = ${dp[i]}` });
  }
  return steps;
}

function generateKnapsackSteps(): AlgorithmStep[] {
  return [
    { message: 'Initializing knapsack DP table (capacity=50)' },
    { message: 'Item 1: weight=10, value=60' },
    { message: 'Item 2: weight=20, value=100' },
    { message: 'Item 3: weight=30, value=120' },
    { message: 'Filling DP table with item values' },
    { message: 'Backtracking to find selected items' },
    { message: 'Selected: Item 1, Item 2, Item 3' },
    { message: 'Maximum value: 280' },
  ];
}

function generateLCSSteps(): AlgorithmStep[] {
  return [
    { message: 'String 1: AGGTAB' },
    { message: 'String 2: GXTXAYB' },
    { message: 'Building DP table...' },
    { message: 'LCS found: GTAB' },
    { message: 'Length: 4' },
  ];
}

function generateBFSSteps(): AlgorithmStep[] {
  return [
    { message: 'Starting BFS from node 0' },
    { message: 'Queue: [0]' },
    { message: 'Visiting node 0, neighbors: 1, 2' },
    { message: 'Queue: [1, 2]' },
    { message: 'Visiting node 1, neighbors: 3' },
    { message: 'Queue: [2, 3]' },
    { message: 'Visiting node 2, neighbors: 4' },
    { message: 'Queue: [3, 4]' },
    { message: 'All nodes visited! BFS complete' },
  ];
}

function generateDFSSteps(): AlgorithmStep[] {
  return [
    { message: 'Starting DFS from node 0' },
    { message: 'Stack: [0]' },
    { message: 'Visiting node 0, neighbors: 1, 2' },
    { message: 'Going deep: 0 → 1' },
    { message: 'Stack: [1, 3]' },
    { message: 'Visiting node 1, neighbors: 3' },
    { message: 'Going deep: 1 → 3' },
    { message: 'Backtracking to 1 → 4' },
    { message: 'All nodes visited! DFS complete' },
  ];
}

function generateDijkstraSteps(): AlgorithmStep[] {
  return [
    { message: 'Starting Dijkstra from node 0' },
    { message: 'Distance to 0: 0' },
    { message: 'Distance to 1: 4' },
    { message: 'Distance to 2: 2' },
    { message: 'Visiting node 2 (min distance)' },
    { message: 'Update distance to 3: 7' },
    { message: 'Visiting node 1' },
    { message: 'Update distance to 3: 6' },
    { message: 'All shortest paths found!' },
  ];
}

function generateStackSteps(): AlgorithmStep[] {
  return [
    { message: 'Stack: []' },
    { message: 'Push 5 → Stack: [5]' },
    { message: 'Push 10 → Stack: [5, 10]' },
    { message: 'Push 15 → Stack: [5, 10, 15]' },
    { message: 'Pop: 15 → Stack: [5, 10]' },
    { message: 'Pop: 10 → Stack: [5]' },
    { message: 'Pop: 5 → Stack: []' },
  ];
}

function generateQueueSteps(): AlgorithmStep[] {
  return [
    { message: 'Queue: []' },
    { message: 'Enqueue 5 → Queue: [5]' },
    { message: 'Enqueue 10 → Queue: [5, 10]' },
    { message: 'Enqueue 15 → Queue: [5, 10, 15]' },
    { message: 'Dequeue: 5 → Queue: [10, 15]' },
    { message: 'Dequeue: 10 → Queue: [15]' },
    { message: 'Dequeue: 15 → Queue: []' },
  ];
}

const ProductionVisualizer: React.FC = () => {
  const [category, setCategory] = useState<AlgorithmCategory>('sorting');
  const [algorithm, setAlgorithm] = useState<string>('bubbleSort');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1);

  const currentAlgorithm =
    ALGORITHMS[category][
      algorithm as keyof (typeof ALGORITHMS)[AlgorithmCategory]
    ];
  const steps = currentAlgorithm?.steps || [];
  const currentStepData = steps[currentStep] || {};

  const handleCategoryChange = useCallback((value: string) => {
    const newCategory = value as AlgorithmCategory;
    setCategory(newCategory);
    const firstAlgorithm = Object.keys(ALGORITHMS[newCategory])[0];
    setAlgorithm(firstAlgorithm);
    setCurrentStep(0);
  }, []);

  const handleAlgorithmChange = useCallback((value: string) => {
    setAlgorithm(value);
    setCurrentStep(0);
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
                <TabsList className='grid w-full grid-cols-5'>
                  <TabsTrigger value='sorting'>Sorting</TabsTrigger>
                  <TabsTrigger value='searching'>Search</TabsTrigger>
                  <TabsTrigger value='dp'>DP</TabsTrigger>
                  <TabsTrigger value='graphs'>Graphs</TabsTrigger>
                  <TabsTrigger value='datastructures'>DS</TabsTrigger>
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

export default ProductionVisualizer;