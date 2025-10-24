// Test page for random problem generation
'use client';

import { useState } from 'react';
import { ProblemGenerator } from '@/lib/problem-generator/problem-generator';
import { PROBLEM_TEMPLATES } from '@/lib/problem-generator/problem-templates';

export default function TestRandomGeneration() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const testRandomGeneration = async () => {
    setIsTesting(true);
    const results: any[] = [];
    
    try {
      const generator = new ProblemGenerator();
      
      // Test 10 random generations
      for (let i = 0; i < 10; i++) {
        const problem = generator.generateProblem(
          PROBLEM_TEMPLATES[Math.floor(Math.random() * PROBLEM_TEMPLATES.length)]
        );
        
        results.push({
          test: `Generation ${i + 1}`,
          status: 'passed',
          details: `Problem: ${problem.name} (Category: ${problem.category}, Difficulty: ${problem.difficulty})`
        });
      }
      
      // Test category-based generation
      const categories = ['Arrays', 'Searching', 'Dynamic Programming'];
      for (const category of categories) {
        const categoryTemplates = PROBLEM_TEMPLATES.filter(
          template => template.category === category
        );
        
        if (categoryTemplates.length > 0) {
          const randomTemplate = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
          const problem = generator.generateProblem(randomTemplate);
          
          results.push({
            test: `Category generation: ${category}`,
            status: 'passed',
            details: `Problem: ${problem.name} (Category: ${problem.category}, Difficulty: ${problem.difficulty})`
          });
        }
      }
      
      // Test difficulty-based generation
      const difficulties = ['easy', 'medium', 'hard'];
      for (const difficulty of difficulties) {
        const difficultyTemplates = PROBLEM_TEMPLATES.filter(
          template => template.difficulty === difficulty
        );
        
        if (difficultyTemplates.length > 0) {
          const randomTemplate = difficultyTemplates[Math.floor(Math.random() * difficultyTemplates.length)];
          const problem = generator.generateProblem(randomTemplate);
          
          results.push({
            test: `Difficulty generation: ${difficulty}`,
            status: 'passed',
            details: `Problem: ${problem.name} (Category: ${problem.category}, Difficulty: ${problem.difficulty})`
          });
        }
      }
      
    } catch (error) {
      results.push({
        test: 'Error occurred',
        status: 'failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
      setTestResults(results);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Random Problem Generation Test</h1>
        
        <div className="mb-8">
          <button
            onClick={testRandomGeneration}
            disabled={isTesting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Run Random Generation Tests'}
          </button>
        </div>
        
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Test Results</h2>
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  result.status === 'passed' 
                    ? 'bg-green-500/20 border-green-500' 
                    : 'bg-red-500/20 border-red-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{result.test}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.status === 'passed' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {result.status}
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">{result.details}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click the "Run Random Generation Tests" button</li>
            <li>Verify that different problems are generated each time</li>
            <li>Check that category and difficulty-based generation works correctly</li>
            <li>Navigate to <a href="/problem-generator" className="text-blue-500 hover:underline">/problem-generator</a> to test the UI</li>
            <li>Try clicking the "Generate New Problem" button multiple times</li>
          </ol>
        </div>
      </div>
    </div>
  );
}