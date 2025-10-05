'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface DPCell {
  value: number | string | null;
  previous?: number | string | null;
  current: boolean;
}

interface AnimationStep {
  table: DPCell[][];
  message: string;
  answer?: string;
  stats?: { description: string; timeComplexity: string; spaceComplexity: string };
}

type DPProblem =
  | 'knapsack'
  | 'subset-sum'
  | 'lis'
  | 'count-paths'
  | 'lcs'
  | 'lps'
  | 'rod-cutting'
  | 'edit-distance';

interface DPInfo {
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
}

const DP_INFO: Record<DPProblem, DPInfo> = {
  knapsack: { description: '0-1 Knapsack', timeComplexity: 'O(n*W)', spaceComplexity: 'O(n*W)' },
  'subset-sum': { description: 'Subset Sum', timeComplexity: 'O(n*T)', spaceComplexity: 'O(n*T)' },
  lis: { description: 'Longest Increasing Subsequence', timeComplexity: 'O(n^2)', spaceComplexity: 'O(n)' },
  'count-paths': { description: 'Count Paths in Grid', timeComplexity: 'O(N*M)', spaceComplexity: 'O(N*M)' },
  lcs: { description: 'Longest Common Subsequence', timeComplexity: 'O(n*m)', spaceComplexity: 'O(n*m)' },
  lps: { description: 'Longest Palindromic Subsequence', timeComplexity: 'O(n^2)', spaceComplexity: 'O(n^2)' },
  'rod-cutting': { description: 'Rod Cutting', timeComplexity: 'O(n^2)', spaceComplexity: 'O(n^2)' },
  'edit-distance': { description: 'Edit Distance', timeComplexity: 'O(n*m)', spaceComplexity: 'O(n*m)' },
};

/* -------------------- HELPERS -------------------- */

// Convert a number table to DPCell table with previous values
const tableToCells = (table: number[][], prevTable?: number[][]): DPCell[][] =>
  table.map((row, r) =>
    row.map((val, c) => ({
      value: val,
      previous: prevTable ? prevTable[r][c] : undefined,
      current: false,
    }))
  );
