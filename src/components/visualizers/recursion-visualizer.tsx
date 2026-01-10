'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';

interface TreeNode {
  id: string;
  value: string;
  params: string;
  result?: string | number;
  children: TreeNode[];
  depth: number;
  status: 'pending' | 'active' | 'computing' | 'complete';
}

interface RecursionStep {
  tree: TreeNode;
  activeNodeId: string;
  message: string;
  callStack: string[];
}

type RecursionExample = 'fibonacci' | 'factorial' | 'towerOfHanoi' | 'binarySearch';

const RECURSION_EXAMPLES: Record<RecursionExample, { name: string; description: string }> = {
  fibonacci: { name: 'Fibonacci', description: 'Classic recursive Fibonacci sequence' },
  factorial: { name: 'Factorial', description: 'Calculate n! recursively' },
  towerOfHanoi: { name: 'Tower of Hanoi', description: 'Classic recursion puzzle' },
  binarySearch: { name: 'Binary Search', description: 'Recursive binary search' },
};

function generateFibonacciTree(n: number, depth: number = 0, id: string = '0'): TreeNode {
  const node: TreeNode = {
    id,
    value: `fib(${n})`,
    params: `n=${n}`,
    depth,
    children: [],
    status: 'pending',
  };

  if (n <= 1) {
    node.result = n;
    return node;
  }

  node.children = [
    generateFibonacciTree(n - 1, depth + 1, `${id}-0`),
    generateFibonacciTree(n - 2, depth + 1, `${id}-1`),
  ];

  return node;
}

function generateFactorialTree(n: number, depth: number = 0, id: string = '0'): TreeNode {
  const node: TreeNode = {
    id,
    value: `fact(${n})`,
    params: `n=${n}`,
    depth,
    children: [],
    status: 'pending',
  };

  if (n <= 1) {
    node.result = 1;
    return node;
  }

  node.children = [generateFactorialTree(n - 1, depth + 1, `${id}-0`)];

  return node;
}

function* generateRecursionSteps(tree: TreeNode): Generator<RecursionStep> {
  const stack: { node: TreeNode; phase: 'enter' | 'compute' | 'exit' }[] = [{ node: tree, phase: 'enter' }];
  const callStack: string[] = [];

  while (stack.length > 0) {
    const { node, phase } = stack.pop()!;

    if (phase === 'enter') {
      node.status = 'active';
      callStack.push(node.value);

      yield {
        tree: JSON.parse(JSON.stringify(tree)),
        activeNodeId: node.id,
        message: `Calling ${node.value}`,
        callStack: [...callStack],
      };

      if (node.children.length === 0) {
        // Base case
        node.status = 'computing';
        yield {
          tree: JSON.parse(JSON.stringify(tree)),
          activeNodeId: node.id,
          message: `Base case: ${node.value} = ${node.result}`,
          callStack: [...callStack],
        };

        node.status = 'complete';
        callStack.pop();

        yield {
          tree: JSON.parse(JSON.stringify(tree)),
          activeNodeId: node.id,
          message: `Returning ${node.result}`,
          callStack: [...callStack],
        };
      } else {
        // Push exit phase and children
        stack.push({ node, phase: 'compute' });
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({ node: node.children[i], phase: 'enter' });
        }
      }
    } else if (phase === 'compute') {
      node.status = 'computing';
      
      // Calculate result based on children
      if (node.value.startsWith('fib')) {
        node.result = (node.children[0].result as number) + (node.children[1].result as number);
      } else if (node.value.startsWith('fact')) {
        const n = parseInt(node.params.split('=')[1]);
        node.result = n * (node.children[0].result as number);
      }

      yield {
        tree: JSON.parse(JSON.stringify(tree)),
        activeNodeId: node.id,
        message: `Computing ${node.value} = ${node.result}`,
        callStack: [...callStack],
      };

      node.status = 'complete';
      callStack.pop();

      yield {
        tree: JSON.parse(JSON.stringify(tree)),
        activeNodeId: node.id,
        message: `${node.value} complete, returning ${node.result}`,
        callStack: [...callStack],
      };
    }
  }
}

