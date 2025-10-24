// Problem Generator Client Component
'use client';

import { useState } from 'react';
import { GeneratedProblem, TestCase } from '../../lib/problem-generator/problem-templates';
import { ProblemJudgeService, TestResult } from '../../lib/problem-generator/problem-judge-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProblemGeneratorClient({ 
  problem, 
  onRegenerate 
}: { 
  problem: GeneratedProblem; 
  onRegenerate: () => void;
}) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isJudging, setIsJudging] = useState(false);
  const [judgeResults, setJudgeResults] = useState<TestResult[] | null>(null);
  const [customTestCases, setCustomTestCases] = useState([{ input: '', output: '' }]);
  const [isTestingCustom, setIsTestingCustom] = useState(false);
  const [customTestResults, setCustomTestResults] = useState<TestResult[] | null>(null);

  const handleJudge = async () => {
    setIsJudging(true);
    setJudgeResults(null);
    
    try {
      const judgeService = new ProblemJudgeService();
      const results = await judgeService.validateTestCases(
        problem.testCases,
        code,
        language
      );
      setJudgeResults(results);
    } catch (error) {
      console.error('Error judging problem:', error);
    } finally {
      setIsJudging(false);
    }
  };

  const handleTestCustomCases = async () => {
    setIsTestingCustom(true);
    setCustomTestResults(null);
    
    try {
      const judgeService = new ProblemJudgeService();
      
      // Convert custom test cases to the required format
      const testCases: TestCase[] = customTestCases.map((tc, index) => ({
        input: tc.input,
        output: tc.output,
        type: 'sample'
      }));
      
      const results = await judgeService.validateTestCases(
        testCases,
        code,
        language
      );
      setCustomTestResults(results);
    } catch (error) {
      console.error('Error testing custom cases:', error);
    } finally {
      setIsTestingCustom(false);
    }
  };

  const addCustomTestCase = () => {
    setCustomTestCases([...customTestCases, { input: '', output: '' }]);
  };

  const updateCustomTestCase = (index: number, field: 'input' | 'output', value: string) => {
    const updated = [...customTestCases];
    updated[index][field] = value;
    setCustomTestCases(updated);
  };

  const removeCustomTestCase = (index: number) => {
    if (customTestCases.length > 1) {
      const updated = [...customTestCases];
      updated.splice(index, 1);
      setCustomTestCases(updated);
    }
  };

  const getTestResultBadge = (status: 'passed' | 'failed' | 'error') => {
    switch (status) {
      case 'passed':
        return <Badge variant="default">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'error':
        return <Badge variant="outline">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{problem.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{problem.category}</Badge>
                <Badge variant="outline">{problem.difficulty}</Badge>
                {problem.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
            <Button onClick={onRegenerate} variant="outline">
              Generate New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-muted-foreground">{problem.description}</p>
            
            <h3 className="text-lg font-semibold mt-4">Problem Statement</h3>
            <p className="whitespace-pre-line">{problem.statement}</p>
            
            <h3 className="text-lg font-semibold mt-4">Input Format</h3>
            <p className="whitespace-pre-line">{problem.inputFormat}</p>
            
            <h3 className="text-lg font-semibold mt-4">Output Format</h3>
            <p className="whitespace-pre-line">{problem.outputFormat}</p>
            
            <h3 className="text-lg font-semibold mt-4">Constraints</h3>
            <ul className="list-disc pl-5 space-y-1">
              {problem.constraints.map((constraint: string, i: number) => (
                <li key={i}>{constraint}</li>
              ))}
            </ul>
            
            <h3 className="text-lg font-semibold mt-4">Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {problem.examples.map((example: any, i: number) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Example {i + 1}</h4>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Input</Label>
                        <pre className="bg-muted p-2 rounded text-sm mt-1 whitespace-pre-wrap">{example.input}</pre>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Output</Label>
                        <pre className="bg-muted p-2 rounded text-sm mt-1 whitespace-pre-wrap">{example.output}</pre>
                      </div>
                      {example.explanation && (
                        <div>
                          <Label className="text-sm font-medium">Explanation</Label>
                          <p className="text-sm mt-1">{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="solve">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solve">Solve</TabsTrigger>
          <TabsTrigger value="test">Test Cases</TabsTrigger>
          <TabsTrigger value="custom">Custom Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="solve" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="code">Your Solution</Label>
                  <Textarea
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Write your solution here..."
                    className="font-mono min-h-[300px]"
                  />
                </div>
                
                <Button 
                  onClick={handleJudge} 
                  disabled={isJudging || !code.trim()}
                  className="w-full"
                >
                  {isJudging ? 'Judging...' : 'Run Test Cases'}
                </Button>
                
                {judgeResults && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                    <div className="space-y-2">
                      {judgeResults.map((result, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Test Case {i + 1} ({problem.testCases[i].type})</div>
                              {getTestResultBadge(result.status)}
                            </div>
                            {result.errorMessage && (
                              <p className="text-destructive text-sm mt-1">{result.errorMessage}</p>
                            )}
                            {result.executionTimeMs && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Execution time: {result.executionTimeMs}ms
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Generated Test Cases</h3>
              <div className="space-y-4">
                {problem.testCases.map((testCase: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Test Case {i + 1} ({testCase.type})</div>
                        <Badge variant="secondary">{testCase.type}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Input</Label>
                          <pre className="bg-muted p-2 rounded text-sm mt-1 whitespace-pre-wrap">{testCase.input}</pre>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Expected Output</Label>
                          <pre className="bg-muted p-2 rounded text-sm mt-1 whitespace-pre-wrap">{testCase.output}</pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Custom Test Cases</h3>
              <div className="space-y-4">
                {customTestCases.map((testCase, i) => (
                  <div key={i} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Test Case {i + 1}</h4>
                      {customTestCases.length > 1 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeCustomTestCase(i)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`input-${i}`}>Input</Label>
                        <Textarea
                          id={`input-${i}`}
                          value={testCase.input}
                          onChange={(e) => updateCustomTestCase(i, 'input', e.target.value)}
                          placeholder="Test case input"
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`output-${i}`}>Expected Output</Label>
                        <Textarea
                          id={`output-${i}`}
                          value={testCase.output}
                          onChange={(e) => updateCustomTestCase(i, 'output', e.target.value)}
                          placeholder="Expected output"
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Button onClick={addCustomTestCase} variant="outline">
                    Add Test Case
                  </Button>
                  <Button 
                    onClick={handleTestCustomCases} 
                    disabled={isTestingCustom || customTestCases.some(tc => !tc.input.trim() || !tc.output.trim())}
                  >
                    {isTestingCustom ? 'Testing...' : 'Run Custom Tests'}
                  </Button>
                </div>
                
                {customTestResults && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Custom Test Results</h3>
                    <div className="space-y-2">
                      {customTestResults.map((result, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Test Case {i + 1}</div>
                              {getTestResultBadge(result.status)}
                            </div>
                            {result.errorMessage && (
                              <p className="text-destructive text-sm mt-1">{result.errorMessage}</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div>
                                <Label className="text-sm font-medium">Input</Label>
                                <pre className="bg-muted p-2 rounded text-sm mt-1 whitespace-pre-wrap">{result.input}</pre>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Expected</Label>
                                <pre className="bg-muted p-2 rounded text-sm mt-1 whitespace-pre-wrap">{result.expectedOutput}</pre>
                              </div>
                            </div>
                            {result.actualOutput && (
                              <div className="mt-2">
                                <Label className="text-sm font-medium">Actual Output</Label>
                                <pre className="bg-muted p-2 rounded text-sm mt-1 whitespace-pre-wrap">{result.actualOutput}</pre>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}