'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GraphNode {
  id: number;
  x: number;
  y: number;
  status: 'unvisited' | 'exploring' | 'visited' | 'current';
  distance?: number;
}

interface GraphEdge {
  from: number;
  to: number;
  weight?: number;
  status: 'default' | 'exploring' | 'visited';
}

interface GraphStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  queue: number[];
  stack: number[];
  message: string;
  currentNode: number | null;
}

type GraphAlgorithm = 'bfs' | 'dfs' | 'dijkstra';

const GRAPH_ALGORITHMS: Record<GraphAlgorithm, { name: string; description: string; dataStructure: string }> = {
  bfs: { 
    name: 'Breadth-First Search', 
    description: 'Explores nodes level by level using a queue',
    dataStructure: 'Queue',
  },
  dfs: { 
    name: 'Depth-First Search', 
    description: 'Explores as deep as possible before backtracking',
    dataStructure: 'Stack',
  },
  dijkstra: { 
    name: "Dijkstra's Algorithm", 
    description: 'Find shortest paths from source to all nodes',
    dataStructure: 'Priority Queue',
  },
};

// Sample graph layout
const createSampleGraph = (): { nodes: GraphNode[]; adjacency: number[][] } => {
  const nodes: GraphNode[] = [
    { id: 0, x: 150, y: 50, status: 'unvisited' },
    { id: 1, x: 50, y: 150, status: 'unvisited' },
    { id: 2, x: 250, y: 150, status: 'unvisited' },
    { id: 3, x: 50, y: 250, status: 'unvisited' },
    { id: 4, x: 150, y: 250, status: 'unvisited' },
    { id: 5, x: 250, y: 250, status: 'unvisited' },
  ];

  const adjacency = [
    [1, 2],      // 0 -> 1, 2
    [0, 3, 4],   // 1 -> 0, 3, 4
    [0, 4, 5],   // 2 -> 0, 4, 5
    [1],         // 3 -> 1
    [1, 2, 5],   // 4 -> 1, 2, 5
    [2, 4],      // 5 -> 2, 4
  ];

  return { nodes, adjacency };
};

const createEdgesFromAdjacency = (adjacency: number[][]): GraphEdge[] => {
  const edges: GraphEdge[] = [];
  const added = new Set<string>();

  adjacency.forEach((neighbors, from) => {
    neighbors.forEach(to => {
      const key = from < to ? `${from}-${to}` : `${to}-${from}`;
      if (!added.has(key)) {
        edges.push({ from, to, status: 'default' });
        added.add(key);
      }
    });
  });

  return edges;
};

function* generateBFSSteps(nodes: GraphNode[], adjacency: number[][], start: number): Generator<GraphStep> {
  const nodesCopy = nodes.map(n => ({ ...n }));
  const edges = createEdgesFromAdjacency(adjacency);
  const visited = new Set<number>();
  const queue = [start];

  yield {
    nodes: nodesCopy.map(n => ({ ...n })),
    edges: edges.map(e => ({ ...e })),
    queue: [...queue],
    stack: [],
    message: `Starting BFS from node ${start}`,
    currentNode: start,
  };

  visited.add(start);
  nodesCopy[start].status = 'exploring';

  while (queue.length > 0) {
    const current = queue.shift()!;
    nodesCopy[current].status = 'current';

    yield {
      nodes: nodesCopy.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e })),
      queue: [...queue],
      stack: [],
      message: `Visiting node ${current}`,
      currentNode: current,
    };

    for (const neighbor of adjacency[current]) {
      const edgeIdx = edges.findIndex(
        e => (e.from === current && e.to === neighbor) || (e.from === neighbor && e.to === current)
      );

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        nodesCopy[neighbor].status = 'exploring';
        if (edgeIdx !== -1) edges[edgeIdx].status = 'exploring';

        yield {
          nodes: nodesCopy.map(n => ({ ...n })),
          edges: edges.map(e => ({ ...e })),
          queue: [...queue],
          stack: [],
          message: `Adding neighbor ${neighbor} to queue`,
          currentNode: current,
        };
      } else {
        if (edgeIdx !== -1) edges[edgeIdx].status = 'visited';
      }
    }

    nodesCopy[current].status = 'visited';
    
    yield {
      nodes: nodesCopy.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e })),
      queue: [...queue],
      stack: [],
      message: `Finished with node ${current}`,
      currentNode: null,
    };
  }

  yield {
    nodes: nodesCopy.map(n => ({ ...n })),
    edges: edges.map(e => ({ ...e, status: 'visited' as const })),
    queue: [],
    stack: [],
    message: 'BFS Complete! All reachable nodes visited.',
    currentNode: null,
  };
}

