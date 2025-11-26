'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DPStep {
  table: number[][];
  currentCell: [number, number] | null;
  highlightedCells: [number, number][];
  message: string;
  decisionInfo?: string;
}

type DPExample = 'knapsack' | 'lcs' | 'editDistance' | 'coinChange';

const DP_EXAMPLES: Record<DPExample, { 
  name: string; 
  description: string;
  rowLabel: string;
  colLabel: string;
}> = {
  knapsack: { 
    name: '0/1 Knapsack', 
    description: 'Find maximum value that fits in capacity',
    rowLabel: 'Items',
    colLabel: 'Capacity',
  },
  lcs: { 
    name: 'Longest Common Subsequence', 
    description: 'Find longest common subsequence of two strings',
    rowLabel: 'String 1',
    colLabel: 'String 2',
  },
  editDistance: { 
    name: 'Edit Distance', 
    description: 'Minimum operations to transform one string to another',
    rowLabel: 'Source',
    colLabel: 'Target',
  },
  coinChange: { 
    name: 'Coin Change', 
    description: 'Minimum coins needed to make amount',
    rowLabel: 'Coins',
    colLabel: 'Amount',
  },
};

function* generateKnapsackSteps(weights: number[], values: number[], capacity: number): Generator<DPStep> {
  const n = weights.length;
  const dp: number[][] = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));

  yield {
    table: dp.map(row => [...row]),
    currentCell: null,
    highlightedCells: [],
    message: 'Initialize DP table with zeros',
  };

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      const currentWeight = weights[i - 1];
      const currentValue = values[i - 1];
      
      yield {
        table: dp.map(row => [...row]),
        currentCell: [i, w],
        highlightedCells: [[i - 1, w]],
        message: `Item ${i} (w=${currentWeight}, v=${currentValue}), Capacity=${w}`,
        decisionInfo: `Can we include item ${i}? Weight ${currentWeight} ${currentWeight <= w ? '≤' : '>'} Capacity ${w}`,
      };

      if (currentWeight <= w) {
        const include = currentValue + dp[i - 1][w - currentWeight];
        const exclude = dp[i - 1][w];
        
        yield {
          table: dp.map(row => [...row]),
          currentCell: [i, w],
          highlightedCells: [[i - 1, w], [i - 1, w - currentWeight]],
          message: `Include: ${currentValue} + dp[${i-1}][${w-currentWeight}] = ${include}. Exclude: ${exclude}`,
          decisionInfo: `max(${include}, ${exclude}) = ${Math.max(include, exclude)}`,
        };

        dp[i][w] = Math.max(include, exclude);
      } else {
        dp[i][w] = dp[i - 1][w];
        
        yield {
          table: dp.map(row => [...row]),
          currentCell: [i, w],
          highlightedCells: [[i - 1, w]],
          message: `Item too heavy, copy from above: ${dp[i - 1][w]}`,
        };
      }

      yield {
        table: dp.map(row => [...row]),
        currentCell: [i, w],
        highlightedCells: [],
        message: `dp[${i}][${w}] = ${dp[i][w]}`,
      };
    }
  }

  yield {
    table: dp.map(row => [...row]),
    currentCell: [n, capacity],
    highlightedCells: [[n, capacity]],
    message: `Maximum value: ${dp[n][capacity]}`,
  };
}

function* generateLCSSteps(str1: string, str2: string): Generator<DPStep> {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  yield {
    table: dp.map(row => [...row]),
    currentCell: null,
    highlightedCells: [],
    message: `Finding LCS of "${str1}" and "${str2}"`,
  };

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      yield {
        table: dp.map(row => [...row]),
        currentCell: [i, j],
        highlightedCells: [],
        message: `Comparing '${str1[i-1]}' with '${str2[j-1]}'`,
      };

      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        
        yield {
          table: dp.map(row => [...row]),
          currentCell: [i, j],
          highlightedCells: [[i - 1, j - 1]],
          message: `Match! dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}`,
        };
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        
        yield {
          table: dp.map(row => [...row]),
          currentCell: [i, j],
          highlightedCells: [[i - 1, j], [i, j - 1]],
          message: `No match. max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`,
        };
      }
    }
  }

  yield {
    table: dp.map(row => [...row]),
    currentCell: [m, n],
    highlightedCells: [[m, n]],
    message: `LCS length: ${dp[m][n]}`,
  };
}