export function DPVisualizer({ defaultProblem = 'knapsack' }: { defaultProblem?: DPProblem }) {
  const [problem, setProblem] = useState<DPProblem>(defaultProblem);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateSteps(problem);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const generateSteps = (p: DPProblem) => {
    let newSteps: AnimationStep[] = [];
    switch (p) {
      case 'knapsack':
        newSteps = generateKnapsackSteps();
        break;
      case 'subset-sum':
        newSteps = generateSubsetSumSteps();
        break;
      case 'lis':
        newSteps = generateLISteps();
        break;
      case 'count-paths':
        newSteps = generateCountPathsSteps();
        break;
      case 'lcs':
        newSteps = generateLCSSteps();
        break;
      case 'lps':
        newSteps = generateLPSSteps();
        break;
      case 'rod-cutting':
        newSteps = generateRodCuttingSteps();
        break;
      case 'edit-distance':
        newSteps = generateEditDistanceSteps();
        break;
    }

    // attach stats
    const stats = DP_INFO[p];
    newSteps = newSteps.map(step => ({ ...step, stats }));
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const play = () => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev + 1 >= steps.length) {
          clearInterval(intervalRef.current!);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const pause = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => setCurrentStep(0);

  /* -------------------- UI -------------------- */
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dynamic Programming Visualizer</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ marginBottom: '1rem' }}>
          {Object.keys(DP_INFO).map(p => (
            <Button key={p} onClick={() => generateSteps(p as DPProblem)} style={{ marginRight: '0.5rem' }}>
              {DP_INFO[p as DPProblem].description}
            </Button>
          ))}
        </div>

        {steps.length > 0 && (
          <div>
            <h3>{steps[currentStep].message}</h3>
            {steps[currentStep].answer && <p><b>Answer:</b> {steps[currentStep].answer}</p>}
            {steps[currentStep].stats && (
              <p>
                <b>Time:</b> {steps[currentStep].stats.timeComplexity}, <b>Space:</b> {steps[currentStep].stats.spaceComplexity}
              </p>
            )}

            <table style={{ borderCollapse: 'collapse', marginTop: '1rem' }}>
              <tbody>
                {steps[currentStep].table.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        style={{
                          border: '1px solid black',
                          padding: '8px',
                          backgroundColor: cell.current ? '#ffeb3b' : '#fff',
                        }}
                      >
                        {cell.value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '1rem' }}>
              <Button onClick={play} style={{ marginRight: '0.5rem' }}>
                <Play /> Play
              </Button>
              <Button onClick={pause} style={{ marginRight: '0.5rem' }}>
                <Pause /> Pause
              </Button>
              <Button onClick={reset}>
                <RotateCcw /> Reset
              </Button>
            </div>

            <p style={{ marginTop: '0.5rem' }}>
              Step {currentStep + 1} / {steps.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------- DP STEP GENERATORS -------------------- */

// --- LIS ---
const generateLISteps = (): AnimationStep[] => {
  const arr = [3, 1, 2, 4];
  const n = arr.length;
  const dp: number[] = Array(n).fill(1);
  const steps: AnimationStep[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const prev = dp[i];
      if (arr[j] < arr[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
      steps.push({
        table: dp.map((v, idx) => [{ value: v, previous: idx === i ? prev : undefined, current: idx === i }]),
        message: `Comparing arr[${j}] = ${arr[j]} with arr[${i}] = ${arr[i]}`,
      });
    }
  }

  steps.push({
    table: dp.map(v => [{ value: v, current: false }]),
    message: 'Final LIS array',
    answer: `LIS length: ${Math.max(...dp)}`,
  });

  return steps;
};

// --- Knapsack ---
const generateKnapsackSteps = (): AnimationStep[] => {
  const items = [
    { weight: 1, value: 1 },
    { weight: 2, value: 2 },
    { weight: 3, value: 5 },
  ];
  const W = 5;
  const n = items.length;
  const table: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  const steps: AnimationStep[] = [];

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      const prev = table[i][w];
      if (items[i - 1].weight <= w) {
        table[i][w] = Math.max(table[i - 1][w], table[i - 1][w - items[i - 1].weight] + items[i - 1].value);
      } else {
        table[i][w] = table[i - 1][w];
      }

      steps.push({
        table: tableToCells(table, table),
        message: `Considering item ${i} (w=${items[i - 1].weight}, v=${items[i - 1].value}) at capacity ${w}`,
        answer: `Current max value: ${table[i][w]}`,
      });
    }
  }

  steps.push({
    table: tableToCells(table),
    message: 'Final DP Table for Knapsack',
    answer: `Max Knapsack Value: ${table[n][W]}`,
  });

  return steps;
};

// --- Subset Sum ---
const generateSubsetSumSteps = (): AnimationStep[] => {
  const arr = [3, 1, 2];
  const T = 4;
  const n = arr.length;
  const table: boolean[][] = Array.from({ length: n + 1 }, () => Array(T + 1).fill(false));
  table[0][0] = true;
  const steps: AnimationStep[] = [];

  for (let i = 1; i <= n; i++) {
    for (let t = 0; t <= T; t++) {
      const prev = table[i][t];
      table[i][t] = table[i - 1][t] || (t - arr[i - 1] >= 0 && table[i - 1][t - arr[i - 1]]);
      steps.push({
        table: table.map(row =>
          row.map(val => ({
            value: val ? '✓' : '✗',
            previous: prev ? '✓' : '✗',
            current: false,
          }))
        ),
        message: `Checking element ${arr[i - 1]} for target ${t}`,
        answer: table[n][T] ? 'Subset exists ✅' : 'Subset does not exist ❌',
      });
    }
  }

  steps.push({
    table: table.map(row => row.map(val => ({ value: val ? '✓' : '✗', current: false }))),
    message: 'Final DP Table for Subset Sum',
    answer: table[n][T] ? 'Subset exists ✅' : 'Subset does not exist ❌',
  });

  return steps;
};

// --- Count Paths ---
const generateCountPathsSteps = (): AnimationStep[] => {
  const N = 3, M = 3;
  const dp: number[][] = Array.from({ length: N }, () => Array(M).fill(0));
  const steps: AnimationStep[] = [];

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      dp[i][j] = i === 0 || j === 0 ? 1 : dp[i - 1][j] + dp[i][j - 1];
      steps.push({
        table: tableToCells(dp),
        message: `Paths to cell [${i},${j}]`,
        answer: `Total paths so far: ${dp[i][j]}`,
      });
    }
  }

  steps.push({
    table: tableToCells(dp),
    message: 'Final DP Table for Count Paths',
    answer: `Total paths: ${dp[N - 1][M - 1]}`,
  });

  return steps;
};