function* generateDFSSteps(nodes: GraphNode[], adjacency: number[][], start: number): Generator<GraphStep> {
  const nodesCopy = nodes.map(n => ({ ...n }));
  const edges = createEdgesFromAdjacency(adjacency);
  const visited = new Set<number>();
  const stack = [start];

  yield {
    nodes: nodesCopy.map(n => ({ ...n })),
    edges: edges.map(e => ({ ...e })),
    queue: [],
    stack: [...stack],
    message: `Starting DFS from node ${start}`,
    currentNode: start,
  };

  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (visited.has(current)) continue;

    visited.add(current);
    nodesCopy[current].status = 'current';

    yield {
      nodes: nodesCopy.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e })),
      queue: [],
      stack: [...stack],
      message: `Visiting node ${current}`,
      currentNode: current,
    };

    // Add unvisited neighbors to stack (reverse order for natural traversal)
    const unvisitedNeighbors = adjacency[current].filter(n => !visited.has(n)).reverse();
    
    for (const neighbor of unvisitedNeighbors) {
      stack.push(neighbor);
      nodesCopy[neighbor].status = 'exploring';
      
      const edgeIdx = edges.findIndex(
        e => (e.from === current && e.to === neighbor) || (e.from === neighbor && e.to === current)
      );
      if (edgeIdx !== -1) edges[edgeIdx].status = 'exploring';

      yield {
        nodes: nodesCopy.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e })),
        queue: [],
        stack: [...stack],
        message: `Adding neighbor ${neighbor} to stack`,
        currentNode: current,
      };
    }

    nodesCopy[current].status = 'visited';

    yield {
      nodes: nodesCopy.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e })),
      queue: [],
      stack: [...stack],
      message: `Finished with node ${current}`,
      currentNode: null,
    };
  }

  yield {
    nodes: nodesCopy.map(n => ({ ...n })),
    edges: edges.map(e => ({ ...e, status: 'visited' as const })),
    queue: [],
    stack: [],
    message: 'DFS Complete! All reachable nodes visited.',
    currentNode: null,
  };
}