export function DPTableVisualizer() {
  const [example, setExample] = useState<DPExample>('knapsack');
  const [steps, setSteps] = useState<DPStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const generateSteps = useCallback(() => {
    const newSteps: DPStep[] = [];
    let generator: Generator<DPStep>;

    switch (example) {
      case 'knapsack':
        generator = generateKnapsackSteps([2, 3, 4, 5], [3, 4, 5, 6], 7);
        break;
      case 'lcs':
        generator = generateLCSSteps('ABCD', 'AEBD');
        break;
      default:
        generator = generateKnapsackSteps([2, 3, 4], [3, 4, 5], 5);
    }

    for (const step of generator) {
      newSteps.push(step);
    }

    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [example]);

  useEffect(() => {
    generateSteps();
  }, [generateSteps]);

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
    }, 1200 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  const currentStepData = steps[currentStep];
  const exampleInfo = DP_EXAMPLES[example];

  const isCellHighlighted = (row: number, col: number) => {
    return currentStepData?.highlightedCells.some(([r, c]) => r === row && c === col);
  };

  const isCurrentCell = (row: number, col: number) => {
    return currentStepData?.currentCell?.[0] === row && currentStepData?.currentCell?.[1] === col;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DP Table Visualizer</CardTitle>
        <CardDescription>
          Watch dynamic programming solutions build step by step
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Problem</label>
            <Select value={example} onValueChange={(v) => setExample(v as DPExample)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DP_EXAMPLES).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Speed: {speed}x</label>
            <Slider
              value={[speed]}
              onValueChange={([v]) => setSpeed(v)}
              min={0.5}
              max={3}
              step={0.5}
            />
          </div>
        </div>

        {/* Problem Description */}
        <div className="p-3 bg-muted rounded-lg text-sm">
          {exampleInfo.description}
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setIsPlaying(true)} disabled={isPlaying} size="sm">
            <Play className="w-4 h-4 mr-2" /> Play
          </Button>
          <Button onClick={() => setIsPlaying(false)} disabled={!isPlaying} variant="outline" size="sm">
            <Pause className="w-4 h-4 mr-2" /> Pause
          </Button>
          <Button 
            onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))} 
            disabled={isPlaying || currentStep >= steps.length - 1} 
            variant="outline" 
            size="sm"
          >
            <StepForward className="w-4 h-4 mr-2" /> Step
          </Button>
          <Button onClick={generateSteps} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>

        {/* Step Slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Step: {currentStep + 1} / {steps.length}
          </label>
          <Slider
            value={[currentStep]}
            onValueChange={([v]) => setCurrentStep(v)}
            min={0}
            max={steps.length - 1}
            step={1}
          />
        </div>

        {/* DP Table */}
        <div className="overflow-x-auto">
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg inline-block min-w-full">
            {currentStepData && (
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs text-muted-foreground">{exampleInfo.rowLabel}/{exampleInfo.colLabel}</th>
                    {currentStepData.table[0].map((_, j) => (
                      <th key={j} className="p-2 text-xs font-mono text-muted-foreground">{j}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentStepData.table.map((row, i) => (
                    <tr key={i}>
                      <td className="p-2 text-xs font-mono text-muted-foreground">{i}</td>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={cn(
                            'w-10 h-10 text-center font-mono text-sm border transition-all duration-300',
                            isCurrentCell(i, j) && 'bg-yellow-200 dark:bg-yellow-800 border-yellow-400 ring-2 ring-yellow-500 scale-110',
                            isCellHighlighted(i, j) && !isCurrentCell(i, j) && 'bg-blue-200 dark:bg-blue-800 border-blue-400',
                            !isCurrentCell(i, j) && !isCellHighlighted(i, j) && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Step Message */}
        {currentStepData && (
          <div className="space-y-2">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium">{currentStepData.message}</p>
            </div>
            {currentStepData.decisionInfo && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-purple-700 dark:text-purple-300">{currentStepData.decisionInfo}</p>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-800 border border-yellow-400" />
            <span>Current Cell</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-800 border border-blue-400" />
            <span>Referenced Cells</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DPTableVisualizer;
