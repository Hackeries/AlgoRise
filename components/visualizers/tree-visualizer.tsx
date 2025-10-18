'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'bfs';

interface TreeNode {
  id: number;
  value: number;
  left?: TreeNode;
  right?: TreeNode;
  x: number;
  y: number;
  visited: boolean;
  current: boolean;
  parent?: TreeNode;
}

interface AnimationStep {
  nodes: TreeNode[];
  currentNode?: number;
  visitedOrder: number[];
  message: string;
}

export function TreeVisualizer() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [traversalType, setTraversalType] = useState<TraversalType>('inorder');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [visitedOrder, setVisitedOrder] = useState<number[]>([]);

  const intervalRef = useRef<NodeJS.Timeout>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize sample binary tree
  const initializeTree = () => {
    const sampleTree: TreeNode[] = [
      { id: 1, value: 1, x: 400, y: 50, visited: false, current: false },
      { id: 2, value: 2, x: 250, y: 150, visited: false, current: false },
      { id: 3, value: 3, x: 550, y: 150, visited: false, current: false },
      { id: 4, value: 4, x: 150, y: 250, visited: false, current: false },
      { id: 5, value: 5, x: 350, y: 250, visited: false, current: false },
      { id: 6, value: 6, x: 450, y: 250, visited: false, current: false },
      { id: 7, value: 7, x: 650, y: 250, visited: false, current: false },
    ];

    // Set up parent-child relationships
    sampleTree[0].left = sampleTree[1];
    sampleTree[0].right = sampleTree[2];
    sampleTree[1].left = sampleTree[3];
    sampleTree[1].right = sampleTree[4];
    sampleTree[2].left = sampleTree[5];
    sampleTree[2].right = sampleTree[6];

    setTree(sampleTree);
    resetVisualization();
  };

  // Reset visualization state
  const resetVisualization = () => {
    setTree(prev =>
      prev.map(node => ({ ...node, visited: false, current: false }))
    );
    setCurrentStep(0);
    setSteps([]);
    setVisitedOrder([]);
    setIsPlaying(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Inorder traversal: Left -> Root -> Right
  const inorderTraversal = (
    root: TreeNode,
    steps: AnimationStep[],
    visitedOrder: number[]
  ): number[] => {
    if (!root) return visitedOrder;

    let currentVisitedOrder = [...visitedOrder];

    // Visit left subtree
    if (root.left) {
      currentVisitedOrder = inorderTraversal(
        root.left,
        steps,
        currentVisitedOrder
      );
    }

    // Visit root
    currentVisitedOrder = [...currentVisitedOrder, root.id];
    steps.push({
      nodes: tree.map(node => ({
        ...node,
        visited: currentVisitedOrder.includes(node.id),
        current: node.id === root.id,
      })),
      currentNode: root.id,
      visitedOrder: currentVisitedOrder,
      message: `Inorder: Visiting node ${root.value} (Left subtree processed)`,
    });

    // Visit right subtree
    if (root.right) {
      currentVisitedOrder = inorderTraversal(
        root.right,
        steps,
        currentVisitedOrder
      );
    }

    return currentVisitedOrder;
  };

  // Preorder traversal: Root -> Left -> Right
  const preorderTraversal = (
    root: TreeNode,
    steps: AnimationStep[],
    visitedOrder: number[]
  ): number[] => {
    if (!root) return visitedOrder;

    let currentVisitedOrder = [...visitedOrder];

    // Visit root
    currentVisitedOrder = [...currentVisitedOrder, root.id];
    steps.push({
      nodes: tree.map(node => ({
        ...node,
        visited: currentVisitedOrder.includes(node.id),
        current: node.id === root.id,
      })),
      currentNode: root.id,
      visitedOrder: currentVisitedOrder,
      message: `Preorder: Visiting node ${root.value} (Root first)`,
    });

    // Visit left subtree
    if (root.left) {
      currentVisitedOrder = preorderTraversal(
        root.left,
        steps,
        currentVisitedOrder
      );
    }

    // Visit right subtree
    if (root.right) {
      currentVisitedOrder = preorderTraversal(
        root.right,
        steps,
        currentVisitedOrder
      );
    }

    return currentVisitedOrder;
  };

  // Postorder traversal: Left -> Right -> Root
  const postorderTraversal = (
    root: TreeNode,
    steps: AnimationStep[],
    visitedOrder: number[]
  ): number[] => {
    if (!root) return visitedOrder;

    let currentVisitedOrder = [...visitedOrder];

    // Visit left subtree
    if (root.left) {
      currentVisitedOrder = postorderTraversal(
        root.left,
        steps,
        currentVisitedOrder
      );
    }

    // Visit right subtree
    if (root.right) {
      currentVisitedOrder = postorderTraversal(
        root.right,
        steps,
        currentVisitedOrder
      );
    }

    // Visit root
    currentVisitedOrder = [...currentVisitedOrder, root.id];
    steps.push({
      nodes: tree.map(node => ({
        ...node,
        visited: currentVisitedOrder.includes(node.id),
        current: node.id === root.id,
      })),
      currentNode: root.id,
      visitedOrder: currentVisitedOrder,
      message: `Postorder: Visiting node ${root.value} (Both subtrees processed)`,
    });

    return currentVisitedOrder;
  };

  // BFS traversal: Level by level using queue
  const bfsTraversal = (root: TreeNode, steps: AnimationStep[]): void => {
    if (!root) return;

    const queue: TreeNode[] = [root];
    const visitedOrder: number[] = [];

    // Initial step
    steps.push({
      nodes: tree.map(node => ({
        ...node,
        visited: false,
        current: node.id === root.id,
      })),
      currentNode: root.id,
      visitedOrder: [],
      message: `BFS: Starting from root node ${root.value}`,
    });

    while (queue.length > 0) {
      const currentNode = queue.shift()!;

      // Visit current node
      visitedOrder.push(currentNode.id);

      steps.push({
        nodes: tree.map(node => ({
          ...node,
          visited: visitedOrder.includes(node.id),
          current: node.id === currentNode.id,
        })),
        currentNode: currentNode.id,
        visitedOrder: [...visitedOrder],
        message: `BFS: Visiting node ${currentNode.value} (Level order)`,
      });

      // Add children to queue
      if (currentNode.left) {
        queue.push(currentNode.left);
        steps.push({
          nodes: tree.map(node => ({
            ...node,
            visited: visitedOrder.includes(node.id),
            current: node.id === currentNode.id,
          })),
          currentNode: currentNode.id,
          visitedOrder: [...visitedOrder],
          message: `BFS: Adding left child ${currentNode.left.value} to queue`,
        });
      }

      if (currentNode.right) {
        queue.push(currentNode.right);
        steps.push({
          nodes: tree.map(node => ({
            ...node,
            visited: visitedOrder.includes(node.id),
            current: node.id === currentNode.id,
          })),
          currentNode: currentNode.id,
          visitedOrder: [...visitedOrder],
          message: `BFS: Adding right child ${currentNode.right.value} to queue`,
        });
      }
    }
  };

  // Generate traversal steps
  const generateTraversalSteps = () => {
    if (tree.length === 0) return;

    const steps: AnimationStep[] = [];
    const root = tree[0]; // Assuming first node is root

    // Initial step
    steps.push({
      nodes: tree.map(node => ({ ...node, visited: false, current: false })),
      visitedOrder: [],
      message: `Starting ${traversalType} traversal from root node ${root.value}`,
    });

    // Generate steps based on traversal type
    switch (traversalType) {
      case 'inorder':
        inorderTraversal(root, steps, []);
        break;
      case 'preorder':
        preorderTraversal(root, steps, []);
        break;
      case 'postorder':
        postorderTraversal(root, steps, []);
        break;
      case 'bfs':
        bfsTraversal(root, steps);
        break;
    }

    setSteps(steps);
    setCurrentStep(0);
  };

  // Play animation
  const playAnimation = () => {
    if (steps.length === 0) {
      generateTraversalSteps();
      // Wait for steps to be generated, then start playing
      setTimeout(() => {
        setIsPlaying(true);
        setIsPaused(false);
        intervalRef.current = setInterval(() => {
          setCurrentStep(prev => {
            if (prev >= steps.length - 1) {
              setIsPlaying(false);
              clearInterval(intervalRef.current!);
              return prev;
            }
            return prev + 1;
          });
        }, 1000 - speed * 10);
      }, 100);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          clearInterval(intervalRef.current!);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 - speed * 10);
  };

  // Pause animation
  const pauseAnimation = () => {
    setIsPlaying(false);
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Stop animation
  const stopAnimation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Get current step data
  const currentStepData = steps[currentStep] || {
    nodes: tree,
    visitedOrder: [],
    message: 'Ready to start traversal',
  };

  // Initialize tree on component mount
  useEffect(() => {
    initializeTree();
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className='space-y-6'>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Tree Traversal Controls</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Traversal Type Selection */}
          <div className='flex gap-2 flex-wrap'>
            <Button
              variant={traversalType === 'inorder' ? 'default' : 'outline'}
              onClick={() => {
                setTraversalType('inorder');
                resetVisualization();
              }}
            >
              Inorder
            </Button>
            <Button
              variant={traversalType === 'preorder' ? 'default' : 'outline'}
              onClick={() => {
                setTraversalType('preorder');
                resetVisualization();
              }}
            >
              Preorder
            </Button>
            <Button
              variant={traversalType === 'postorder' ? 'default' : 'outline'}
              onClick={() => {
                setTraversalType('postorder');
                resetVisualization();
              }}
            >
              Postorder
            </Button>
            <Button
              variant={traversalType === 'bfs' ? 'default' : 'outline'}
              onClick={() => {
                setTraversalType('bfs');
                resetVisualization();
              }}
            >
              BFS
            </Button>
          </div>

          {/* Animation Controls */}
          <div className='flex items-center gap-4'>
            <Button
              onClick={isPlaying ? pauseAnimation : playAnimation}
              disabled={isPlaying && isPaused}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={stopAnimation} variant='outline'>
              <RotateCcw size={16} />
              Reset
            </Button>
            <Button onClick={generateTraversalSteps} variant='outline'>
              Generate Steps
            </Button>
          </div>

          {/* Speed Control */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Animation Speed</label>
            <Slider
              value={[speed]}
              onValueChange={([value]) => setSpeed(value)}
              max={100}
              min={10}
              step={10}
              className='w-full'
            />
            <div className='text-xs text-muted-foreground'>
              Speed: {speed}ms per step
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Binary Tree Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='bg-muted/10 rounded-lg p-6 min-h-[400px]'>
            <svg width='100%' height='400' className='overflow-visible'>
              {/* Draw edges */}
              {currentStepData.nodes.map(node => {
                const edges = [];
                if (node.left) {
                  const leftNode = currentStepData.nodes.find(
                    n => n.id === node.left!.id
                  );
                  if (leftNode) {
                    edges.push(
                      <line
                        key={`edge-${node.id}-${leftNode.id}`}
                        x1={node.x}
                        y1={node.y + 20}
                        x2={leftNode.x}
                        y2={leftNode.y - 20}
                        stroke='#64748b'
                        strokeWidth='2'
                      />
                    );
                  }
                }
                if (node.right) {
                  const rightNode = currentStepData.nodes.find(
                    n => n.id === node.right!.id
                  );
                  if (rightNode) {
                    edges.push(
                      <line
                        key={`edge-${node.id}-${rightNode.id}`}
                        x1={node.x}
                        y1={node.y + 20}
                        x2={rightNode.x}
                        y2={rightNode.y - 20}
                        stroke='#64748b'
                        strokeWidth='2'
                      />
                    );
                  }
                }
                return edges;
              })}

              {/* Draw nodes */}
              {currentStepData.nodes.map(node => {
                let nodeColor = '#3b82f6'; // Default blue

                if (node.current) {
                  nodeColor = '#ef4444'; // Red for current
                } else if (node.visited) {
                  nodeColor = '#10b981'; // Green for visited
                }

                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r='25'
                      fill={nodeColor}
                      stroke='#1e293b'
                      strokeWidth='2'
                      className='transition-colors duration-300'
                    />
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor='middle'
                      fill='white'
                      fontSize='16'
                      fontWeight='bold'
                    >
                      {node.value}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Status Message */}
            <div className='mt-4 p-3 bg-muted rounded-lg'>
              <p className='text-sm font-medium'>{currentStepData.message}</p>
              {currentStepData.visitedOrder.length > 0 && (
                <p className='text-xs text-muted-foreground mt-1'>
                  Visited order:{' '}
                  {currentStepData.visitedOrder
                    .map(
                      id => currentStepData.nodes.find(n => n.id === id)?.value
                    )
                    .join(' → ')}
                </p>
              )}
            </div>

            {/* Step Counter */}
            <div className='mt-2 text-xs text-muted-foreground'>
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Tree Traversal Types</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='p-4 border rounded-lg'>
              <h3 className='font-semibold mb-2'>Inorder (L-Root-R)</h3>
              <p className='text-sm text-muted-foreground'>
                Visit left subtree, then root, then right subtree. For BST, this
                gives sorted order.
              </p>
            </div>
            <div className='p-4 border rounded-lg'>
              <h3 className='font-semibold mb-2'>Preorder (Root-L-R)</h3>
              <p className='text-sm text-muted-foreground'>
                Visit root first, then left subtree, then right subtree. Useful
                for copying trees.
              </p>
            </div>
            <div className='p-4 border rounded-lg'>
              <h3 className='font-semibold mb-2'>Postorder (L-R-Root)</h3>
              <p className='text-sm text-muted-foreground'>
                Visit left subtree, then right subtree, then root. Useful for
                deleting trees.
              </p>
            </div>
            <div className='p-4 border rounded-lg'>
              <h3 className='font-semibold mb-2'>BFS (Level Order)</h3>
              <p className='text-sm text-muted-foreground'>
                Visit nodes level by level using a queue. Useful for finding
                shortest paths.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
