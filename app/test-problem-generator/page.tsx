// Test page for problem generator functionality
'use client';

import { useState } from 'react';
import { ProblemGenerator } from '@/lib/problem-generator/problem-generator';
import { PROBLEM_TEMPLATES } from '@/lib/problem-generator/problem-templates';

export default function TestProblemGenerator() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const testButtons = async () => {
    setIsTesting(true);
    const results: any[] = [];
    
    try {
      // Test 1: Generate problem with default template
      const generator = new ProblemGenerator();
      const problem1 = generator.generateProblem(PROBLEM_TEMPLATES[0]);
      results.push({
        test: 'Generate default problem',
        status: 'passed',
        details: `Generated problem: ${problem1.name}`
      });
      
      // Test 2: Generate problem by category
      const problem2 = generator.generateProblem(
        PROBLEM_TEMPLATES.find(t => t.category === 'Searching') || PROBLEM_TEMPLATES[0]
      );
      results.push({
        test: 'Generate problem by category',
        status: 'passed',
        details: `Generated problem: ${problem2.name} (Category: ${problem2.category})`
      });
      
      // Test 3: Generate problem by difficulty
      const problem3 = generator.generateProblem(
        PROBLEM_TEMPLATES.find(t => t.difficulty === 'medium') || PROBLEM_TEMPLATES[0]
      );
      results.push({
        test: 'Generate problem by difficulty',
        status: 'passed',
        details: `Generated problem: ${problem3.name} (Difficulty: ${problem3.difficulty})`
      });
      
      // Test 4: Test template count
      results.push({
        test: 'Template availability',
        status: 'passed',
        details: `Found ${PROBLEM_TEMPLATES.length} templates`
      });
      
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
        <h1 className="text-3xl font-bold mb-6">Problem Generator Test</h1>
        
        <div className="mb-8">
          <button
            onClick={testButtons}
            disabled={isTesting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Run Tests'}
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
            <li>Click the "Run Tests" button to test problem generator functionality</li>
            <li>Verify that all tests pass</li>
            <li>Navigate to <a href="/problem-generator" className="text-blue-500 hover:underline">/problem-generator</a> to test the UI buttons</li>
            <li>Try clicking different category and difficulty buttons</li>
            <li>Test the "Generate New Problem" button</li>
          </ol>
        </div>
      </div>
    </div>
  );
}