function TreeNodeComponent({ 
  node, 
  activeNodeId 
}: { 
  node: TreeNode; 
  activeNodeId: string;
}) {
  const isActive = node.id === activeNodeId;
  
  const statusColors = {
    pending: 'bg-slate-200 dark:bg-slate-700 border-slate-300',
    active: 'bg-yellow-200 dark:bg-yellow-800 border-yellow-400 animate-pulse',
    computing: 'bg-blue-200 dark:bg-blue-800 border-blue-400',
    complete: 'bg-green-200 dark:bg-green-800 border-green-400',
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          px-3 py-2 rounded-lg border-2 text-xs font-mono transition-all duration-300
          ${statusColors[node.status]}
          ${isActive ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''}
        `}
      >
        <div className="font-semibold">{node.value}</div>
        {node.result !== undefined && (
          <div className="text-center text-xs opacity-70">= {node.result}</div>
        )}
      </div>
      
      {node.children.length > 0 && (
        <div className="mt-2 pt-2 border-t-2 border-slate-300 dark:border-slate-600">
          <div className="flex gap-4">
            {node.children.map((child) => (
              <TreeNodeComponent key={child.id} node={child} activeNodeId={activeNodeId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RecursionVisualizer() {
  const [example, setExample] = useState<RecursionExample>('fibonacci');
  const [inputValue, setInputValue] = useState(5);
  const [steps, setSteps] = useState<RecursionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const generateSteps = useCallback(() => {
    let tree: TreeNode;
    
    switch (example) {
      case 'fibonacci':
        tree = generateFibonacciTree(Math.min(inputValue, 7)); // Limit to prevent too large trees
        break;
      case 'factorial':
        tree = generateFactorialTree(Math.min(inputValue, 8));
        break;
      default:
        tree = generateFibonacciTree(5);
    }

    const newSteps: RecursionStep[] = [];
    const generator = generateRecursionSteps(tree);
    
    for (const step of generator) {
      newSteps.push(step);
    }

    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [example, inputValue]);

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
    }, 1500 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  const currentStepData = steps[currentStep];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recursion Visualizer</CardTitle>
        <CardDescription>
          Watch how recursive calls build and unwind the call stack
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Algorithm</label>
            <Select value={example} onValueChange={(v) => setExample(v as RecursionExample)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RECURSION_EXAMPLES).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Input (n={inputValue})</label>
            <Slider
              value={[inputValue]}
              onValueChange={([v]) => setInputValue(v)}
              min={1}
              max={example === 'fibonacci' ? 7 : 8}
              step={1}
            />
          </div>

          <div>
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

        {/* Visualization Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tree View */}
          <div className="lg:col-span-2 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-x-auto min-h-[300px]">
            {currentStepData && (
              <div className="flex justify-center">
                <TreeNodeComponent 
                  node={currentStepData.tree} 
                  activeNodeId={currentStepData.activeNodeId} 
                />
              </div>
            )}
          </div>

          {/* Call Stack */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h4 className="font-medium mb-3 text-sm">Call Stack</h4>
            <div className="space-y-1">
              {currentStepData?.callStack.slice().reverse().map((call, i) => (
                <div
                  key={i}
                  className={`
                    p-2 rounded text-xs font-mono
                    ${i === 0 ? 'bg-yellow-200 dark:bg-yellow-800' : 'bg-slate-200 dark:bg-slate-700'}
                  `}
                >
                  {call}
                </div>
              ))}
              {(currentStepData?.callStack.length || 0) === 0 && (
                <div className="text-muted-foreground text-xs italic">Empty</div>
              )}
            </div>
          </div>
        </div>

        {/* Current Step Message */}
        {currentStepData && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium">{currentStepData.message}</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 border border-slate-300" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-800 border border-yellow-400" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-800 border border-blue-400" />
            <span>Computing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-800 border border-green-400" />
            <span>Complete</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecursionVisualizer;
