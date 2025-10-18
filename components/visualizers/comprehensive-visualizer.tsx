'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Square, RotateCcw, Code, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AlgorithmCategory =
  | 'sorting'
  | 'recursion'
  | 'dp'
  | 'graphs'
  | 'datastructures'
  | 'other';
type Algorithm = string;

interface VisualizationState {
  array?: number[];
  matrix?: number[][];
  nodes?: {
    id: number;
    visited: boolean;
    active: boolean;
    distance?: number;
  }[];
  edges?: { from: number; to: number; active: boolean; weight?: number }[];
  message: string;
  step: number;
  totalSteps: number;
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  visited?: number[];
  current?: number;
  highlight?: number[];
}

const ALGORITHM_CATEGORIES: Record<
  AlgorithmCategory,
  { name: string; algorithms: Algorithm[] }
> = {
  sorting: {
    name: 'Sorting Algorithms',
    algorithms: [
      'Bubble Sort',
      'Selection Sort',
      'Insertion Sort',
      'Merge Sort',
      'Quick Sort',
      'Heap Sort',
    ],
  },
  recursion: {
    name: 'Recursion & Backtracking',
    algorithms: [
      'Fibonacci',
      'Factorial',
      'N-Queens',
      'Maze Solver',
      'Permutations',
    ],
  },
  dp: {
    name: 'Dynamic Programming',
    algorithms: [
      '0/1 Knapsack',
      'LIS',
      'Matrix Chain',
      'Coin Change',
      'Unique Paths',
    ],
  },
  graphs: {
    name: 'Graph Algorithms',
    algorithms: [
      'BFS',
      'DFS',
      'Dijkstra',
      'Bellman-Ford',
      'Kruskal',
      'Prim',
      'Topological Sort',
    ],
  },
  datastructures: {
    name: 'Data Structures',
    algorithms: [
      'Stack',
      'Queue',
      'Priority Queue',
      'Union-Find',
      'Segment Tree',
      'Fenwick Tree',
      'Trie',
    ],
  },
  other: {
    name: 'Other Classics',
    algorithms: ['Binary Search', 'Two Pointers', 'Sliding Window', 'Nim Game'],
  },
};

const ALGORITHM_INFO: Record<
  string,
  { time: string; space: string; description: string; code: string }
