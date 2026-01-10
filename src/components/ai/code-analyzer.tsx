'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, AlertCircle, CheckCircle2, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeAnalyzerProps {
  code: string;
  language: string;
  problemContext?: string;
  className?: string;
}

interface CodeAnalysisResult {
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  suggestions: string[];
  timeComplexity: string;
  spaceComplexity: string;
  issues: { severity: 'info' | 'warning' | 'error'; message: string }[];
}

export function CodeAnalyzer({ code, language, problemContext, className }: CodeAnalyzerProps) {
  const [analysis, setAnalysis] = useState<CodeAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('No code to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, problemContext }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze code');
      }

      const data: CodeAnalysisResult = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Code analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze code');
    } finally {
      setIsLoading(false);
    }
  };

  const qualityColors = {
    poor: 'text-red-500 bg-red-500/10',
    fair: 'text-yellow-500 bg-yellow-500/10',
    good: 'text-green-500 bg-green-500/10',
    excellent: 'text-blue-500 bg-blue-500/10',
  };

  const severityIcons = {
    info: <Info className="w-4 h-4 text-blue-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Code Analyzer</CardTitle>
              <CardDescription className="text-xs">
                AI-powered code quality analysis
              </CardDescription>
            </div>
          </div>
          <Button onClick={analyzeCode} disabled={isLoading || !code.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Code'
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : analysis ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Quality Badge */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Quality</p>
                  <Badge className={cn('text-lg px-4 py-1 capitalize', qualityColors[analysis.quality])}>
                    {analysis.quality}
                  </Badge>
                </div>
              </div>

              {/* Complexity Analysis */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Time Complexity</p>
                  <p className="font-mono font-semibold text-lg">{analysis.timeComplexity}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Space Complexity</p>
                  <p className="font-mono font-semibold text-lg">{analysis.spaceComplexity}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-medium">{analysis.issues.filter(i => i.severity === 'error').length}</span>
                  <span className="text-muted-foreground">Errors</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 font-medium">{analysis.issues.filter(i => i.severity === 'warning').length}</span>
                  <span className="text-muted-foreground">Warnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 font-medium">{analysis.suggestions.length}</span>
                  <span className="text-muted-foreground">Suggestions</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="issues" className="mt-4">
              {analysis.issues.length > 0 ? (
                <div className="space-y-2">
                  {analysis.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      {severityIcons[issue.severity]}
                      <span className="text-sm">{issue.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mb-2 text-green-500" />
                  <p>No issues found!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="mt-4">
              {analysis.suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm">
                      <span className="text-blue-500 font-medium">{i + 1}.</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <p>No additional suggestions</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Code2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-center">
              Click "Analyze Code" to get AI-powered insights
              <br />
              <span className="text-xs">Includes complexity analysis and improvement suggestions</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
