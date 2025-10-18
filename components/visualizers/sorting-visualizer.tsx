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
import { Play, Pause, Square, RotateCcw, Shuffle, Code } from 'lucide-react';

type SortingAlgorithm =
  | 'bubble'
  | 'selection'
  | 'insertion'
  | 'merge'
  | 'quick'
  | 'heap';

interface AnimationStep {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivot?: number;
  message?: string;
}

const ALGORITHM_CODE: Record<SortingAlgorithm, string> = {
  bubble: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  selection: `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
  insertion: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
  merge: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,
  quick: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}`,
  heap: `function heapSort(arr) {
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    heapify(arr, arr.length, i);
  }
  for (let i = arr.length - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}`,
};

const ALGORITHM_INFO: Record<
  SortingAlgorithm,
  { time: string; space: string; stable: boolean; description: string }
> = {
  bubble: {
    time: 'O(n²)',
    space: 'O(1)',
    stable: true,
    description:
      'Repeatedly compares adjacent elements and swaps them if they are in the wrong order. Simple but inefficient for large datasets.',
  },
  selection: {
    time: 'O(n²)',
    space: 'O(1)',
    stable: false,
    description:
      'Finds the minimum element and places it at the beginning, then repeats for the remaining array.',
  },
  insertion: {
    time: 'O(n²)',
    space: 'O(1)',
    stable: true,
    description:
      'Builds the sorted array one item at a time by inserting elements into their correct position.',
  },
  merge: {
    time: 'O(n log n)',
    space: 'O(n)',
    stable: true,
    description:
      'Divides the array in half, recursively sorts each half, then merges them back together.',
  },
  quick: {
    time: 'O(n log n) avg, O(n²) worst',
    space: 'O(log n)',
    stable: false,
    description:
      'Divides array around a pivot, recursively sorts smaller and larger elements.',
  },
  heap: {
    time: 'O(n log n)',
    space: 'O(1)',
    stable: false,
    description:
      'Builds a max heap and repeatedly extracts the maximum element to build the sorted array.',
  },
};

