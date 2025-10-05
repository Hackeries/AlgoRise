'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AnimationStep {
  array: number[];
  low: number;
  high: number;
  mid: number | null;
  message: string;
}

export function BinarySearchVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(30);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);

  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize sample array
  const initializeArray = () => {
    const sampleArray = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    setArray(sampleArray);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Generate binary search steps
  const generateBinarySearchSteps = () => {
    const newSteps: AnimationStep[] = [];
    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      newSteps.push({
        array: [...array],
        low,
        high,
        mid,
        message: `Checking middle element at index ${mid}: ${array[mid]}`,
      });

      if (array[mid] === target) {
        newSteps.push({
          array: [...array],
          low,
          high,
          mid,
          message: `Target ${target} found at index ${mid}!`,
        });
        break;
      } else if (array[mid] < target) {
        low = mid + 1;
        newSteps.push({
          array: [...array],
          low,
          high,
          mid,
          message: `Target ${target} is greater than ${array[mid]}, moving right`,
        });
      } else {
        high = mid - 1;
        newSteps.push({
          array: [...array],
          low,
          high,
          mid,
          message: `Target ${target} is less than ${array[mid]}, moving left`,
        });
      }
    }

    if (low > high) {
      newSteps.push({
        array: [...array],
        low,
        high,
        mid: null,
        message: `Target ${target} not found in array.`,
      });
    }

    setSteps(newSteps);
    setCurrentStep(0);
  };

  const playAnimation = () => {
    if (steps.length === 0) {
      generateBinarySearchSteps();
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

  const currentStepData = steps[currentStep] || {
    array,
    low: 0,
    high: array.length - 1,
    mid: null,
    message: 'Ready to start Binary Search',
  };

  useEffect(() => {
    initializeArray();
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
          <CardTitle>Binary Search Controls</CardTitle>
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
            <Button onClick={generateBinarySearchSteps} variant='outline'>
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

      {/* Array Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Array Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2 justify-center'>
            {currentStepData.array.map((val, idx) => {
              let bgColor = 'bg-gray-300';
              if (idx === currentStepData.mid) bgColor = 'bg-red-500 text-white';
              else if (idx >= currentStepData.low && idx <= currentStepData.high)
                bgColor = 'bg-green-400 text-white';
              return (
                <div
                  key={idx}
                  className={`w-12 h-12 flex items-center justify-center font-bold rounded ${bgColor}`}
                >
                  {val}
                </div>
              );
            })}
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