// --- LCS ---
const generateLCSSteps = (): AnimationStep[] => {
  const s = 'abc';
  const t = 'ac';
  const n = s.length, m = t.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  const steps: AnimationStep[] = [];

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (s[i - 1] === t[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);

      steps.push({
        table: tableToCells(dp),
        message: `Comparing s[${i - 1}] = ${s[i - 1]} with t[${j - 1}] = ${t[j - 1]}`,
        answer: `LCS length so far: ${dp[i][j]}`,
      });
    }
  }

  steps.push({
    table: tableToCells(dp),
    message: 'Final DP Table for LCS',
    answer: `LCS length: ${dp[n][m]}`,
  });

  return steps;
};

// --- LPS ---
const generateLPSSteps = (): AnimationStep[] => {
  const s = 'bbab';
  const n = s.length;
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const steps: AnimationStep[] = [];

  for (let i = 0; i < n; i++) dp[i][i] = 1;

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      if (s[i] === s[j]) dp[i][j] = len === 2 ? 2 : dp[i + 1][j - 1] + 2;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);

      steps.push({
        table: tableToCells(dp),
        message: `LPS between indices ${i} and ${j}`,
        answer: `LPS length so far: ${dp[i][j]}`,
      });
    }
  }

  steps.push({
    table: tableToCells(dp),
    message: 'Final DP Table for LPS',
    answer: `LPS length: ${dp[0][n - 1]}`,
  });

  return steps;
};

// --- Rod Cutting ---
const generateRodCuttingSteps = (): AnimationStep[] => {
  const n = 4;
  const cuts = [1, 2, 3];
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  const steps: AnimationStep[] = [];

  for (let l = 2; l <= n; l++) {
    for (let i = 0; i <= n - l; i++) {
      const j = i + l;
      let minCost = Infinity;
      for (const cut of cuts) {
        if (cut > i && cut < j) minCost = Math.min(minCost, dp[i][cut] + dp[cut][j] + (j - i));
      }
      dp[i][j] = minCost === Infinity ? 0 : minCost;
      steps.push({
        table: tableToCells(dp),
        message: `Rod cutting from ${i} to ${j}`,
        answer: `Cost so far: ${dp[i][j]}`,
      });
    }
  }

  steps.push({
    table: tableToCells(dp),
    message: 'Final DP Table for Rod Cutting',
    answer: `Min cutting cost: ${dp[0][n]}`,
  });

  return steps;
};

// --- Edit Distance ---
const generateEditDistanceSteps = (): AnimationStep[] => {
  const s = 'kitten', t = 'sitting';
  const n = s.length, m = t.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  const steps: AnimationStep[] = [];

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (s[i - 1] === t[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);

      steps.push({
        table: tableToCells(dp),
        message: `Edit distance for s[${i - 1}] = ${s[i - 1]} and t[${j - 1}] = ${t[j - 1]}`,
        answer: `Edit distance so far: ${dp[i][j]}`,
      });
    }
  }

  steps.push({
    table: tableToCells(dp),
    message: 'Final DP Table for Edit Distance',
    answer: `Edit Distance: ${dp[n][m]}`,
  });

  return steps;
};



