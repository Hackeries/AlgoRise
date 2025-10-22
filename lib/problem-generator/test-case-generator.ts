// Test Case Generator Service
import { ProblemTemplate, TestCase } from './problem-templates';

export class TestCaseGenerator {
  /**
   * Generate test cases for a problem template
   * @param template The problem template
   * @returns Array of generated test cases
   */
  generateTestCases(template: ProblemTemplate): TestCase[] {
    const testCases: TestCase[] = [];
    
    // Add the example test cases from the template
    template.examples.forEach((example, index) => {
      testCases.push({
        input: example.input,
        output: example.output,
        type: 'sample',
        constraints: { isExample: true, exampleIndex: index }
      });
    });
    
    // Generate additional test cases based on the template
    testCases.push(...this.generateEdgeCases(template));
    testCases.push(...this.generateRandomCases(template, 5));
    testCases.push(...this.generateStressCases(template));
    
    return testCases;
  }

  /**
   * Generate edge case test cases
   * @param template The problem template
   * @returns Array of edge case test cases
   */
  private generateEdgeCases(template: ProblemTemplate): TestCase[] {
    const edgeCases: TestCase[] = [];
    
    // For array-based problems, generate edge cases with:
    // 1. Minimum size array (1 element)
    // 2. Maximum size array
    // 3. Array with all same elements
    // 4. Array with negative numbers (if applicable)
    // 5. Empty array (if applicable)
    
    switch (template.id) {
      case 'array-sum':
        // Minimum size case
        edgeCases.push({
          input: `1\n1000000000`,
          output: `1000000000`,
          type: 'edge',
          constraints: { n: 1, maxValue: 1000000000 }
        });
        
        // Maximum size case
        const maxSizeArray = Array(100000).fill(1).join(' ');
        edgeCases.push({
          input: `100000\n${maxSizeArray}`,
          output: `100000`,
          type: 'edge',
          constraints: { n: 100000, allOnes: true }
        });
        
        // All same elements
        const sameElementsArray = Array(100).fill(42).join(' ');
        edgeCases.push({
          input: `100\n${sameElementsArray}`,
          output: `4200`,
          type: 'edge',
          constraints: { n: 100, allSame: 42 }
        });
        break;
        
      case 'two-sum':
        // Case with negative numbers
        edgeCases.push({
          input: `4\n-3 -1 0 2\n-1`,
          output: `0 1`,
          type: 'edge',
          constraints: { hasNegatives: true }
        });
        
        // Case with duplicate numbers
        edgeCases.push({
          input: `4\n3 3 1 2\n6`,
          output: `0 1`,
          type: 'edge',
          constraints: { hasDuplicates: true }
        });
        break;
        
      case 'binary-search':
        // Case with single element
        edgeCases.push({
          input: `1\n5\n5`,
          output: `0`,
          type: 'edge',
          constraints: { n: 1 }
        });
        
        // Case with target not found
        edgeCases.push({
          input: `5\n1 3 5 7 9\n4`,
          output: `-1`,
          type: 'edge',
          constraints: { notFound: true }
        });
        break;
        
      case 'max-subarray':
        // All negative numbers
        edgeCases.push({
          input: `5\n-5 -2 -8 -1 -4`,
          output: `-1`,
          type: 'edge',
          constraints: { allNegative: true }
        });
        
        // All positive numbers
        edgeCases.push({
          input: `5\n1 2 3 4 5`,
          output: `15`,
          type: 'edge',
          constraints: { allPositive: true }
        });
        break;
    }
    
    return edgeCases;
  }

  /**
   * Generate random test cases
   * @param template The problem template
   * @param count Number of random cases to generate
   * @returns Array of random test cases
   */
  private generateRandomCases(template: ProblemTemplate, count: number): TestCase[] {
    const randomCases: TestCase[] = [];
    
    for (let i = 0; i < count; i++) {
      switch (template.id) {
        case 'array-sum':
          const n = Math.floor(Math.random() * 1000) + 1; // 1 to 1000
          const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 1000) + 1);
          const sum = arr.reduce((a, b) => a + b, 0);
          randomCases.push({
            input: `${n}\n${arr.join(' ')}`,
            output: `${sum}`,
            type: 'random',
            constraints: { n, maxValue: Math.max(...arr) }
          });
          break;
          
        case 'two-sum':
          const n2 = Math.floor(Math.random() * 998) + 2; // 2 to 1000
          const arr2 = Array.from({ length: n2 }, () => Math.floor(Math.random() * 2000) - 1000);
          const target = arr2[0] + arr2[1]; // Ensure solution exists
          randomCases.push({
            input: `${n2}\n${arr2.join(' ')}\n${target}`,
            output: `0 1`, // This is a simplification - in reality, we'd need to find the actual indices
            type: 'random',
            constraints: { n: n2 }
          });
          break;
      }
    }
    
    return randomCases;
  }

  /**
   * Generate stress test cases (maximum constraints)
   * @param template The problem template
   * @returns Array of stress test cases
   */
  private generateStressCases(template: ProblemTemplate): TestCase[] {
    const stressCases: TestCase[] = [];
    
    switch (template.id) {
      case 'array-sum':
        // Maximum constraints case
        const maxSize = 100000;
        const maxVal = 1000000000;
        const stressArray = Array(maxSize).fill(maxVal).join(' ');
        const stressSum = (BigInt(maxVal) * BigInt(maxSize)).toString();
        stressCases.push({
          input: `${maxSize}\n${stressArray}`,
          output: `${stressSum}`,
          type: 'stress',
          constraints: { n: maxSize, maxValue: maxVal }
        });
        break;
    }
    
    return stressCases;
  }
}

// Export singleton instance
export default new TestCaseGenerator();