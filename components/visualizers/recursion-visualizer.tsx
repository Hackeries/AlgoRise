'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface RecursionStep {
  stack: string[];
  message: string;
  highlight?: string;
}

type ExampleType = 'factorial' | 'fibonacci' | 'hanoi' | 'sum-digits';

export function RecursionVisualizer() {
  const [example, setExample] = useState<ExampleType>('factorial');
  const [inputValue, setInputValue] = useState<number>(5);
  const [steps, setSteps] = useState<RecursionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const intervalRef = useRef<NodeJS.Timeout>();

  // ---------- GENERATE STEPS ----------
  const generateSteps = () => {
    const newSteps: RecursionStep[] = [];
    switch (example) {
      case 'factorial':
  const factorial = (n: number, stack: string[] = []): number => {
    stack.push(`factorial(${n})`);
    newSteps.push({
      stack: [...stack],
      message: `Entering factorial(${n})`,
      highlight: `factorial(${n})`,
    });
    if (n <= 1) {
      newSteps.push({
        stack: [...stack],
        message: `Base case reached: factorial(1) = 1`,
        highlight: `factorial(${n})`,
      });
      stack.pop();
      return 1;
    }
    const res: number = n * factorial(n - 1, stack);
    newSteps.push({
      stack: [...stack],
      message: `Returning factorial(${n}) = ${res}`,
      highlight: `factorial(${n})`,
    });
    stack.pop();
    return res;
  };
  factorial(inputValue);
  break;


      case 'fibonacci':
        const fib = (n: number, stack: string[] = []): number => {
          stack.push(`fib(${n})`);
          newSteps.push({ stack: [...stack], message: `Calculating fib(${n})`, highlight: `fib(${n})` });
          if (n <= 1) {
            newSteps.push({ stack: [...stack], message: `Base case fib(${n}) = ${n}`, highlight: `fib(${n})` });
            stack.pop();
            return n;
          }
          const res = fib(n - 1, stack) + fib(n - 2, stack);
          newSteps.push({ stack: [...stack], message: `Returning fib(${n}) = ${res}`, highlight: `fib(${n})` });
          stack.pop();
          return res;
        };
        fib(inputValue);
        break;

      case 'hanoi':
        const hanoi = (n: number, from: string, to: string, aux: string, stack: string[] = []) => {
          stack.push(`hanoi(${n}, ${from}→${to})`);
          newSteps.push({ stack: [...stack], message: `Move ${n} disk(s) from ${from} to ${to}`, highlight: `hanoi(${n})` });
          if (n === 1) {
            newSteps.push({ stack: [...stack], message: `Move disk 1 from ${from} to ${to}`, highlight: `Move disk 1` });
            stack.pop();
            return;
          }
          hanoi(n - 1, from, aux, to, stack);
          newSteps.push({ stack: [...stack], message: `Move disk ${n} from ${from} to ${to}`, highlight: `Move disk ${n}` });
          hanoi(n - 1, aux, to, from, stack);
          stack.pop();
        };
        hanoi(Math.min(inputValue, 3), 'A', 'C', 'B'); // limit to 3 for clarity
        break;

      case 'sum-digits':
        const sumDigits = (n: number, stack: string[] = []): number => {
          stack.push(`sumDigits(${n})`);
          newSteps.push({ stack: [...stack], message: `Entering sumDigits(${n})`, highlight: `sumDigits(${n})` });
          if (n === 0) {
            newSteps.push({ stack: [...stack], message: `Base case reached: sumDigits(0) = 0`, highlight: `sumDigits(0)` });
            stack.pop();
            return 0;
          }
          const res = (n % 10) + sumDigits(Math.floor(n / 10), stack);
          newSteps.push({ stack: [...stack], message: `Returning sumDigits(${n}) = ${res}`, highlight: `sumDigits(${n})` });
          stack.pop();
          return res;
        };
        sumDigits(inputValue);
        break;

      default:
        break;
    }

    setSteps(newSteps);
    setCurrentStep(0);
  };

  // ---------- PLAYBACK CONTROLS ----------
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

  useEffect(() => {
    generateSteps();
  }, [example, inputValue]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentStepData = steps[currentStep] || { stack: [], message: 'Ready to start' };

  return (
    <div className="space-y-6">
      {/* Example Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Recursion Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={() => setExample('factorial')} variant={example === 'factorial' ? 'default' : 'outline'}>Factorial</Button>
            <Button onClick={() => setExample('fibonacci')} variant={example === 'fibonacci' ? 'default' : 'outline'}>Fibonacci</Button>
            <Button onClick={() => setExample('hanoi')} variant={example === 'hanoi' ? 'default' : 'outline'}>Tower of Hanoi</Button>
            <Button onClick={() => setExample('sum-digits')} variant={example === 'sum-digits' ? 'default' : 'outline'}>Sum of Digits</Button>
            <input 
              type="number" 
              min={1} 
              value={inputValue} 
              onChange={e => setInputValue(Number(e.target.value))}
              className="border rounded-md px-2 py-1 w-20"
            />
          </div>

          <div className="flex gap-4 items-center">
            <Button onClick={isPlaying ? pauseAnimation : playAnimation}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={resetAnimation} variant="outline"><RotateCcw size={16} /> Reset</Button>
            <Button onClick={generateSteps} variant="outline">Generate Steps</Button>
          </div>

          {/* Speed Slider */}
          <div className="space-y-2 mt-2">
            <label className="text-sm font-medium">Animation Speed</label>
            <Slider value={[speed]} onValueChange={([val]) => setSpeed(val)} min={10} max={100} step={10} className="w-full" />
            <div className="text-xs text-muted-foreground">Speed: {speed}ms per step</div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Recursion Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 font-medium">{currentStepData.message}</div>
          <div className="space-y-1">
            {currentStepData.stack.map((frame, idx) => (
              <div key={idx} className={`px-2 py-1 border rounded ${frame === currentStepData.highlight ? 'bg-red-500 text-white font-bold' : 'bg-gray-100'}`}>
                {frame}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}