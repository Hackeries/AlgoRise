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
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Code,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AlgorithmCategory = 'search' | 'dp' | 'greedy';
type SearchAlgorithm = 'linear' | 'binary';
type DPAlgorithm = 'fib' | 'knapsack' | 'lis';
type GreedyAlgorithm = 'activity' | 'coins';

interface VisualizationStep {
  state: Record<string, any>;
  message: string;
  highlights?: {
    array?: number[];
    current?: number;
    compared?: number[];
    selected?: number[];
  };
}

interface AlgorithmInfo {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  code: string;
}

const ALGORITHM_INFO: Record<string, AlgorithmInfo> = {
  linear: {
    name: 'Linear Search',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description:
      'Searches for a target by checking each element sequentially until found.',
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
  },
  binary: {
    name: 'Binary Search',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description:
      'Efficiently searches a sorted array by repeatedly dividing the search space in half.',
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
  fib: {
    name: 'Fibonacci (DP)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description:
      'Computes Fibonacci numbers using dynamic programming with memoization.',
    code: `function fibonacci(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}`,
  },
  knapsack: {
    name: '0/1 Knapsack',
    timeComplexity: 'O(n*W)',
    spaceComplexity: 'O(n*W)',
    description: 'Solves the knapsack problem using dynamic programming.',
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
  lis: {
    name: 'Longest Increasing Subsequence',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n)',
    description:
      'Finds the longest subsequence where elements are in increasing order.',
    code: `function lis(arr) {
  const dp = Array(arr.length).fill(1);
  for (let i = 1; i < arr.length; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
}`,
  },
  activity: {
    name: 'Activity Selection',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Greedily selects maximum non-overlapping activities.',
    code: `function activitySelection(activities) {
  activities.sort((a, b) => a.end - b.end);
  const selected = [activities[0]];
  for (let i = 1; i < activities.length; i++) {
    if (activities[i].start >= selected[selected.length - 1].end) {
      selected.push(activities[i]);
    }
  }
  return selected;
}`,
  },
  coins: {
    name: 'Coin Change (Greedy)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Greedily selects largest coins to make change.',
    code: `function coinChange(amount, coins) {
  coins.sort((a, b) => b - a);
  let count = 0;
  for (const coin of coins) {
    count += Math.floor(amount / coin);
    amount %= coin;
  }
  return count;
}`,
  },
};

export function AlgorithmVisualizer() {
  const [category, setCategory] = useState<AlgorithmCategory>('search');
  const [algorithm, setAlgorithm] = useState<string>('linear');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [inputArray, setInputArray] = useState<number[]>([5, 2, 8, 1, 9, 3, 7]);
  const [target, setTarget] = useState(8);

  const intervalRef = useRef<NodeJS.Timeout>();

  const generateSteps = () => {
    let newSteps: VisualizationStep[] = [];

    if (category === 'search') {
      if (algorithm === 'linear') {
        newSteps = generateLinearSearchSteps(inputArray, target);
      } else if (algorithm === 'binary') {
        const sorted = [...inputArray].sort((a, b) => a - b);
        newSteps = generateBinarySearchSteps(sorted, target);
      }
    } else if (category === 'dp') {
      if (algorithm === 'fib') {
        newSteps = generateFibonacciSteps(8);
      } else if (algorithm === 'knapsack') {
        newSteps = generateKnapsackSteps();
      } else if (algorithm === 'lis') {
        newSteps = generateLISSteps(inputArray);
      }
    } else if (category === 'greedy') {
      if (algorithm === 'activity') {
        newSteps = generateActivitySelectionSteps();
      } else if (algorithm === 'coins') {
        newSteps = generateCoinChangeSteps(63);
      }
    }

    setSteps(newSteps);
    setCurrentStep(0);
  };

  const generateLinearSearchSteps = (
    arr: number[],
    target: number
  ): VisualizationStep[] => {
    const steps: VisualizationStep[] = [
      {
        state: { array: arr, target },
        message: `Starting Linear Search for ${target}...`,
        highlights: { array: [] },
      },
    ];

    for (let i = 0; i < arr.length; i++) {
      steps.push({
        state: { array: arr, target, index: i },
        message: `Checking index ${i}: value is ${arr[i]}`,
        highlights: { current: i },
      });

      if (arr[i] === target) {
        steps.push({
          state: { array: arr, target, found: i },
          message: `Found ${target} at index ${i}!`,
          highlights: { selected: [i] },
        });
        break;
      }
    }

    if (!arr.includes(target)) {
      steps.push({
        state: { array: arr, target },
        message: `${target} not found in array`,
        highlights: { array: [] },
      });
    }

    return steps;
  };

  const generateBinarySearchSteps = (
    arr: number[],
    target: number
  ): VisualizationStep[] => {
    const steps: VisualizationStep[] = [
      {
        state: { array: arr, target },
        message: `Starting Binary Search for ${target} in sorted array...`,
        highlights: { array: [] },
      },
    ];

    let left = 0,
      right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      steps.push({
        state: { array: arr, target, left, right, mid },
        message: `Searching in range [${left}, ${right}]. Checking mid = ${mid} (value: ${arr[mid]})`,
        highlights: { compared: [left, right, mid] },
      });

      if (arr[mid] === target) {
        steps.push({
          state: { array: arr, target, found: mid },
          message: `Found ${target} at index ${mid}!`,
          highlights: { selected: [mid] },
        });
        break;
      } else if (arr[mid] < target) {
        left = mid + 1;
        steps.push({
          state: { array: arr, target, left, right },
          message: `${arr[mid]} < ${target}, search right half`,
          highlights: { compared: [mid + 1, right] },
        });
      } else {
        right = mid - 1;
        steps.push({
          state: { array: arr, target, left, right },
          message: `${arr[mid]} > ${target}, search left half`,
          highlights: { compared: [left, mid - 1] },
        });
      }
    }

    if (left > right) {
      steps.push({
        state: { array: arr, target },
        message: `${target} not found in array`,
        highlights: { array: [] },
      });
    }

    return steps;
  };

  const generateFibonacciSteps = (n: number): VisualizationStep[] => {
    const steps: VisualizationStep[] = [
      {
        state: { n, memo: {} },
        message: `Computing Fibonacci(${n}) using memoization...`,
        highlights: {},
      },
    ];

    const memo: Record<number, number> = {};

    const fib = (num: number): number => {
      steps.push({
        state: { n: num, memo: { ...memo } },
        message: `Computing fib(${num})...`,
        highlights: { current: num },
      });

      if (num <= 1) {
        memo[num] = num;
        steps.push({
          state: { n: num, memo: { ...memo } },
          message: `Base case: fib(${num}) = ${num}`,
          highlights: { selected: [num] },
        });
        return num;
      }

      if (memo[num]) {
        steps.push({
          state: { n: num, memo: { ...memo } },
          message: `fib(${num}) already computed: ${memo[num]}`,
          highlights: { selected: [num] },
        });
        return memo[num];
      }

      const result = fib(num - 1) + fib(num - 2);
      memo[num] = result;

      steps.push({
        state: { n: num, memo: { ...memo } },
        message: `fib(${num}) = fib(${num - 1}) + fib(${num - 2}) = ${result}`,
        highlights: { selected: [num] },
      });

      return result;
    };

    fib(n);

    steps.push({
      state: { n, result: memo[n], memo },
      message: `Fibonacci(${n}) = ${memo[n]}`,
      highlights: { selected: [n] },
    });

    return steps;
  };

  const generateKnapsackSteps = (): VisualizationStep[] => {
    const weights = [2, 3, 4, 5];
    const values = [3, 4, 5, 6];
    const capacity = 8;

    const steps: VisualizationStep[] = [
      {
        state: { weights, values, capacity },
        message: `0/1 Knapsack: capacity=${capacity}, items=${weights.length}`,
        highlights: {},
      },
    ];

    const dp = Array(capacity + 1).fill(0);

    for (let i = 0; i < weights.length; i++) {
      for (let w = capacity; w >= weights[i]; w--) {
        const oldVal = dp[w];
        const newVal = dp[w - weights[i]] + values[i];

        if (newVal > oldVal) {
          dp[w] = newVal;
          steps.push({
            state: { dp: [...dp], i, w, weights, values },
            message: `Item ${i} (weight=${weights[i]}, value=${values[i]}): dp[${w}] = ${newVal}`,
            highlights: { current: w },
          });
        }
      }
    }

    steps.push({
      state: { dp, maxValue: dp[capacity] },
      message: `Maximum value: ${dp[capacity]}`,
      highlights: {},
    });

    return steps;
  };

  const generateLISSteps = (arr: number[]): VisualizationStep[] => {
    const steps: VisualizationStep[] = [
      {
        state: { array: arr },
        message: `Finding Longest Increasing Subsequence...`,
        highlights: {},
      },
    ];

    const dp = Array(arr.length).fill(1);

    for (let i = 1; i < arr.length; i++) {
      for (let j = 0; j < i; j++) {
        if (arr[j] < arr[i]) {
          const oldLen = dp[i];
          dp[i] = Math.max(dp[i], dp[j] + 1);

          if (dp[i] > oldLen) {
            steps.push({
              state: { array: arr, dp: [...dp], i, j },
              message: `arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}, dp[${i}] = ${dp[i]}`,
              highlights: { compared: [j, i] },
            });
          }
        }
      }
    }

    const maxLen = Math.max(...dp);
    steps.push({
      state: { array: arr, dp, maxLen },
      message: `LIS length: ${maxLen}`,
      highlights: {},
    });

    return steps;
  };

  const generateActivitySelectionSteps = (): VisualizationStep[] => {
    const activities = [
      { id: 0, start: 1, end: 3 },
      { id: 1, start: 2, end: 5 },
      { id: 2, start: 4, end: 6 },
      { id: 3, start: 6, end: 9 },
      { id: 4, start: 5, end: 7 },
    ];

    const steps: VisualizationStep[] = [
      {
        state: { activities },
        message: `Activity Selection: Greedy approach to select non-overlapping activities`,
        highlights: {},
      },
    ];

    const sorted = [...activities].sort((a, b) => a.end - b.end);
    const selected = [sorted[0]];

    steps.push({
      state: { activities: sorted, selected: [0] },
      message: `Selected activity 0 (end=${sorted[0].end})`,
      highlights: { selected: [0] },
    });

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start >= selected[selected.length - 1].end) {
        selected.push(sorted[i]);
        steps.push({
          state: { activities: sorted, selected: selected.map(a => a.id) },
          message: `Activity ${i} compatible, selected (start=${sorted[i].start}, end=${sorted[i].end})`,
          highlights: { selected: selected.map(a => a.id) },
        });
      } else {
        steps.push({
          state: { activities: sorted, selected: selected.map(a => a.id) },
          message: `Activity ${i} overlaps, skipped`,
          highlights: { compared: [i] },
        });
      }
    }

    steps.push({
      state: {
        activities: sorted,
        selected: selected.map(a => a.id),
        count: selected.length,
      },
      message: `Total activities selected: ${selected.length}`,
      highlights: {},
    });

    return steps;
  };

  const generateCoinChangeSteps = (amount: number): VisualizationStep[] => {
    const coins = [25, 10, 5, 1];
    const steps: VisualizationStep[] = [
      {
        state: { amount, coins },
        message: `Coin Change: Make ${amount} cents using coins [${coins.join(
          ', '
        )}]`,
        highlights: {},
      },
    ];

    let remaining = amount;
    const used: number[] = [];

    for (const coin of coins) {
      const count = Math.floor(remaining / coin);
      if (count > 0) {
        used.push(count);
        steps.push({
          state: { amount, coins, remaining, coin, count, used: [...used] },
          message: `Using ${count} coin(s) of value ${coin}. Remaining: ${
            remaining % coin
          }`,
          highlights: { current: coin },
        });
        remaining %= coin;
      }
    }

    steps.push({
      state: { amount, coins, totalCoins: used.reduce((a, b) => a + b, 0) },
      message: `Total coins used: ${used.reduce((a, b) => a + b, 0)}`,
      highlights: {},
    });

    return steps;
  };

  // Animation control
  useEffect(() => {
    if (isPlaying && !isPaused && currentStep < steps.length - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 - speed * 9);
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, isPaused, currentStep, steps.length, speed]);

  const startVisualization = () => {
    generateSteps();
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsPaused(!isPaused);
  };

  const stop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
  };

  const reset = () => {
    stop();
    generateSteps();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep] || {
    state: {},
    message: 'Ready to visualize',
    highlights: {},
  };

  const info = ALGORITHM_INFO[algorithm];

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='text-2xl'>Algorithm Visualizer</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Category and Algorithm Selection */}
        <Tabs
          value={category}
          onValueChange={val => {
            setCategory(val as AlgorithmCategory);
            if (val === 'search') setAlgorithm('linear');
            else if (val === 'dp') setAlgorithm('fib');
            else if (val === 'greedy') setAlgorithm('activity');
          }}
        >
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='search'>Search</TabsTrigger>
            <TabsTrigger value='dp'>Dynamic Programming</TabsTrigger>
            <TabsTrigger value='greedy'>Greedy</TabsTrigger>
          </TabsList>

          <TabsContent value='search' className='space-y-4'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>Algorithm:</label>
              <Select
                value={algorithm}
                onValueChange={setAlgorithm}
                disabled={isPlaying}
              >
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='linear'>Linear Search</SelectItem>
                  <SelectItem value='binary'>Binary Search</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value='dp' className='space-y-4'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>Algorithm:</label>
              <Select
                value={algorithm}
                onValueChange={setAlgorithm}
                disabled={isPlaying}
              >
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='fib'>Fibonacci</SelectItem>
                  <SelectItem value='knapsack'>0/1 Knapsack</SelectItem>
                  <SelectItem value='lis'>
                    Longest Increasing Subsequence
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value='greedy' className='space-y-4'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>Algorithm:</label>
              <Select
                value={algorithm}
                onValueChange={setAlgorithm}
                disabled={isPlaying}
              >
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='activity'>Activity Selection</SelectItem>
                  <SelectItem value='coins'>Coin Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        {/* Controls */}
        <div className='flex flex-wrap gap-4 items-center'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Speed:</label>
            <Slider
              value={[speed]}
              onValueChange={([value]) => setSpeed(value)}
              min={1}
              max={100}
              step={1}
              className='w-24'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 flex-wrap'>
          {!isPlaying ? (
            <Button
              onClick={startVisualization}
              className='flex items-center gap-2'
            >
              <Play className='w-4 h-4' />
              Start
            </Button>
          ) : (
            <Button
              onClick={pause}
              variant='outline'
              className='flex items-center gap-2 bg-transparent'
            >
              <Pause className='w-4 h-4' />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}

          <Button
            onClick={stop}
            variant='outline'
            className='flex items-center gap-2 bg-transparent'
          >
            <Square className='w-4 h-4' />
            Stop
          </Button>

          <Button
            onClick={reset}
            variant='outline'
            className='flex items-center gap-2 bg-transparent'
          >
            <RotateCcw className='w-4 h-4' />
            Reset
          </Button>

          <Button
            onClick={prevStep}
            variant='outline'
            className='flex items-center gap-2 bg-transparent'
            disabled={currentStep === 0}
          >
            <ChevronLeft className='w-4 h-4' />
            Prev
          </Button>

          <Button
            onClick={nextStep}
            variant='outline'
            className='flex items-center gap-2 bg-transparent'
            disabled={currentStep >= steps.length - 1}
          >
            <ChevronRight className='w-4 h-4' />
            Next
          </Button>

          <Button
            onClick={() => setShowCode(!showCode)}
            variant='outline'
            className='flex items-center gap-2'
          >
            <Code className='w-4 h-4' />
            {showCode ? 'Hide' : 'Show'} Code
          </Button>
        </div>

        {/* Status Message */}
        <div className='bg-muted/20 rounded-lg p-3'>
          <p className='text-sm font-medium'>{currentStepData.message}</p>
          {steps.length > 0 && (
            <p className='text-xs text-muted-foreground mt-1'>
              Step {currentStep + 1} of {steps.length}
            </p>
          )}
        </div>

        {/* Code Display */}
        {showCode && (
          <div className='bg-muted/10 rounded-lg p-4 border border-muted/30'>
            <p className='text-xs font-semibold text-muted-foreground mb-2'>
              Algorithm Code
            </p>
            <pre className='text-xs overflow-x-auto font-mono text-foreground/80'>
              <code>{info.code}</code>
            </pre>
          </div>
        )}

        {/* Visualization */}
        <div className='bg-muted/10 rounded-lg p-4'>
          <div className='flex items-center justify-center gap-2 flex-wrap min-h-32'>
            {currentStepData.state.array && (
              <div className='flex items-end justify-center gap-1 h-48'>
                {currentStepData.state.array.map(
                  (value: number, index: number) => {
                    let barColor = 'bg-blue-500';

                    if (currentStepData.highlights?.selected?.includes(index)) {
                      barColor = 'bg-green-500';
                    } else if (
                      currentStepData.highlights?.compared?.includes(index)
                    ) {
                      barColor = 'bg-yellow-500';
                    } else if (currentStepData.highlights?.current === index) {
                      barColor = 'bg-orange-500';
                    }

                    const height = Math.max((value / 10) * 150, 20);

                    return (
                      <div
                        key={index}
                        className={`${barColor} rounded-t transition-all duration-200 flex items-end justify-center text-xs text-white font-semibold`}
                        style={{
                          height: `${height}px`,
                          width: '30px',
                        }}
                      >
                        {value}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* Algorithm Information */}
        <div className='grid md:grid-cols-2 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Algorithm Info</CardTitle>
            </CardHeader>
            <CardContent className='text-sm space-y-2'>
              <p>
                <strong>Name:</strong> {info.name}
              </p>
              <p>
                <strong>Time Complexity:</strong> {info.timeComplexity}
              </p>
              <p>
                <strong>Space Complexity:</strong> {info.spaceComplexity}
              </p>
              <p>
                <strong>Description:</strong> {info.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Statistics</CardTitle>
            </CardHeader>
            <CardContent className='text-sm space-y-2'>
              <p>
                <strong>Total Steps:</strong> {steps.length}
              </p>
              <p>
                <strong>Current Step:</strong> {currentStep + 1}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {!isPlaying ? 'Stopped' : isPaused ? 'Paused' : 'Running'}
              </p>
              <p>
                <strong>Progress:</strong>{' '}
                {steps.length > 0
                  ? Math.round((currentStep / steps.length) * 100)
                  : 0}
                %
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
