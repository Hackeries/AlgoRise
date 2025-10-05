'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Item {
  id: number;
  value: number;
  weight: number;
  selected: boolean;
  current: boolean;
}

interface AnimationStep {
  items: Item[];
  message: string;
  currentItem?: number;
}

export function GreedyVisualizer() {
  const [items, setItems] = useState<Item[]>([]);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);

  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize sample items
  const initializeItems = () => {
    const sampleItems: Item[] = [
      { id: 1, value: 60, weight: 10, selected: false, current: false },
      { id: 2, value: 100, weight: 20, selected: false, current: false },
      { id: 3, value: 120, weight: 30, selected: false, current: false },
    ];
    setItems(sampleItems);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Greedy algorithm: Fractional Knapsack (example)
  const generateGreedySteps = () => {
    const newSteps: AnimationStep[] = [];
    const itemsCopy: Item[] = items.map(item => ({ ...item }));

    // Calculate value-to-weight ratio
    itemsCopy.forEach(item => {
      (item as any).ratio = item.value / item.weight;
    });

    // Sort items by ratio descending
    itemsCopy.sort((a, b) => (b as any).ratio - (a as any).ratio);

    newSteps.push({
      items: itemsCopy.map(item => ({ ...item, current: false, selected: false })),
      message: 'Items sorted by value-to-weight ratio',
    });

    let totalWeight = 0;
    const capacity = 50; // Example knapsack capacity

    for (let i = 0; i < itemsCopy.length; i++) {
      const item = itemsCopy[i];
      item.current = true;

      newSteps.push({
        items: itemsCopy.map(it => ({ ...it })),
        message: `Considering item ${item.id} (value: ${item.value}, weight: ${item.weight})`,
        currentItem: item.id,
      });

      if (totalWeight + item.weight <= capacity) {
        item.selected = true;
        totalWeight += item.weight;

        newSteps.push({
          items: itemsCopy.map(it => ({ ...it })),
          message: `Item ${item.id} selected, total weight: ${totalWeight}`,
        });
      } else {
        newSteps.push({
          items: itemsCopy.map(it => ({ ...it })),
          message: `Item ${item.id} skipped, total weight would exceed capacity`,
        });
      }

      item.current = false;
    }

    setSteps(newSteps);
    setCurrentStep(0);
  };

  const playAnimation = () => {
    if (steps.length === 0) {
      generateGreedySteps();
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

  const currentStepData = steps[currentStep] || { items, message: 'Ready to start Greedy Algorithm' };

  useEffect(() => {
    initializeItems();
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
          <CardTitle>Greedy Algorithm Controls</CardTitle>
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
            <Button onClick={generateGreedySteps} variant='outline'>
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

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Greedy Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className='table-auto border-collapse border border-slate-400 w-full text-center'>
            <thead>
              <tr>
                <th className='border border-slate-400 px-4 py-2'>ID</th>
                <th className='border border-slate-400 px-4 py-2'>Value</th>
                <th className='border border-slate-400 px-4 py-2'>Weight</th>
                <th className='border border-slate-400 px-4 py-2'>Selected</th>
              </tr>
            </thead>
            <tbody>
              {currentStepData.items.map(item => (
                <tr key={item.id} className={`${item.current ? 'bg-red-500 text-white' : item.selected ? 'bg-green-500 text-white' : ''}`}>
                  <td className='border border-slate-400 px-4 py-2'>{item.id}</td>
                  <td className='border border-slate-400 px-4 py-2'>{item.value}</td>
                  <td className='border border-slate-400 px-4 py-2'>{item.weight}</td>
                  <td className='border border-slate-400 px-4 py-2'>{item.selected ? '✔' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='mt-2 text-sm font-medium'>{currentStepData.message}</div>
          <div className='mt-1 text-xs text-muted-foreground'>
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}