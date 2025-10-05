'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface BitmaskStep {
  mask: number;
  description: string;
  currentBit?: number;
}

export function BitmaskVisualizer() {
  const [n, setN] = useState(4); // Number of bits
  const [steps, setSteps] = useState<BitmaskStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);

  // Use browser interval ID type (number) instead of NodeJS.Timeout
  const intervalRef = useRef<number | null>(null);

  // Generate all bitmask steps
  const generateSteps = () => {
    const newSteps: BitmaskStep[] = [];
    const totalMasks = 1 << n;

    for (let mask = 0; mask < totalMasks; mask++) {
      newSteps.push({
        mask,
        description: `Current subset: ${mask.toString(2).padStart(n, '0')}`,
        currentBit: mask,
      });
    }

    setSteps(newSteps);
    setCurrentStep(0);
  };

  const playAnimation = () => {
    if (steps.length === 0) {
      generateSteps();
      setTimeout(playAnimation, 100);
      return;
    }

    setIsPlaying(true);
    intervalRef.current = window.setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          pauseAnimation();
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(10, 1000 - speed * 10)); // avoid zero interval
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetAnimation = () => {
    setCurrentStep(0);
    pauseAnimation();
  };

  const currentStepData = steps[currentStep] || { mask: 0, description: 'Ready to visualize bitmasks' };

  useEffect(() => {
    generateSteps();
    return () => pauseAnimation(); // cleanup on unmount
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Bitmask Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={isPlaying ? pauseAnimation : playAnimation}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={resetAnimation} variant="outline">
              <RotateCcw size={16} /> Reset
            </Button>
            <Button onClick={generateSteps} variant="outline">
              Generate Steps
            </Button>
          </div>

          {/* Speed Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Animation Speed</label>
            <Slider
              value={[speed]}
              onValueChange={([val]) => setSpeed(val)}
              min={10}
              max={100}
              step={10}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">Speed: {speed}ms per step</div>
          </div>
        </CardContent>
      </Card>

      {/* Bitmask Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Bitmask Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: n }, (_, i) => (
              <div
                key={i}
                className={`w-10 h-10 flex items-center justify-center border rounded font-bold text-white ${
                  (currentStepData.mask & (1 << i)) !== 0 ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm font-medium">{currentStepData.description}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}