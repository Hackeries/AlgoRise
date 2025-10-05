'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Pause, Square, RotateCcw, Shuffle } from 'lucide-react'

type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap'

interface AnimationStep {
  array: number[]
  comparing?: number[]
  swapping?: number[]
  sorted?: number[]
  pivot?: number
  message?: string
}

export function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([])
  const [arraySize, setArraySize] = useState(20)
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState(100)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout>()

  // Initialize random array
  const generateRandomArray = () => {
    const newArray = Array.from({ length: arraySize }, () => 
      Math.floor(Math.random() * 300) + 10
    )
    setArray(newArray)
    setSteps([{ array: newArray }])
    setCurrentStep(0)
    setIsCompleted(false)
    setIsPlaying(false)
    setIsPaused(false)
  }

  // Generate array when size changes
  useEffect(() => {
    generateRandomArray()
  }, [arraySize])

  // Bubble Sort Algorithm
  const bubbleSort = (arr: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [{ array: [...arr], message: "Starting Bubble Sort..." }]
    const n = arr.length
    const workingArray: number[] = [...arr]
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Comparing elements
        steps.push({
          array: [...workingArray],
          comparing: [j, j + 1],
          message: `Comparing elements at positions ${j} and ${j + 1}`
        })
        
        if (workingArray[j]! > workingArray[j + 1]!) {
          // Swapping elements
          steps.push({
            array: [...workingArray],
            swapping: [j, j + 1],
            message: `Swapping ${workingArray[j]} and ${workingArray[j + 1]}`
          })
          
          const temp = workingArray[j]!
          workingArray[j] = workingArray[j + 1]!
          workingArray[j + 1] = temp
          
          steps.push({
            array: [...workingArray],
            message: `Swapped! Array after swap`
          })
        }
      }
      
      // Mark element as sorted
      steps.push({
        array: [...workingArray],
        sorted: workingArray.map((_, idx) => idx >= n - i - 1 ? idx : -1).filter(idx => idx !== -1),
        message: `Element at position ${n - i - 1} is now in its final position`
      })
    }
    
    steps.push({
      array: [...workingArray],
      sorted: workingArray.map((_, idx) => idx),
      message: "Bubble Sort completed! All elements are sorted."
    })
    
    return steps
  }

  // Selection Sort Algorithm
  const selectionSort = (arr: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [{ array: [...arr], message: "Starting Selection Sort..." }]
    const n = arr.length
    const workingArray: number[] = [...arr]
    
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i
      
      steps.push({
        array: [...workingArray],
        comparing: [i],
        message: `Finding minimum element from position ${i} onwards`
      })
      
      for (let j = i + 1; j < n; j++) {
        steps.push({
          array: [...workingArray],
          comparing: [minIdx, j],
          message: `Comparing ${workingArray[minIdx]} and ${workingArray[j]}`
        })
        
        if (workingArray[j]! < workingArray[minIdx]!) {
          minIdx = j
          steps.push({
            array: [...workingArray],
            comparing: [minIdx],
            message: `New minimum found: ${workingArray[minIdx]} at position ${minIdx}`
          })
        }
      }
      
      if (minIdx !== i) {
        steps.push({
          array: [...workingArray],
          swapping: [i, minIdx],
          message: `Swapping ${workingArray[i]} and ${workingArray[minIdx]}`
        })
        
        const temp = workingArray[i]!
        workingArray[i] = workingArray[minIdx]!
        workingArray[minIdx] = temp
      }
      
      steps.push({
        array: [...workingArray],
        sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
        message: `Position ${i} now has its final value: ${workingArray[i]}`
      })
    }
    
    steps.push({
      array: [...workingArray],
      sorted: workingArray.map((_, idx) => idx),
      message: "Selection Sort completed!"
    })
    
    return steps
  }

  // Quick Sort Algorithm  
  const quickSort = (arr: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [{ array: [...arr], message: "Starting Quick Sort..." }]
    const workingArray: number[] = [...arr]
    
    const partition = (low: number, high: number): number => {
      const pivot = workingArray[high]
      steps.push({
        array: [...workingArray],
        pivot: high,
        message: `Choosing pivot: ${pivot} at position ${high}`
      })
      
      let i = low - 1
      
      for (let j = low; j < high; j++) {
        steps.push({
          array: [...workingArray],
          comparing: [j, high],
          pivot: high,
          message: `Comparing ${workingArray[j]} with pivot ${pivot}`
        })
        
        if (workingArray[j]! < pivot) {
          i++
          steps.push({
            array: [...workingArray],
            swapping: [i, j],
            pivot: high,
            message: `${workingArray[j]} < ${pivot}, swapping positions ${i} and ${j}`
          })
          
          const temp = workingArray[i]!
          workingArray[i] = workingArray[j]!
          workingArray[j] = temp
          
          steps.push({
            array: [...workingArray],
            pivot: high,
            message: `Swapped! Elements ≤ ${pivot} are moving to the left`
          })
        }
      }
      
      steps.push({
        array: [...workingArray],
        swapping: [i + 1, high],
        message: `Placing pivot ${pivot} in its final position`
      })
      
      const temp = workingArray[i + 1]!
      workingArray[i + 1] = workingArray[high]!
      workingArray[high] = temp
      
      steps.push({
        array: [...workingArray],
        sorted: [i + 1],
        message: `Pivot ${pivot} is now in its correct position at ${i + 1}`
      })
      
      return i + 1
    }
    
    const quickSortRecursive = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high)
        quickSortRecursive(low, pi - 1)
        quickSortRecursive(pi + 1, high)
      }
    }
    
    quickSortRecursive(0, workingArray.length - 1)
    
    steps.push({
      array: [...workingArray],
      sorted: workingArray.map((_, idx) => idx),
      message: "Quick Sort completed!"
    })
    
    return steps
  }

  // Start sorting animation
  const startSorting = () => {
    let sortSteps: AnimationStep[] = []
    
    switch (algorithm) {
      case 'bubble':
        sortSteps = bubbleSort(array)
        break
      case 'selection':
        sortSteps = selectionSort(array)
        break
      case 'quick':
        sortSteps = quickSort(array)
        break
      default:
        sortSteps = bubbleSort(array)
    }
    
    setSteps(sortSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setIsPaused(false)
    setIsCompleted(false)
  }

  // Animation control
  useEffect(() => {
    if (isPlaying && !isPaused && currentStep < steps.length - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 1000 - speed * 9)
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      setIsPlaying(false)
      setIsCompleted(true)
    }
    
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [isPlaying, isPaused, currentStep, steps.length, speed])

  const pause = () => {
    setIsPaused(!isPaused)
  }

  const stop = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(0)
    setIsCompleted(false)
  }

  const reset = () => {
    stop()
    generateRandomArray()
  }

  const currentStepData = steps[currentStep] || { array, message: "Ready to sort" }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Sorting Algorithm Visualizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Algorithm:</label>
            <Select value={algorithm} onValueChange={(value: SortingAlgorithm) => setAlgorithm(value)} disabled={isPlaying}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bubble">Bubble Sort</SelectItem>
                <SelectItem value="selection">Selection Sort</SelectItem>
                <SelectItem value="quick">Quick Sort</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Size:</label>
            <Slider
              value={[arraySize]}
              onValueChange={([value]) => setArraySize(value)}
              min={5}
              max={50}
              step={1}
              className="w-24"
              disabled={isPlaying}
            />
            <span className="text-sm text-muted-foreground w-6">{arraySize}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Speed:</label>
            <Slider
              value={[speed]}
              onValueChange={([value]) => setSpeed(value)}
              min={1}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button onClick={startSorting} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <Button onClick={pause} variant="outline" className="flex items-center gap-2">
              <Pause className="w-4 h-4" />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          
          <Button onClick={stop} variant="outline" className="flex items-center gap-2">
            <Square className="w-4 h-4" />
            Stop
          </Button>
          
          <Button onClick={reset} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          
          <Button onClick={generateRandomArray} variant="outline" className="flex items-center gap-2" disabled={isPlaying}>
            <Shuffle className="w-4 h-4" />
            Shuffle
          </Button>
        </div>

        {/* Status Message */}
        <div className="bg-muted/20 rounded-lg p-3">
          <p className="text-sm font-medium">
            {currentStepData.message || "Ready to start sorting"}
          </p>
          {steps.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          )}
        </div>

        {/* Visualization */}
        <div className="bg-muted/10 rounded-lg p-4">
          <div className="flex items-end justify-center gap-1 h-80" style={{ minHeight: '320px' }}>
            {currentStepData.array.map((value, index) => {
              let barColor = 'bg-blue-500'
              
              if (currentStepData.sorted?.includes(index)) {
                barColor = 'bg-green-500'
              } else if (currentStepData.swapping?.includes(index)) {
                barColor = 'bg-red-500'
              } else if (currentStepData.comparing?.includes(index)) {
                barColor = 'bg-yellow-500'
              } else if (currentStepData.pivot === index) {
                barColor = 'bg-purple-500'
              }
              
              const height = Math.max((value / 300) * 250, 20)
              
              return (
                <div
                  key={index}
                  className={`${barColor} rounded-t transition-all duration-200 flex items-end justify-center text-xs text-white font-semibold`}
                  style={{
                    height: `${height}px`,
                    width: `${Math.max(300 / arraySize, 8)}px`,
                  }}
                >
                  {arraySize <= 20 ? value : ''}
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Unsorted</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Comparing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Swapping</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Pivot</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Sorted</span>
            </div>
          </div>
        </div>

        {/* Algorithm Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Algorithm Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {algorithm === 'bubble' && (
                <>
                  <p><strong>Time Complexity:</strong> O(n²)</p>
                  <p><strong>Space Complexity:</strong> O(1)</p>
                  <p><strong>Stable:</strong> Yes</p>
                  <p><strong>Description:</strong> Repeatedly compares adjacent elements and swaps them if they're in wrong order.</p>
                </>
              )}
              {algorithm === 'selection' && (
                <>
                  <p><strong>Time Complexity:</strong> O(n²)</p>
                  <p><strong>Space Complexity:</strong> O(1)</p>
                  <p><strong>Stable:</strong> No</p>
                  <p><strong>Description:</strong> Finds minimum element and places it at the beginning, then repeats for remaining array.</p>
                </>
              )}
              {algorithm === 'quick' && (
                <>
                  <p><strong>Time Complexity:</strong> O(n log n) average, O(n²) worst</p>
                  <p><strong>Space Complexity:</strong> O(log n)</p>
                  <p><strong>Stable:</strong> No</p>
                  <p><strong>Description:</strong> Divides array around a pivot, recursively sorts smaller and larger elements.</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Array Size:</strong> {arraySize} elements</p>
              <p><strong>Total Steps:</strong> {steps.length}</p>
              <p><strong>Current Step:</strong> {currentStep + 1}</p>
              <p><strong>Status:</strong> {
                isCompleted ? 'Completed' : 
                isPlaying ? (isPaused ? 'Paused' : 'Running') : 'Ready'
              }</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}