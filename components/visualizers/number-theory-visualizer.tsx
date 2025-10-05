'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Step {
  number: number;
  factor?: number;
  message: string;
}

export function NumberTheoryVisualizer() {
  const [num, setNum] = useState(60); // Example number
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);

  const intervalRef = useRef<NodeJS.Timeout>();

  // Generate steps for prime factorization
  const generateSteps = () => {
    const newSteps: Step[] = [];
    let n = num;

    for (let i = 2; i <= n; i++) {
      while (n % i === 0) {
        newSteps.push({
          number: n,
          factor: i,
          message: `Factor found: ${i}`,
        });
        n = n / i;
      }
    }

    if (newSteps.length === 0) {
      newSteps.push({
        number: n,
        message: `No factors found (prime number)`,
      });
    }

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

  const currentStepData = steps[currentStep] || { number: num, message: 'Ready to start' };

  useEffect(() => {
    generateSteps();
  }, [num]);

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
          <CardTitle>Number Theory Controls</CardTitle>
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
          <CardTitle>Prime Factorization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center text-lg font-medium'>
            Current number: <strong>{currentStepData.number}</strong>
          </div>
          {currentStepData.factor && (
            <div className='text-center text-green-600 font-bold mt-2'>
              Factor: {currentStepData.factor}
            </div>
          )}
          <div className='mt-2 text-sm font-medium'>{currentStepData.message}</div>
          <div className='mt-1 text-xs text-muted-foreground'>
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
