// Utility functions for algorithm visualizations

export interface AlgorithmStep {
  array?: number[];
  matrix?: number[][];
  message: string;
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  visited?: number[];
  current?: number;
  highlight?: number[];
}

// Sorting Algorithms
export function* bubbleSortGenerator(arr: number[]) {
  const n = arr.length;
  const workingArray = [...arr];

  yield {
    array: [...workingArray],
    message: 'Starting Bubble Sort...',
  };

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield {
        array: [...workingArray],
        comparing: [j, j + 1],
        message: `Comparing elements at positions ${j} and ${j + 1}`,
      };

      if (workingArray[j] > workingArray[j + 1]) {
        yield {
          array: [...workingArray],
          swapping: [j, j + 1],
          message: `Swapping ${workingArray[j]} and ${workingArray[j + 1]}`,
        };
        [workingArray[j], workingArray[j + 1]] = [
          workingArray[j + 1],
          workingArray[j],
        ];

        yield {
          array: [...workingArray],
          message: 'Swap complete',
        };
      }
    }

    yield {
      array: [...workingArray],
      sorted: Array.from({ length: n - i }, (_, idx) => n - i - 1 + idx),
      message: `Element at position ${n - i - 1} is in final position`,
    };
  }

  yield {
    array: [...workingArray],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    message: 'Bubble Sort completed!',
  };
}

export function* selectionSortGenerator(arr: number[]) {
  const n = arr.length;
  const workingArray = [...arr];

  yield {
    array: [...workingArray],
    message: 'Starting Selection Sort...',
  };

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    yield {
      array: [...workingArray],
      highlight: [i],
      message: `Finding minimum from position ${i}`,
    };

    for (let j = i + 1; j < n; j++) {
      yield {
        array: [...workingArray],
        comparing: [minIdx, j],
        message: `Comparing ${workingArray[minIdx]} and ${workingArray[j]}`,
      };

      if (workingArray[j] < workingArray[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [workingArray[i], workingArray[minIdx]] = [
        workingArray[minIdx],
        workingArray[i],
      ];
      yield {
        array: [...workingArray],
        swapping: [i, minIdx],
        message: `Swapped ${workingArray[minIdx]} and ${workingArray[i]}`,
      };
    }

    yield {
      array: [...workingArray],
      sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
      message: `Element at position ${i} is in final position`,
    };
  }

  yield {
    array: [...workingArray],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    message: 'Selection Sort completed!',
  };
}

export function* insertionSortGenerator(arr: number[]) {
  const n = arr.length;
  const workingArray = [...arr];

  yield {
    array: [...workingArray],
    message: 'Starting Insertion Sort...',
  };

  for (let i = 1; i < n; i++) {
    const key = workingArray[i];
    let j = i - 1;

    yield {
      array: [...workingArray],
      highlight: [i],
      message: `Inserting ${key} into sorted portion`,
    };

    while (j >= 0 && workingArray[j] > key) {
      yield {
        array: [...workingArray],
        comparing: [j, j + 1],
        message: `Comparing ${workingArray[j]} and ${key}`,
      };

      workingArray[j + 1] = workingArray[j];
      j--;

      yield {
        array: [...workingArray],
        message: `Shifted ${workingArray[j + 1]}`,
      };
    }

    workingArray[j + 1] = key;
    yield {
      array: [...workingArray],
      sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
      message: `${key} inserted in correct position`,
    };
  }

  yield {
    array: [...workingArray],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    message: 'Insertion Sort completed!',
  };
}

export function* quickSortGenerator(arr: number[]) {
  const workingArray = [...arr];

  yield {
    array: [...workingArray],
    message: 'Starting Quick Sort...',
  };

  function* partition(low: number, high: number): Generator<AlgorithmStep> {
    const pivot = workingArray[high];
    let i = low - 1;

    yield {
      array: [...workingArray],
      highlight: [high],
      message: `Pivot selected: ${pivot}`,
    };

    for (let j = low; j < high; j++) {
      yield {
        array: [...workingArray],
        comparing: [j, high],
        message: `Comparing ${workingArray[j]} with pivot ${pivot}`,
      };

      if (workingArray[j] < pivot) {
        i++;
        [workingArray[i], workingArray[j]] = [workingArray[j], workingArray[i]];

        yield {
          array: [...workingArray],
          swapping: [i, j],
          message: `Swapped elements`,
        };
      }
    }
    [workingArray[i + 1], workingArray[high]] = [
      workingArray[high],
      workingArray[i + 1],
    ];

    yield {
      array: [...workingArray],
      sorted: [i + 1],
      message: `Pivot in final position`,
    };

    return i + 1;
  }

  function* quickSortRecursive(
    low: number,
    high: number
  ): Generator<AlgorithmStep> {
    if (low < high) {
      let pi = low;
      for (const step of partition(low, high)) {
        yield step;
        if (step.sorted?.includes(high)) {
          pi = high;
        }
      }
      yield* quickSortRecursive(low, pi - 1);
      yield* quickSortRecursive(pi + 1, high);
    }
  }

  yield* quickSortRecursive(0, workingArray.length - 1);

  yield {
    array: [...workingArray],
    sorted: Array.from({ length: workingArray.length }, (_, idx) => idx),
    message: 'Quick Sort completed!',
  };
}

export function* mergeSortGenerator(arr: number[]) {
  const workingArray = [...arr];

  yield {
    array: [...workingArray],
    message: 'Starting Merge Sort...',
  };

  function* merge(
    left: number,
    mid: number,
    right: number
  ): Generator<AlgorithmStep> {
    const leftArr = workingArray.slice(left, mid + 1);
    const rightArr = workingArray.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      yield {
        array: [...workingArray],
        comparing: [left + i, mid + 1 + j],
        message: `Comparing ${leftArr[i]} and ${rightArr[j]}`,
      };

      if (leftArr[i] <= rightArr[j]) {
        workingArray[k] = leftArr[i];
        i++;
      } else {
        workingArray[k] = rightArr[j];
        j++;
      }
      k++;

      yield {
        array: [...workingArray],
        message: 'Merged elements',
      };
    }

    while (i < leftArr.length) {
      workingArray[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < rightArr.length) {
      workingArray[k] = rightArr[j];
      j++;
      k++;
    }

    yield {
      array: [...workingArray],
      sorted: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
      message: `Merged range [${left}, ${right}]`,
    };
  }

  function* mergeSortRecursive(
    left: number,
    right: number
  ): Generator<AlgorithmStep> {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      yield* mergeSortRecursive(left, mid);
      yield* mergeSortRecursive(mid + 1, right);
      yield* merge(left, mid, right);
    }
  }

  yield* mergeSortRecursive(0, workingArray.length - 1);

  yield {
    array: [...workingArray],
    sorted: Array.from({ length: workingArray.length }, (_, idx) => idx),
    message: 'Merge Sort completed!',
  };
}