export function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(20);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize random array
  const generateRandomArray = () => {
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 300) + 10
    );
    setArray(newArray);
    setSteps([{ array: newArray }]);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Generate array when size changes
  useEffect(() => {
    generateRandomArray();
  }, [arraySize]);

  const insertionSort = (arr: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [
      { array: [...arr], message: 'Starting Insertion Sort...' },
    ];
    const workingArray: number[] = [...arr];

    for (let i = 1; i < workingArray.length; i++) {
      const key = workingArray[i]!;
      let j = i - 1;

      steps.push({
        array: [...workingArray],
        comparing: [i],
        message: `Inserting element ${key} at position ${i}`,
      });

      while (j >= 0 && workingArray[j]! > key) {
        steps.push({
          array: [...workingArray],
          comparing: [j, j + 1],
          message: `${workingArray[j]} > ${key}, shifting right`,
        });

        workingArray[j + 1] = workingArray[j]!;
        j--;

        steps.push({
          array: [...workingArray],
          message: `Shifted element at position ${j + 1}`,
        });
      }

      workingArray[j + 1] = key;

      steps.push({
        array: [...workingArray],
        sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
        message: `Element ${key} inserted. First ${i + 1} elements are sorted.`,
      });
    }

    steps.push({
      array: [...workingArray],
      sorted: workingArray.map((_, idx) => idx),
      message: 'Insertion Sort completed!',
    });

    return steps;
  };

  const mergeSort = (arr: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [
      { array: [...arr], message: 'Starting Merge Sort...' },
    ];
    const workingArray: number[] = [...arr];

    const merge = (left: number, mid: number, right: number) => {
      const leftArr = workingArray.slice(left, mid + 1);
      const rightArr = workingArray.slice(mid + 1, right + 1);
      let i = 0,
        j = 0,
        k = left;

      while (i < leftArr.length && j < rightArr.length) {
        steps.push({
          array: [...workingArray],
          comparing: [left + i, mid + 1 + j],
          message: `Comparing ${leftArr[i]} and ${rightArr[j]}`,
        });

        if (leftArr[i]! <= rightArr[j]!) {
          workingArray[k] = leftArr[i]!;
          i++;
        } else {
          workingArray[k] = rightArr[j]!;
          j++;
        }
        k++;

        steps.push({
          array: [...workingArray],
          message: `Merged elements`,
        });
      }

      while (i < leftArr.length) {
        workingArray[k] = leftArr[i]!;
        i++;
        k++;
      }

      while (j < rightArr.length) {
        workingArray[k] = rightArr[j]!;
        j++;
        k++;
      }

      steps.push({
        array: [...workingArray],
        sorted: Array.from(
          { length: right - left + 1 },
          (_, idx) => left + idx
        ),
        message: `Merged range [${left}, ${right}]`,
      });
    };

    const mergeSortRecursive = (left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSortRecursive(left, mid);
        mergeSortRecursive(mid + 1, right);
        merge(left, mid, right);
      }
    };

    mergeSortRecursive(0, workingArray.length - 1);

    steps.push({
      array: [...workingArray],
      sorted: workingArray.map((_, idx) => idx),
      message: 'Merge Sort completed!',
    });

    return steps;
  };

  const heapSort = (arr: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [
      { array: [...arr], message: 'Starting Heap Sort...' },
    ];
    const workingArray: number[] = [...arr];

    const heapify = (n: number, i: number) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && workingArray[left]! > workingArray[largest]!) {
        largest = left;
      }

      if (right < n && workingArray[right]! > workingArray[largest]!) {
        largest = right;
      }

      if (largest !== i) {
        steps.push({
          array: [...workingArray],
          swapping: [i, largest],
          message: `Swapping ${workingArray[i]} and ${workingArray[largest]}`,
        });

        const temp = workingArray[i]!;
        workingArray[i] = workingArray[largest]!;
        workingArray[largest] = temp;

        heapify(n, largest);
      }
    };

    // Build max heap
    for (let i = Math.floor(workingArray.length / 2) - 1; i >= 0; i--) {
      heapify(workingArray.length, i);
    }

    steps.push({
      array: [...workingArray],
      message: 'Max heap built',
    });

    // Extract elements from heap
    for (let i = workingArray.length - 1; i > 0; i--) {
      steps.push({
        array: [...workingArray],
        swapping: [0, i],
        message: `Moving root ${workingArray[0]} to position ${i}`,
      });

      const temp = workingArray[0]!;
      workingArray[0] = workingArray[i]!;
      workingArray[i] = temp;

      steps.push({
        array: [...workingArray],
        sorted: Array.from(
          { length: workingArray.length - i },
          (_, idx) => i + idx
        ),
        message: `Heapifying remaining elements`,
      });

      heapify(i, 0);
    }

    steps.push({
      array: [...workingArray],
      sorted: workingArray.map((_, idx) => idx),
      message: 'Heap Sort completed!',
    });

    return steps;
  };

  // Start sorting animation
  const startSorting = () => {
    let sortSteps: AnimationStep[] = [];

    switch (algorithm) {
      case 'bubble':
        sortSteps = bubbleSort(array);
        break;
      case 'selection':
        sortSteps = selectionSort(array);
        break;
      case 'insertion':
        sortSteps = insertionSort(array);
        break;
      case 'merge':
        sortSteps = mergeSort(array);
        break;
      case 'quick':
        sortSteps = quickSort(array);
        break;
      case 'heap':
        sortSteps = heapSort(array);
        break;
      default:
        sortSteps = bubbleSort(array);
    }

    setSteps(sortSteps);
    setCurrentStep(0);
    setIsPlaying(true);
    setIsPaused(false);
    setIsCompleted(false);
  };

  // Animation control
  useEffect(() => {
    if (isPlaying && !isPaused && currentStep < steps.length - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 - speed * 9);
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      setIsPlaying(false);
      setIsCompleted(true);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, isPaused, currentStep, steps.length, speed]);

  const pause = () => {
    setIsPaused(!isPaused);
  };

  const stop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    setIsCompleted(false);
  };

  const reset = () => {
    stop();
    generateRandomArray();
  };

  const currentStepData = steps[currentStep] || {
    array,
    message: 'Ready to sort',
  };

  const bubbleSort = (arr: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [
      { array: [...arr], message: 'Starting Bubble Sort...' },
    ];
    const n = arr.length;
    const workingArray: number[] = [...arr];

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          array: [...workingArray],
          comparing: [j, j + 1],
          message: `Comparing elements at positions ${j} and ${j + 1}`,
        });

        if (workingArray[j]! > workingArray[j + 1]!) {
          steps.push({
            array: [...workingArray],
            swapping: [j, j + 1],
            message: `Swapping ${workingArray[j]} and ${workingArray[j + 1]}`,
          });

          const temp = workingArray[j]!;
          workingArray[j] = workingArray[j + 1]!;
          workingArray[j + 1] = temp;

          steps.push({
            array: [...workingArray],
            message: `Swapped! Array after swap`,
          });
        }
      }

      steps.push({
        array: [...workingArray],
        sorted: workingArray
          .map((_, idx) => (idx >= n - i - 1 ? idx : -1))
          .filter(idx => idx !== -1),
        message: `Element at position ${
          n - i - 1
        } is now in its final position`,
      });
    }

    steps.push({
      array: [...workingArray],
      sorted: workingArray.map((_, idx) => idx),
      message: 'Bubble Sort completed! All elements are sorted.',
    });

    return steps;
  };

  const selectionSort = (arr: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [
      { array: [...arr], message: 'Starting Selection Sort...' },
    ];
    const n = arr.length;
    const workingArray: number[] = [...arr];

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      steps.push({
        array: [...workingArray],
        comparing: [i],
        message: `Finding minimum element from position ${i} onwards`,
      });

      for (let j = i + 1; j < n; j++) {
        steps.push({
          array: [...workingArray],
          comparing: [minIdx, j],
          message: `Comparing ${workingArray[minIdx]} and ${workingArray[j]}`,
        });

        if (workingArray[j]! < workingArray[minIdx]!) {
          minIdx = j;
          steps.push({
            array: [...workingArray],
            comparing: [minIdx],
            message: `New minimum found: ${workingArray[minIdx]} at position ${minIdx}`,
          });
        }
      }

      if (minIdx !== i) {
        steps.push({
          array: [...workingArray],
          swapping: [i, minIdx],
          message: `Swapping ${workingArray[i]} and ${workingArray[minIdx]}`,
        });

        const temp = workingArray[i]!;
        workingArray[i] = workingArray[minIdx]!;
        workingArray[minIdx] = temp;
      }

      steps.push({
        array: [...workingArray],
        sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
        message: `Position ${i} now has its final value: ${workingArray[i]}`,
      });
    }

    steps.push({
      array: [...workingArray],
      sorted: workingArray.map((_, idx) => idx),
      message: 'Selection Sort completed!',
    });

    return steps;
  };

  const quickSort = (arr: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [
      { array: [...arr], message: 'Starting Quick Sort...' },
    ];
    const workingArray: number[] = [...arr];

    const partition = (low: number, high: number): number => {
      const pivot = workingArray[high];
      steps.push({
        array: [...workingArray],
        pivot: high,
        message: `Choosing pivot: ${pivot} at position ${high}`,
      });

      let i = low - 1;

      for (let j = low; j < high; j++) {
        steps.push({
          array: [...workingArray],
          comparing: [j, high],
          pivot: high,
          message: `Comparing ${workingArray[j]} with pivot ${pivot}`,
        });

        if (workingArray[j]! < pivot) {
          i++;
          steps.push({
            array: [...workingArray],
            swapping: [i, j],
            pivot: high,
            message: `${workingArray[j]} < ${pivot}, swapping positions ${i} and ${j}`,
          });

          const temp = workingArray[i]!;
          workingArray[i] = workingArray[j]!;
          workingArray[j] = temp;

          steps.push({
            array: [...workingArray],
            pivot: high,
            message: `Swapped! Elements ≤ ${pivot} are moving to the left`,
          });
        }
      }

      steps.push({
        array: [...workingArray],
        swapping: [i + 1, high],
        message: `Placing pivot ${pivot} in its final position`,
      });

      const temp = workingArray[i + 1]!;
      workingArray[i + 1] = workingArray[high]!;
      workingArray[high] = temp;

      steps.push({
        array: [...workingArray],
        sorted: [i + 1],
        message: `Pivot ${pivot} is now in its correct position at ${i + 1}`,
      });

      return i + 1;
    };

    const quickSortRecursive = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        quickSortRecursive(low, pi - 1);
        quickSortRecursive(pi + 1, high);
      }
    };

    quickSortRecursive(0, workingArray.length - 1);

    steps.push({
      array: [...workingArray],
      sorted: workingArray.map((_, idx) => idx),
      message: 'Quick Sort completed!',
    });

    return steps;
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='text-2xl'>Sorting Algorithm Visualizer</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Controls */}
        <div className='flex flex-wrap gap-4 items-center'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Algorithm:</label>
            <Select
              value={algorithm}
              onValueChange={(value: SortingAlgorithm) => setAlgorithm(value)}
              disabled={isPlaying}
            >
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bubble'>Bubble Sort</SelectItem>
                <SelectItem value='selection'>Selection Sort</SelectItem>
                <SelectItem value='insertion'>Insertion Sort</SelectItem>
                <SelectItem value='merge'>Merge Sort</SelectItem>
                <SelectItem value='quick'>Quick Sort</SelectItem>
                <SelectItem value='heap'>Heap Sort</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Size:</label>
            <Slider
              value={[arraySize]}
              onValueChange={([value]) => setArraySize(value)}
              min={5}
              max={50}
              step={1}
              className='w-24'
              disabled={isPlaying}
            />
            <span className='text-sm text-muted-foreground w-6'>
              {arraySize}
            </span>
          </div>

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
            <Button onClick={startSorting} className='flex items-center gap-2'>
              <Play className='w-4 h-4' />
              Start
            </Button>
          ) : (
            <Button
              onClick={pause}
              variant='outline'
              className='flex items-center gap-2'
            >
              <Pause className='w-4 h-4' />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}

          <Button
            onClick={stop}
            variant='outline'
            className='flex items-center gap-2'
          >
            <Square className='w-4 h-4' />
            Stop
          </Button>

          <Button
            onClick={reset}
            variant='outline'
            className='flex items-center gap-2'
          >
            <RotateCcw className='w-4 h-4' />
            Reset
          </Button>

          <Button
            onClick={generateRandomArray}
            variant='outline'
            className='flex items-center gap-2'
            disabled={isPlaying}
          >
            <Shuffle className='w-4 h-4' />
            Shuffle
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
          <p className='text-sm font-medium'>
            {currentStepData.message || 'Ready to start sorting'}
          </p>
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
              <code>{ALGORITHM_CODE[algorithm]}</code>
            </pre>
          </div>
        )}

        {/* Visualization */}
        <div className='bg-muted/10 rounded-lg p-4'>
          <div
            className='flex items-end justify-center gap-1 h-80'
            style={{ minHeight: '320px' }}
          >
            {currentStepData.array.map((value, index) => {
              let barColor = 'bg-blue-500';

              if (currentStepData.sorted?.includes(index)) {
                barColor = 'bg-green-500';
              } else if (currentStepData.swapping?.includes(index)) {
                barColor = 'bg-red-500';
              } else if (currentStepData.comparing?.includes(index)) {
                barColor = 'bg-yellow-500';
              } else if (currentStepData.pivot === index) {
                barColor = 'bg-purple-500';
              }

              const height = Math.max((value / 300) * 250, 20);

              return (
                <div
                  key={index}
                  className={`${barColor} rounded-t transition-all duration-200 flex items-end justify-center text-xs text-white font-semibold`}
                  style={{
                    height: `${height}px`,
                    width: `${Math.max(300 / arraySize, 8)}px`,
                  }}
                >
                  {arraySize <= 20 ? value : ''}
                </div>
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
              <span>Pivot</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-green-500 rounded'></div>
              <span>Sorted</span>
            </div>
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
                <strong>Time Complexity:</strong>{' '}
                {ALGORITHM_INFO[algorithm].time}
              </p>
              <p>
                <strong>Space Complexity:</strong>{' '}
                {ALGORITHM_INFO[algorithm].space}
              </p>
              <p>
                <strong>Stable:</strong>{' '}
                {ALGORITHM_INFO[algorithm].stable ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Description:</strong>{' '}
                {ALGORITHM_INFO[algorithm].description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Statistics</CardTitle>
            </CardHeader>
            <CardContent className='text-sm space-y-2'>
              <p>
                <strong>Array Size:</strong> {arraySize} elements
              </p>
              <p>
                <strong>Total Steps:</strong> {steps.length}
              </p>
              <p>
                <strong>Current Step:</strong> {currentStep + 1}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {isCompleted
                  ? 'Completed'
                  : isPlaying
                  ? isPaused
                    ? 'Paused'
                    : 'Running'
                  : 'Ready'}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
