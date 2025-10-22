// Problem Generator Page
'use client';

import { useState, useEffect } from 'react';
import { ProblemGenerator } from '@/lib/problem-generator/problem-generator';
import { GeneratedProblem } from '@/lib/problem-generator/problem-templates';
import { ProblemGeneratorClient } from '@/components/problem-generator/problem-generator-client';

export default function ProblemGeneratorPage() {
  const [generatedProblem, setGeneratedProblem] = useState<GeneratedProblem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProblem = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we'll use the first template
      const { PROBLEM_TEMPLATES } = require('@/lib/problem-generator/problem-templates');
      const generator = new ProblemGenerator();
      const problem = generator.generateProblem(PROBLEM_TEMPLATES[0]);
      setGeneratedProblem(problem);
    } catch (err) {
      setError('Failed to generate problem');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Generate an initial problem on page load
    generateProblem();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Problem Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate algorithmic problems and test cases for practice
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p>Generating problem...</p>
              </div>
            ) : error ? (
              <div className="bg-destructive/20 border border-destructive rounded-lg p-4">
                <p className="text-destructive">{error}</p>
                <button 
                  onClick={generateProblem}
                  className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            ) : generatedProblem ? (
              <ProblemGeneratorClient 
                problem={generatedProblem} 
                onRegenerate={generateProblem}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p>No problem generated yet</p>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Generator Options</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        setIsLoading(true);
                        try {
                          const generator = new ProblemGenerator();
                          const { PROBLEM_TEMPLATES } = require('@/lib/problem-generator/problem-templates');
                          const problem = generator.generateProblem(PROBLEM_TEMPLATES[0]);
                          setGeneratedProblem(problem);
                        } catch (err) {
                          setError('Failed to generate problem');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 bg-secondary rounded hover:bg-secondary/80"
                    >
                      Arrays
                    </button>
                    <button 
                      onClick={() => {
                        setIsLoading(true);
                        try {
                          const generator = new ProblemGenerator();
                          const { PROBLEM_TEMPLATES } = require('@/lib/problem-generator/problem-templates');
                          const problem = generator.generateProblem(PROBLEM_TEMPLATES[2]);
                          setGeneratedProblem(problem);
                        } catch (err) {
                          setError('Failed to generate problem');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 bg-secondary rounded hover:bg-secondary/80"
                    >
                      Searching
                    </button>
                    <button 
                      onClick={() => {
                        setIsLoading(true);
                        try {
                          const generator = new ProblemGenerator();
                          const { PROBLEM_TEMPLATES } = require('@/lib/problem-generator/problem-templates');
                          const problem = generator.generateProblem(PROBLEM_TEMPLATES[3]);
                          setGeneratedProblem(problem);
                        } catch (err) {
                          setError('Failed to generate problem');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 bg-secondary rounded hover:bg-secondary/80"
                    >
                      Dynamic Programming
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Difficulty</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-secondary rounded text-sm hover:bg-secondary/80">
                      Easy
                    </button>
                    <button className="px-3 py-1 bg-secondary rounded text-sm hover:bg-secondary/80">
                      Medium
                    </button>
                    <button className="px-3 py-1 bg-secondary rounded text-sm hover:bg-secondary/80">
                      Hard
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={generateProblem}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  Generate New Problem
                </button>
              </div>
            </div>
            
            <div className="bg-card border rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">About Problem Generator</h2>
              <p className="text-muted-foreground text-sm">
                Our problem generator creates algorithmic problems using predefined templates with randomized constraints. 
                Each problem comes with comprehensive test cases including edge cases and stress tests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}