// Searching Algorithms
export function* linearSearchGenerator(arr: number[], target: number) {
  yield {
    array: [...arr],
    message: `Searching for ${target}...`,
  };

  for (let i = 0; i < arr.length; i++) {
    yield {
      array: [...arr],
      comparing: [i],
      message: `Checking index ${i}: ${arr[i]}`,
    };

    if (arr[i] === target) {
      yield {
        array: [...arr],
        sorted: [i],
        message: `Found ${target} at index ${i}!`,
      };
      return;
    }
  }

  yield {
    array: [...arr],
    message: `${target} not found in array`,
  };
}

export function* binarySearchGenerator(arr: number[], target: number) {
  yield {
    array: [...arr],
    message: `Binary search for ${target}...`,
  };

  let left = 0,
    right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    yield {
      array: [...arr],
      comparing: [mid],
      message: `Checking middle: ${arr[mid]}`,
    };

    if (arr[mid] === target) {
      yield {
        array: [...arr],
        sorted: [mid],
        message: `Found ${target} at index ${mid}!`,
      };
      return;
    }

    if (arr[mid] < target) {
      left = mid + 1;
      yield {
        array: [...arr],
        message: `${target} > ${arr[mid]}, search right half`,
      };
    } else {
      right = mid - 1;
      yield {
        array: [...arr],
        message: `${target} < ${arr[mid]}, search left half`,
      };
    }
  }

  yield {
    array: [...arr],
    message: `${target} not found in array`,
  };
}

// Graph Algorithms
export function* bfsGenerator(graph: number[][], start: number) {
  const visited = new Set<number>();
  const queue: number[] = [start];
  visited.add(start);

  yield {
    visited: Array.from(visited),
    current: start,
    message: `Starting BFS from node ${start}`,
  };

  while (queue.length > 0) {
    const node = queue.shift()!;

    yield {
      visited: Array.from(visited),
      current: node,
      message: `Visiting node ${node}`,
    };

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);

        yield {
          visited: Array.from(visited),
          current: neighbor,
          message: `Added node ${neighbor} to queue`,
        };
      }
    }
  }

  yield {
    visited: Array.from(visited),
    message: 'BFS completed!',
  };
}

export function* dfsGenerator(graph: number[][], start: number) {
  const visited = new Set<number>();

  function* dfsRecursive(node: number): Generator<any> {
    visited.add(node);

    yield {
      visited: Array.from(visited),
      current: node,
      message: `Visiting node ${node}`,
    };

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        yield* dfsRecursive(neighbor);
      }
    }
  }

  yield {
    visited: Array.from(visited),
    current: start,
    message: `Starting DFS from node ${start}`,
  };

  yield* dfsRecursive(start);

  yield {
    visited: Array.from(visited),
    message: 'DFS completed!',
  };
}

// Dynamic Programming
export function* fibonacciGenerator(n: number) {
  const dp: number[] = [0, 1];

  yield {
    array: [...dp],
    message: `Computing Fibonacci(${n})...`,
  };

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];

    yield {
      array: [...dp],
      highlight: [i - 1, i - 2, i],
      message: `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i]}`,
    };
  }

  yield {
    array: [...dp],
    sorted: [n],
    message: `Fibonacci(${n}) = ${dp[n]}`,
  };
}

export function* knapsackGenerator(
  weights: number[],
  values: number[],
  capacity: number
) {
  const n = weights.length;
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));

  yield {
    matrix: dp.map(row => [...row]),
    message: 'Starting 0/1 Knapsack DP...',
  };

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          values[i - 1] + dp[i - 1][w - weights[i - 1]],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }

      if (i % 2 === 0 && w % 5 === 0) {
        yield {
          matrix: dp.map(row => [...row]),
          highlight: [i, w],
          message: `Filling dp[${i}][${w}] = ${dp[i][w]}`,
        };
      }
    }
  }

  yield {
    matrix: dp.map(row => [...row]),
    sorted: [n, capacity],
    message: `Maximum value: ${dp[n][capacity]}`,
  };
}