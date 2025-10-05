'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface SegmentTreeNode {
  start: number;
  end: number;
  value: number;
  current: boolean;
}

interface AnimationStep {
  tree: SegmentTreeNode[];
  message: string;
  currentNode?: number;
}

export function SegmentTreeVisualizer() {
  const [size, setSize] = useState(8); // Example array size
  const [array, setArray] = useState<number[]>([]);
  const [tree, setTree] = useState<SegmentTreeNode[]>([]);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);

  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize array and segment tree
  const initializeTree = () => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    setArray(arr);

    const segTree: SegmentTreeNode[] = [];
    buildSegmentTree(arr, 0, arr.length - 1, segTree, 0);

    setTree(segTree);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Build segment tree recursively
  const buildSegmentTree = (
    arr: number[],
    start: number,
    end: number,
    segTree: SegmentTreeNode[],
    index: number
  ): number => {
    if (start === end) {
      segTree[index] = { start, end, value: arr[start], current: false };
      return arr[start];
    }

    const mid = Math.floor((start + end) / 2);
    const left = buildSegmentTree(arr, start, mid, segTree, 2 * index + 1);
    const right = buildSegmentTree(arr, mid + 1, end, segTree, 2 * index + 2);
    const value = left + right;
    segTree[index] = { start, end, value, current: false };
    return value;
  };

  // Generate animation steps (example: mark each node as visited)
  const generateSteps = () => {
    const newSteps: AnimationStep[] = tree.map((node, idx) => ({
      tree: tree.map((n, i) => ({ ...n, current: i === idx })),
      message: `Visiting node covering [${node.start}, ${node.end}] with value ${node.value}`,
      currentNode: idx,
    }));

    setSteps(newSteps);
    setCurrentStep(0);
  };

  const playAnimation = () => {
    if (steps.length === 0) {
      generateSteps();
      setTimeout(() => playAnimation(), 100);
      return;
    }

    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(intervalRef.current!);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 - speed * 10);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetAnimation = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const currentStepData = steps[currentStep] || { tree, message: 'Ready to start Segment Tree visualization' };

  useEffect(() => {
    initializeTree();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className='space-y-6'>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Tree Controls</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-4'>
            <Button onClick={isPlaying ? pauseAnimation : playAnimation}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={resetAnimation} variant='outline'>
              <RotateCcw size={16} /> Reset
            </Button>
            <Button onClick={generateSteps} variant='outline'>
              Generate Steps
            </Button>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Animation Speed</label>
            <Slider
              value={[speed]}
              onValueChange={([val]) => setSpeed(val)}
              min={10}
              max={100}
              step={10}
              className='w-full'
            />
            <div className='text-xs text-muted-foreground'>Speed: {speed}ms per step</div>
          </div>
        </CardContent>
      </Card>

      {/* Segment Tree Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Tree Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            {currentStepData.tree.map((node, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 border rounded font-bold text-center ${
                  node.current ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}
              >
                [{node.start},{node.end}]: {node.value}
              </div>
            ))}
          </div>
          <div className='mt-2 text-sm font-medium'>{currentStepData.message}</div>
          <div className='mt-1 text-xs text-muted-foreground'>
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