export function GraphVisualizer() {
  const [algorithm, setAlgorithm] = useState<GraphAlgorithm>('bfs');
  const [steps, setSteps] = useState<GraphStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [startNode, setStartNode] = useState(0);

  const generateSteps = useCallback(() => {
    const { nodes, adjacency } = createSampleGraph();
    const newSteps: GraphStep[] = [];
    
    let generator: Generator<GraphStep>;
    switch (algorithm) {
      case 'bfs':
        generator = generateBFSSteps(nodes, adjacency, startNode);
        break;
      case 'dfs':
        generator = generateDFSSteps(nodes, adjacency, startNode);
        break;
      default:
        generator = generateBFSSteps(nodes, adjacency, startNode);
    }

    for (const step of generator) {
      newSteps.push(step);
    }

    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithm, startNode]);

  useEffect(() => {
    generateSteps();
  }, [generateSteps]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  const currentStepData = steps[currentStep];
  const algorithmInfo = GRAPH_ALGORITHMS[algorithm];

  const nodeStatusColors = {
    unvisited: 'fill-slate-300 dark:fill-slate-600',
    exploring: 'fill-yellow-400 dark:fill-yellow-500',
    current: 'fill-blue-500 dark:fill-blue-400 animate-pulse',
    visited: 'fill-green-500 dark:fill-green-400',
  };

  const edgeStatusColors = {
    default: 'stroke-slate-300 dark:stroke-slate-600',
    exploring: 'stroke-yellow-400 dark:stroke-yellow-500',
    visited: 'stroke-green-500 dark:stroke-green-400',
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Graph Traversal Visualizer</CardTitle>
        <CardDescription>
          Visualize BFS, DFS, and shortest path algorithms
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Algorithm</label>
            <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as GraphAlgorithm)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GRAPH_ALGORITHMS).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Start Node</label>
            <Select value={startNode.toString()} onValueChange={(v) => setStartNode(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={n.toString()}>Node {n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Speed: {speed}x</label>
            <Slider
              value={[speed]}
              onValueChange={([v]) => setSpeed(v)}
              min={0.5}
              max={3}
              step={0.5}
            />
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="p-3 bg-muted rounded-lg text-sm">
          <strong>{algorithmInfo.name}:</strong> {algorithmInfo.description}
          <br />
          <span className="text-muted-foreground">Uses: {algorithmInfo.dataStructure}</span>
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setIsPlaying(true)} disabled={isPlaying} size="sm">
            <Play className="w-4 h-4 mr-2" /> Play
          </Button>
          <Button onClick={() => setIsPlaying(false)} disabled={!isPlaying} variant="outline" size="sm">
            <Pause className="w-4 h-4 mr-2" /> Pause
          </Button>
          <Button 
            onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))} 
            disabled={isPlaying || currentStep >= steps.length - 1} 
            variant="outline" 
            size="sm"
          >
            <StepForward className="w-4 h-4 mr-2" /> Step
          </Button>
          <Button onClick={generateSteps} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>

        {/* Step Slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Step: {currentStep + 1} / {steps.length}
          </label>
          <Slider
            value={[currentStep]}
            onValueChange={([v]) => setCurrentStep(v)}
            min={0}
            max={steps.length - 1}
            step={1}
          />
        </div>

        {/* Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Graph SVG */}
          <div className="lg:col-span-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <svg viewBox="0 0 300 300" className="w-full h-[300px]">
              {/* Edges */}
              {currentStepData?.edges.map((edge, i) => {
                const from = currentStepData.nodes[edge.from];
                const to = currentStepData.nodes[edge.to];
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className={cn('stroke-[3] transition-all duration-300', edgeStatusColors[edge.status])}
                  />
                );
              })}

              {/* Nodes */}
              {currentStepData?.nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    className={cn('transition-all duration-300', nodeStatusColors[node.status])}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white font-bold text-sm"
                  >
                    {node.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Data Structure Display */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h4 className="font-medium mb-3 text-sm">{algorithmInfo.dataStructure}</h4>
            <div className="space-y-1">
              {algorithm === 'bfs' && currentStepData?.queue.map((node, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-2 rounded text-xs font-mono',
                    i === 0 ? 'bg-blue-200 dark:bg-blue-800' : 'bg-slate-200 dark:bg-slate-700'
                  )}
                >
                  Node {node} {i === 0 && '← Front'}
                </div>
              ))}
              {algorithm === 'dfs' && currentStepData?.stack.slice().reverse().map((node, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-2 rounded text-xs font-mono',
                    i === 0 ? 'bg-blue-200 dark:bg-blue-800' : 'bg-slate-200 dark:bg-slate-700'
                  )}
                >
                  Node {node} {i === 0 && '← Top'}
                </div>
              ))}
              {((algorithm === 'bfs' && !currentStepData?.queue.length) ||
                (algorithm === 'dfs' && !currentStepData?.stack.length)) && (
                <div className="text-muted-foreground text-xs italic">Empty</div>
              )}
            </div>
          </div>
        </div>

        {/* Step Message */}
        {currentStepData && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium">{currentStepData.message}</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>Unvisited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400 dark:bg-yellow-500" />
            <span>In Queue/Stack</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 dark:bg-green-400" />
            <span>Visited</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GraphVisualizer;
