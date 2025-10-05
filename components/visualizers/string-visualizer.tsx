'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface StringStep {
  string: string;
  highlightedIndex?: number;
  message: string;
}

export function StringVisualizer() {
  const [inputString, setInputString] = useState('HELLO');
  const [steps, setSteps] = useState<StringStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);

  const intervalRef = useRef<NodeJS.Timeout>();

  const generateSteps = () => {
    const newSteps: StringStep[] = [];
    const strArr = inputString.split('');

    for (let i = 0; i < strArr.length; i++) {
      const highlighted = strArr.map((ch, idx) => idx === i ? ch.toLowerCase() : ch).join('');
      newSteps.push({
        string: highlighted,
        highlightedIndex: i,
        message: `Highlighting character at index ${i}: "${strArr[i]}"`,
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

  const currentStepData = steps[currentStep] || { string: inputString, message: 'Ready to start string visualization' };

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
          <CardTitle>String Controls</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-4'>
            <input
              type='text'
              value={inputString}
              onChange={e => setInputString(e.target.value.toUpperCase())}
              className='border rounded px-2 py-1'
            />
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
          <CardTitle>String Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-mono mb-2'>
            {currentStepData.string.split('').map((ch, idx) => (
              <span
                key={idx}
                className={idx === currentStepData.highlightedIndex ? 'text-red-500 font-bold' : ''}
              >
                {ch}
              </span>
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