> = {
  'Bubble Sort': {
    time: 'O(n²)',
    space: 'O(1)',
    description:
      'Repeatedly compares adjacent elements and swaps them if in wrong order.',
    code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  },
  'Binary Search': {
    time: 'O(log n)',
    space: 'O(1)',
    description:
      'Efficiently searches sorted array by dividing search space in half.',
    code: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  },
  BFS: {
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'Breadth-first search explores graph level by level.',
    code: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  visited.add(start);
  
  while (queue.length > 0) {
    const node = queue.shift();
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}`,
  },
  DFS: {
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'Depth-first search explores graph as deep as possible.',
    code: `function dfs(graph, node, visited = new Set()) {
  visited.add(node);
  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
  return visited;
}`,
  },
  '0/1 Knapsack': {
    time: 'O(n*W)',
    space: 'O(n*W)',
    description: 'Solves knapsack problem using dynamic programming.',
    code: `function knapsack(weights, values, capacity) {
  const dp = Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}`,
  },
  LIS: {
    time: 'O(n log n)',
    space: 'O(n)',
    description: 'Finds longest increasing subsequence efficiently.',
    code: `function lis(arr) {
  const tails = [];
  for (const num of arr) {
    let left = 0, right = tails.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) left = mid + 1;
      else right = mid;
    }
    tails[left] = num;
  }
  return tails.length;
}`,
  },
};

export function ComprehensiveVisualizer() {
  const [category, setCategory] = useState<AlgorithmCategory>('sorting');
  const [algorithm, setAlgorithm] = useState<Algorithm>('Bubble Sort');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(20);
  const [showCode, setShowCode] = useState(false);
  const [state, setState] = useState<VisualizationState>({
    array: [],
    message: 'Ready to visualize',
    step: 0,
    totalSteps: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize array
  useEffect(() => {
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 300) + 10
    );
    setState({
      array: newArray,
      message: 'Array initialized. Click Start to begin visualization.',
      step: 0,
      totalSteps: 0,
    });
  }, [arraySize]);

  // Handle category change
  const handleCategoryChange = (newCategory: AlgorithmCategory) => {
    setCategory(newCategory);
    setAlgorithm(ALGORITHM_CATEGORIES[newCategory].algorithms[0]);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const startVisualization = () => {
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pauseVisualization = () => {
    setIsPaused(!isPaused);
  };

  const stopVisualization = () => {
    setIsPlaying(false);
    setIsPaused(false);
  };

  const resetVisualization = () => {
    stopVisualization();
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 300) + 10
    );
    setState({
      array: newArray,
      message: 'Array reset. Ready to visualize.',
      step: 0,
      totalSteps: 0,
    });
  };

  const algorithmInfo = ALGORITHM_INFO[algorithm] || {
    time: 'N/A',
    space: 'N/A',
    description: 'Algorithm visualization',
    code: '// Code not available',
  };

  return (
    <div className='space-y-6'>
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={category}
            onValueChange={val =>
              handleCategoryChange(val as AlgorithmCategory)
            }
          >
            <TabsList className='grid w-full grid-cols-3 lg:grid-cols-6'>
              {Object.entries(ALGORITHM_CATEGORIES).map(([key, value]) => (
                <TabsTrigger key={key} value={key} className='text-xs'>
                  {value.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Visualization Controls</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div>
              <label className='text-sm font-medium'>Algorithm</label>
              <Select
                value={algorithm}
                onValueChange={setAlgorithm}
                disabled={isPlaying}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALGORITHM_CATEGORIES[category].algorithms.map(algo => (
                    <SelectItem key={algo} value={algo}>
                      {algo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm font-medium'>
                Array Size: {arraySize}
              </label>
              <Slider
                value={[arraySize]}
                onValueChange={([val]) => setArraySize(val)}
                min={5}
                max={50}
                step={1}
                disabled={isPlaying}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Speed: {speed}%</label>
              <Slider
                value={[speed]}
                onValueChange={([val]) => setSpeed(val)}
                min={1}
                max={100}
                step={1}
              />
            </div>

            <div className='flex items-end gap-2'>
              <Button
                onClick={startVisualization}
                disabled={isPlaying}
                size='sm'
                className='flex-1'
              >
                <Play className='w-4 h-4 mr-1' />
                Start
              </Button>
              <Button
                onClick={pauseVisualization}
                disabled={!isPlaying}
                variant='outline'
                size='sm'
              >
                <Pause className='w-4 h-4' />
              </Button>
              <Button
                onClick={stopVisualization}
                disabled={!isPlaying}
                variant='outline'
                size='sm'
              >
                <Square className='w-4 h-4' />
              </Button>
              <Button onClick={resetVisualization} variant='outline' size='sm'>
                <RotateCcw className='w-4 h-4' />
              </Button>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={() => setShowCode(!showCode)}
              variant='outline'
              size='sm'
              className='w-full'
            >
              <Code className='w-4 h-4 mr-2' />
              {showCode ? 'Hide' : 'Show'} Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>{state.message}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                Step {state.step + 1} of {state.totalSteps || '...'}
              </p>
            </div>
            <Badge variant='secondary'>{algorithm}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Area */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Info className='w-5 h-5' />
            Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Array Visualization */}
          {state.array && (
            <div className='bg-muted/10 rounded-lg p-6 mb-4'>
              <div
                className='flex items-end justify-center gap-1 h-80'
                style={{ minHeight: '320px' }}
              >
                {state.array.map((value, index) => {
                  let barColor = 'bg-blue-500';

                  if (state.sorted?.includes(index)) {
                    barColor = 'bg-green-500';
                  } else if (state.swapping?.includes(index)) {
                    barColor = 'bg-red-500';
                  } else if (state.comparing?.includes(index)) {
                    barColor = 'bg-yellow-500';
                  } else if (state.current === index) {
                    barColor = 'bg-purple-500';
                  }

                  const height = Math.max((value / 300) * 250, 20);

                  return (
                    <div
                      key={index}
                      className={`${barColor} rounded-t transition-all duration-200`}
                      style={{
                        height: `${height}px`,
                        width: `${Math.max(300 / arraySize, 8)}px`,
                      }}
                      title={`${value}`}
                    />
                  );
                })}
              </div>

              <div className='mt-4 flex gap-4 text-xs flex-wrap'>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-blue-500 rounded'></div>
                  <span>Unsorted</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-yellow-500 rounded'></div>
                  <span>Comparing</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-red-500 rounded'></div>
                  <span>Swapping</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-purple-500 rounded'></div>
                  <span>Current</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-green-500 rounded'></div>
                  <span>Sorted</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Info */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Algorithm Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>
                Time Complexity
              </p>
              <p className='text-lg font-mono'>{algorithmInfo.time}</p>
            </div>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>
                Space Complexity
              </p>
              <p className='text-lg font-mono'>{algorithmInfo.space}</p>
            </div>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>
                Description
              </p>
              <p className='text-sm'>{algorithmInfo.description}</p>
            </div>
          </CardContent>
        </Card>

        {showCode && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className='text-xs overflow-x-auto font-mono bg-muted/50 p-3 rounded'>
                <code>{algorithmInfo.code}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
