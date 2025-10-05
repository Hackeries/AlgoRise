'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface UFStep {
  parents: number[];
  ranks: number[];
  description: string;
  mergedPair?: [number, number];
}

export function UnionFindVisualizer() {
  const [n, setN] = useState(5); // Number of nodes
  const [steps, setSteps] = useState<UFStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);

  const intervalRef = useRef<NodeJS.Timeout>();

  const generateSteps = () => {
    const parents: number[] = Array.from({ length: n }, (_, i) => i);
    const ranks: number[] = Array(n).fill(0);
    const newSteps: UFStep[] = [];

    const find = (x: number): number => {
      if (parents[x] !== x) parents[x] = find(parents[x]);
      return parents[x];
    };

    const union = (x: number, y: number) => {
      const rootX = find(x);
      const rootY = find(y);
      if (rootX === rootY) return;

      if (ranks[rootX] < ranks[rootY]) {
        parents[rootX] = rootY;
      } else if (ranks[rootX] > ranks[rootY]) {
        parents[rootY] = rootX;
      } else {
        parents[rootY] = rootX;
        ranks[rootX]++;
      }

      newSteps.push({
        parents: [...parents],
        ranks: [...ranks],
        description: `Union nodes ${x} and ${y}`,
        mergedPair: [x, y],
      });
    };

    // Example unions
    union(0, 1);
    union(2, 3);
    union(1, 2);
    union(3, 4);

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

  const currentStepData = steps[currentStep] || { parents: Array(n).fill(0).map((_, i) => i), ranks: Array(n).fill(0), description: 'Ready to start Union-Find' };

  useEffect(() => {
    generateSteps();
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
          <CardTitle>Union-Find Controls</CardTitle>
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

          {/* Speed Slider */}
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

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Union-Find State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            {currentStepData.parents.map((p, i) => (
              <div key={i} className='w-12 h-12 flex flex-col items-center justify-center border rounded bg-gray-200'>
                <div className='font-bold'>Node {i}</div>
                <div className='text-sm'>Parent: {p}</div>
                <div className='text-xs'>Rank: {currentStepData.ranks[i]}</div>
              </div>
            ))}
          </div>
          {currentStepData.mergedPair && (
            <div className='mt-2 text-sm font-medium'>
              Merged nodes: {currentStepData.mergedPair[0]} & {currentStepData.mergedPair[1]}
            </div>
          )}
          <div className='mt-2 text-sm font-medium'>{currentStepData.description}</div>
          <div className='mt-1 text-xs text-muted-foreground'>
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}