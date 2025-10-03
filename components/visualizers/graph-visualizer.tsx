'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

type GraphAlgorithm = 'bfs' | 'dfs' | 'dijkstra';

interface Node {
  id: number;
  x: number;
  y: number;
  visited: boolean;
  distance: number;
  parent?: number;
  inQueue: boolean;
  isStart: boolean;
  isEnd: boolean;
}

interface Edge {
  from: number;
  to: number;
  weight: number;
  highlighted: boolean;
}

interface AnimationStep {
  nodes: Node[];
  edges: Edge[];
  currentNode?: number;
  queue?: number[];
  stack?: number[];
  message: string;
}

export function GraphVisualizer() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [algorithm, setAlgorithm] = useState<GraphAlgorithm>('bfs');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [startNode, setStartNode] = useState(0);
  const [endNode, setEndNode] = useState(4);

  const intervalRef = useRef<NodeJS.Timeout>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize sample graph
  const initializeGraph = () => {
    const sampleNodes: Node[] = [
      {
        id: 0,
        x: 100,
        y: 100,
        visited: false,
        distance: Infinity,
        parent: undefined,
        inQueue: false,
        isStart: true,
        isEnd: false,
      },
      {
        id: 1,
        x: 250,
        y: 50,
        visited: false,
        distance: Infinity,
        parent: undefined,
        inQueue: false,
        isStart: false,
        isEnd: false,
      },
      {
        id: 2,
        x: 400,
        y: 100,
        visited: false,
        distance: Infinity,
        parent: undefined,
        inQueue: false,
        isStart: false,
        isEnd: false,
      },
      {
        id: 3,
        x: 150,
        y: 200,
        visited: false,
        distance: Infinity,
        parent: undefined,
        inQueue: false,
        isStart: false,
        isEnd: false,
      },
      {
        id: 4,
        x: 350,
        y: 200,
        visited: false,
        distance: Infinity,
        parent: undefined,
        inQueue: false,
        isStart: false,
        isEnd: true,
      },
      {
        id: 5,
        x: 250,
        y: 280,
        visited: false,
        distance: Infinity,
        parent: undefined,
        inQueue: false,
        isStart: false,
        isEnd: false,
      },
    ];

    const sampleEdges: Edge[] = [
      { from: 0, to: 1, weight: 4, highlighted: false },
      { from: 0, to: 3, weight: 2, highlighted: false },
      { from: 1, to: 2, weight: 3, highlighted: false },
      { from: 1, to: 3, weight: 1, highlighted: false },
      { from: 1, to: 4, weight: 6, highlighted: false },
      { from: 2, to: 4, weight: 2, highlighted: false },
      { from: 3, to: 4, weight: 3, highlighted: false },
      { from: 3, to: 5, weight: 5, highlighted: false },
      { from: 4, to: 5, weight: 1, highlighted: false },
    ];

    setNodes(sampleNodes);
    setEdges(sampleEdges);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsPaused(false);
  };

  useEffect(() => {
    initializeGraph();
  }, []);

  // BFS Algorithm
  const bfs = (): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const nodesCopy: Node[] = nodes.map(n => ({
      ...n,
      visited: false,
      inQueue: false,
      parent: undefined,
    }));
    const queue: number[] = [startNode];

    nodesCopy[startNode].inQueue = true;

    steps.push({
      nodes: nodesCopy.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e, highlighted: false })),
      queue: [...queue],
      message: `Starting BFS from node ${startNode}. Added to queue.`,
    });

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      const currentNode = nodesCopy[currentNodeId];

      currentNode.visited = true;
      currentNode.inQueue = false;

      steps.push({
        nodes: nodesCopy.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e, highlighted: false })),
        currentNode: currentNodeId,
        queue: [...queue],
        message: `Visiting node ${currentNodeId}. Exploring neighbors...`,
      });

      // Find neighbors
      const neighbors = edges
        .filter(e => e.from === currentNodeId || e.to === currentNodeId)
        .map(e => (e.from === currentNodeId ? e.to : e.from))
        .filter(
          neighbor =>
            !nodesCopy[neighbor].visited && !nodesCopy[neighbor].inQueue
        );

      for (const neighbor of neighbors) {
        nodesCopy[neighbor].inQueue = true;
        nodesCopy[neighbor].parent = currentNodeId;
        queue.push(neighbor);

        const edgeIndex = edges.findIndex(
          e =>
            (e.from === currentNodeId && e.to === neighbor) ||
            (e.from === neighbor && e.to === currentNodeId)
        );

        steps.push({
          nodes: nodesCopy.map(n => ({ ...n })),
          edges: edges.map((e, i) => ({ ...e, highlighted: i === edgeIndex })),
          currentNode: currentNodeId,
          queue: [...queue],
          message: `Added node ${neighbor} to queue via node ${currentNodeId}`,
        });
      }

      if (currentNodeId === endNode) {
        steps.push({
          nodes: nodesCopy.map(n => ({ ...n })),
          edges: edges.map(e => ({ ...e, highlighted: false })),
          message: `Target node ${endNode} found! BFS complete.`,
        });
        break;
      }
    }

    return steps;
  };

  // DFS Algorithm
  const dfs = (): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const nodesCopy: Node[] = nodes.map(n => ({
      ...n,
      visited: false,
      parent: undefined,
    }));
    const stack: number[] = [startNode];

    steps.push({
      nodes: nodesCopy.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e, highlighted: false })),
      stack: [...stack],
      message: `Starting DFS from node ${startNode}. Added to stack.`,
    });

    while (stack.length > 0) {
      const currentNodeId = stack.pop()!;

      if (nodesCopy[currentNodeId].visited) continue;

      const currentNode = nodesCopy[currentNodeId];
      currentNode.visited = true;

      steps.push({
        nodes: nodesCopy.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e, highlighted: false })),
        currentNode: currentNodeId,
        stack: [...stack],
        message: `Visiting node ${currentNodeId}. Exploring neighbors...`,
      });

      // Find unvisited neighbors
      const neighbors = edges
        .filter(e => e.from === currentNodeId || e.to === currentNodeId)
        .map(e => (e.from === currentNodeId ? e.to : e.from))
        .filter(neighbor => !nodesCopy[neighbor].visited);

      for (const neighbor of neighbors.reverse()) {
        // Reverse for consistent ordering
        if (!nodesCopy[neighbor].visited) {
          nodesCopy[neighbor].parent = currentNodeId;
          stack.push(neighbor);

          const edgeIndex = edges.findIndex(
            e =>
              (e.from === currentNodeId && e.to === neighbor) ||
              (e.from === neighbor && e.to === currentNodeId)
          );

          steps.push({
            nodes: nodesCopy.map(n => ({ ...n })),
            edges: edges.map((e, i) => ({
              ...e,
              highlighted: i === edgeIndex,
            })),
            currentNode: currentNodeId,
            stack: [...stack],
            message: `Added node ${neighbor} to stack via node ${currentNodeId}`,
          });
        }
      }

      if (currentNodeId === endNode) {
        steps.push({
          nodes: nodesCopy.map(n => ({ ...n })),
          edges: edges.map(e => ({ ...e, highlighted: false })),
          message: `Target node ${endNode} found! DFS complete.`,
        });
        break;
      }
    }

    return steps;
  };

  // Dijkstra's Algorithm
  const dijkstra = (): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const nodesCopy: Node[] = nodes.map(n => ({
      ...n,
      visited: false,
      distance: n.id === startNode ? 0 : Infinity,
      parent: undefined,
      inQueue: true,
    }));

    steps.push({
      nodes: nodesCopy.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e, highlighted: false })),
      message: `Starting Dijkstra's algorithm from node ${startNode}. Distance set to 0.`,
    });

    while (true) {
      // Find unvisited node with minimum distance
      const unvisited = nodesCopy.filter(n => !n.visited && n.inQueue);
      if (unvisited.length === 0) break;

      const currentNode = unvisited.reduce((min, node) =>
        node.distance < min.distance ? node : min
      );

      currentNode.visited = true;
      currentNode.inQueue = false;

      steps.push({
        nodes: nodesCopy.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e, highlighted: false })),
        currentNode: currentNode.id,
        message: `Selected node ${currentNode.id} with distance ${currentNode.distance === Infinity ? '∞' : currentNode.distance}`,
      });

      if (currentNode.id === endNode) {
        steps.push({
          nodes: nodesCopy.map(n => ({ ...n })),
          edges: edges.map(e => ({ ...e, highlighted: false })),
          message: `Reached target node ${endNode}! Shortest distance: ${currentNode.distance}`,
        });
        break;
      }

      // Update distances to neighbors
      const neighborEdges = edges.filter(
        e => e.from === currentNode.id || e.to === currentNode.id
      );

      for (const edge of neighborEdges) {
        const neighborId = edge.from === currentNode.id ? edge.to : edge.from;
        const neighbor = nodesCopy[neighborId];

        if (!neighbor.visited) {
          const newDistance = currentNode.distance + edge.weight;

          if (newDistance < neighbor.distance) {
            neighbor.distance = newDistance;
            neighbor.parent = currentNode.id;

            steps.push({
              nodes: nodesCopy.map(n => ({ ...n })),
              edges: edges.map(e => ({ ...e, highlighted: e === edge })),
              currentNode: currentNode.id,
              message: `Updated distance to node ${neighborId}: ${newDistance} (via node ${currentNode.id})`,
            });
          } else {
            steps.push({
              nodes: nodesCopy.map(n => ({ ...n })),
              edges: edges.map(e => ({ ...e, highlighted: e === edge })),
              currentNode: currentNode.id,
              message: `Distance to node ${neighborId} not improved: ${neighbor.distance} ≤ ${newDistance}`,
            });
          }
        }
      }
    }

    return steps;
  };

  // Start algorithm
  const startAlgorithm = () => {
    let algorithmSteps: AnimationStep[] = [];

    switch (algorithm) {
      case 'bfs':
        algorithmSteps = bfs();
        break;
      case 'dfs':
        algorithmSteps = dfs();
        break;
      case 'dijkstra':
        algorithmSteps = dijkstra();
        break;
    }

    setSteps(algorithmSteps);
    setCurrentStep(0);
    setIsPlaying(true);
    setIsPaused(false);
  };

  // Animation control
  useEffect(() => {
    if (isPlaying && !isPaused && currentStep < steps.length - 1) {
      intervalRef.current = setTimeout(
        () => {
          setCurrentStep(prev => prev + 1);
        },
        1100 - speed * 10
      );
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, isPaused, currentStep, steps.length, speed]);

  const pause = () => setIsPaused(!isPaused);
  const stop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
  };
  const reset = () => {
    stop();
    initializeGraph();
  };

  // Drawing function
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentStepData = steps[currentStep];
    const displayNodes = currentStepData?.nodes || nodes;
    const displayEdges = currentStepData?.edges || edges;

    // Draw edges
    displayEdges.forEach(edge => {
      const fromNode = displayNodes.find(n => n.id === edge.from);
      const toNode = displayNodes.find(n => n.id === edge.to);

      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = edge.highlighted ? '#ef4444' : '#64748b';
        ctx.lineWidth = edge.highlighted ? 3 : 1;
        ctx.stroke();

        // Draw weight
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(midX - 12, midY - 8, 24, 16);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(edge.weight.toString(), midX, midY + 4);
      }
    });

    // Draw nodes
    displayNodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);

      let fillColor = '#3b82f6'; // Default blue
      if (node.isStart)
        fillColor = '#10b981'; // Green for start
      else if (node.isEnd)
        fillColor = '#ef4444'; // Red for end
      else if (node.visited)
        fillColor = '#8b5cf6'; // Purple for visited
      else if (node.inQueue)
        fillColor = '#f59e0b'; // Orange for in queue
      else if (currentStepData?.currentNode === node.id) fillColor = '#ec4899'; // Pink for current

      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw node ID
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.id.toString(), node.x, node.y + 4);

      // Draw distance for Dijkstra
      if (algorithm === 'dijkstra' && node.distance !== Infinity) {
        ctx.fillStyle = '#1f2937';
        ctx.font = '10px Arial';
        ctx.fillText(`d:${node.distance}`, node.x, node.y - 28);
      }
    });
  };

  useEffect(() => {
    drawGraph();
  }, [nodes, edges, steps, currentStep, algorithm]);

  const currentStepData = steps[currentStep];

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='text-2xl'>Graph Algorithm Visualizer</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Controls */}
        <div className='flex flex-wrap gap-4 items-center'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Algorithm:</label>
            <Select
              value={algorithm}
              onValueChange={(value: GraphAlgorithm) => setAlgorithm(value)}
              disabled={isPlaying}
            >
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bfs'>BFS</SelectItem>
                <SelectItem value='dfs'>DFS</SelectItem>
                <SelectItem value='dijkstra'>Dijkstra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Start:</label>
            <Select
              value={startNode.toString()}
              onValueChange={value => setStartNode(Number(value))}
              disabled={isPlaying}
            >
              <SelectTrigger className='w-16'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nodes.map(node => (
                  <SelectItem key={node.id} value={node.id.toString()}>
                    {node.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>End:</label>
            <Select
              value={endNode.toString()}
              onValueChange={value => setEndNode(Number(value))}
              disabled={isPlaying}
            >
              <SelectTrigger className='w-16'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nodes.map(node => (
                  <SelectItem key={node.id} value={node.id.toString()}>
                    {node.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Speed:</label>
            <Slider
              value={[speed]}
              onValueChange={([value]) => setSpeed(value)}
              min={1}
              max={100}
              step={1}
              className='w-24'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          {!isPlaying ? (
            <Button
              onClick={startAlgorithm}
              className='flex items-center gap-2'
            >
              <Play className='w-4 h-4' />
              Start
            </Button>
          ) : (
            <Button
              onClick={pause}
              variant='outline'
              className='flex items-center gap-2'
            >
              <Pause className='w-4 h-4' />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}

          <Button
            onClick={stop}
            variant='outline'
            className='flex items-center gap-2'
          >
            <Square className='w-4 h-4' />
            Stop
          </Button>

          <Button
            onClick={reset}
            variant='outline'
            className='flex items-center gap-2'
          >
            <RotateCcw className='w-4 h-4' />
            Reset
          </Button>
        </div>

        {/* Status Message */}
        <div className='bg-muted/20 rounded-lg p-3'>
          <p className='text-sm font-medium'>
            {currentStepData?.message || 'Ready to start graph traversal'}
          </p>
          {steps.length > 0 && (
            <p className='text-xs text-muted-foreground mt-1'>
              Step {currentStep + 1} of {steps.length}
            </p>
          )}
        </div>

        {/* Graph Visualization */}
        <div className='bg-muted/10 rounded-lg p-4'>
          <canvas
            ref={canvasRef}
            width={500}
            height={350}
            className='border border-muted-foreground/20 rounded'
          />

          <div className='mt-4 flex flex-wrap gap-4 text-xs'>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <span>Start Node</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <span>End Node</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-pink-500 rounded-full'></div>
              <span>Current</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
              <span>In Queue/Stack</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
              <span>Visited</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
              <span>Unvisited</span>
            </div>
          </div>
        </div>

        {/* Algorithm Info and Queue/Stack Status */}
        <div className='grid md:grid-cols-2 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Algorithm Info</CardTitle>
            </CardHeader>
            <CardContent className='text-sm space-y-2'>
              {algorithm === 'bfs' && (
                <>
                  <p>
                    <strong>Time Complexity:</strong> O(V + E)
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(V)
                  </p>
                  <p>
                    <strong>Data Structure:</strong> Queue (FIFO)
                  </p>
                  <p>
                    <strong>Use Case:</strong> Shortest path in unweighted
                    graphs
                  </p>
                </>
              )}
              {algorithm === 'dfs' && (
                <>
                  <p>
                    <strong>Time Complexity:</strong> O(V + E)
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(V)
                  </p>
                  <p>
                    <strong>Data Structure:</strong> Stack (LIFO)
                  </p>
                  <p>
                    <strong>Use Case:</strong> Cycle detection, topological
                    sorting
                  </p>
                </>
              )}
              {algorithm === 'dijkstra' && (
                <>
                  <p>
                    <strong>Time Complexity:</strong> O(V² ) or O(E + V log V)
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(V)
                  </p>
                  <p>
                    <strong>Data Structure:</strong> Priority Queue
                  </p>
                  <p>
                    <strong>Use Case:</strong> Shortest path in weighted graphs
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>
                {algorithm === 'bfs'
                  ? 'Queue Status'
                  : algorithm === 'dfs'
                    ? 'Stack Status'
                    : 'Statistics'}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-sm space-y-2'>
              {(algorithm === 'bfs' || algorithm === 'dfs') &&
                currentStepData && (
                  <>
                    <p>
                      <strong>Contents:</strong> [
                      {(
                        currentStepData.queue ||
                        currentStepData.stack ||
                        []
                      ).join(', ')}
                      ]
                    </p>
                    <p>
                      <strong>Size:</strong>{' '}
                      {
                        (currentStepData.queue || currentStepData.stack || [])
                          .length
                      }
                    </p>
                  </>
                )}
              <p>
                <strong>Current Step:</strong> {currentStep + 1}
              </p>
              <p>
                <strong>Total Steps:</strong> {steps.length}
              </p>
              <p>
                <strong>Start Node:</strong> {startNode}
              </p>
              <p>
                <strong>Target Node:</strong> {endNode}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
