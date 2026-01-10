'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCFVerification } from '@/lib/context/cf-verification';
import {
  Clock,
  ExternalLink,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  Code2,
  FileText,
  Send,
  Wifi,
  WifiOff,
  Lock,
  Play,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const CF_REFRESH_INTERVAL = 30000;

interface Problem {
  id: string;
  contestId: number;
  index: string;
  name: string;
  rating: number;
  timeLimit?: string;
  memoryLimit?: string;
  inputSpec?: string;
  outputSpec?: string;
  sampleTests?: Array<{ input: string; output: string }>;
}

interface Contest {
  id: string;
  name: string;
  description: string;
  start_time: string;
  duration_minutes: number;
  problems: Problem[];
  status: 'upcoming' | 'live' | 'ended';
  timeRemaining: number;
  max_participants?: number;
  shareUrl: string;
}

type VerdictSimple =
  | 'UNATTEMPTED'
  | 'AC'
  | 'WA'
  | 'TLE'
  | 'RE'
  | 'CE'
  | 'MLE'
  | 'OTHER';

type Language = 'cpp' | 'python' | 'java';

const CODE_TEMPLATES: Record<Language, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // Your code here
    
    return 0;
}`,
  python: `import sys
from collections import defaultdict, deque

def solve():
    # Your code here
    pass

if __name__ == "__main__":
    solve()`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter out = new PrintWriter(System.out);
        
        // Your code here
        
        out.flush();
        out.close();
    }
}`,
};

const LANGUAGE_LABELS: Record<Language, string> = {
  cpp: 'C++ 20',
  python: 'Python 3',
  java: 'Java 21',
};

const verdictFromCF = (v?: string): VerdictSimple => {
  switch (v) {
    case 'OK':
      return 'AC';
    case 'WRONG_ANSWER':
      return 'WA';
    case 'TIME_LIMIT_EXCEEDED':
      return 'TLE';
    case 'MEMORY_LIMIT_EXCEEDED':
      return 'MLE';
    case 'RUNTIME_ERROR':
      return 'RE';
    case 'COMPILATION_ERROR':
      return 'CE';
    default:
      return v ? 'OTHER' : 'UNATTEMPTED';
  }
};

const getVerdictColor = (verdict: VerdictSimple) => {
  switch (verdict) {
    case 'AC':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'WA':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'TLE':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'MLE':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'RE':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'CE':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function ContestParticipationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { verificationData } = useCFVerification();
  const handle = verificationData?.handle;

  const [localTimeRemaining, setLocalTimeRemaining] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('cpp');
  const [code, setCode] = useState<Record<string, string>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rightTab, setRightTab] = useState<'editor' | 'submissions'>('editor');
  const savedSubmissionsRef = useRef<Set<string>>(new Set());
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: cfData,
    mutate: refreshCF,
    isValidating: cfRefreshing,
  } = useSWR(
    handle
      ? `https://codeforces.com/api/user.status?handle=${encodeURIComponent(
          handle
        )}&from=1&count=100`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: CF_REFRESH_INTERVAL,
    }
  );

  const { data, error, isLoading } = useSWR<{ contest: Contest }>(
    params.id ? `/api/contests/${params.id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const contest = data?.contest;
  const selectedProblem = contest?.problems?.[selectedProblemIndex];

  useEffect(() => {
    if (contest?.timeRemaining) {
      setLocalTimeRemaining(contest.timeRemaining);
    }
  }, [contest?.timeRemaining]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTimeRemaining(prev => {
        if (prev <= 1000) return 0;
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (contest?.status === 'ended' || localTimeRemaining <= 0) {
      setTimeout(() => {
        router.push(`/contests/${params.id}`);
      }, 500);
    }
  }, [contest?.status, localTimeRemaining, params.id, router]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        router.push('/contests');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [router]);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        // Fullscreen not supported or denied
      }
    };
    enterFullscreen();
  }, []);

  const problemVerdicts = useMemo(() => {
    const map = new Map<string, { verdict: VerdictSimple; ts: number }>();
    const list =
      cfData && cfData.status === 'OK' && Array.isArray(cfData.result)
        ? (cfData.result as any[])
        : [];
    list.forEach(sub => {
      const p = sub?.problem;
      if (!p?.contestId || !p?.index) return;
      const key = `${p.contestId}${p.index}`;
      const ts = sub?.creationTimeSeconds || 0;
      const v: VerdictSimple = verdictFromCF(sub?.verdict);
      const current = map.get(key);
      if (!current || ts > current.ts) {
        map.set(key, { verdict: v, ts });
      }
    });
    return map;
  }, [cfData]);

  const saveSubmissionsBatch = useCallback(async () => {
    if (!contest || !contest.problems || contest.status !== 'live') return;
    if (problemVerdicts.size === 0) return;
    if (isSaving) return;

    const newSubmissions: Array<{
      problemId: string;
      status: 'solved' | 'failed';
      penalty: number;
    }> = [];

    for (const problem of contest.problems) {
      const key = `${problem.contestId}${problem.index}`;
      const verdict = problemVerdicts.get(key);

      if (verdict && verdict.verdict !== 'UNATTEMPTED') {
        const submissionKey = `${problem.id}:${verdict.verdict}:${verdict.ts}`;

        if (!savedSubmissionsRef.current.has(submissionKey)) {
          const status = verdict.verdict === 'AC' ? 'solved' : 'failed';
          newSubmissions.push({
            problemId: problem.id,
            status,
            penalty: 0,
          });
          savedSubmissionsRef.current.add(submissionKey);
        }
      }
    }

    if (newSubmissions.length === 0) return;

    setIsSaving(true);
    try {
      await fetch(`/api/contests/${params.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: newSubmissions }),
      });
    } catch (err) {
      console.error('Failed to save submissions:', err);
      for (const sub of newSubmissions) {
        savedSubmissionsRef.current.delete(
          `${sub.problemId}:${sub.status === 'solved' ? 'AC' : 'OTHER'}:0`
        );
      }
    } finally {
      setIsSaving(false);
    }
  }, [contest, problemVerdicts, params.id, isSaving]);

  useEffect(() => {
    saveSubmissionsBatch();
  }, [saveSubmissionsBatch]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen toggle failed
    }
  };

  const getCurrentCode = () => {
    if (!selectedProblem) return '';
    const key = `${selectedProblem.id}-${language}`;
    return code[key] ?? CODE_TEMPLATES[language];
  };

  const setCurrentCode = (newCode: string) => {
    if (!selectedProblem) return;
    const key = `${selectedProblem.id}-${language}`;
    setCode(prev => ({ ...prev, [key]: newCode }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode =
        getCurrentCode().substring(0, start) +
        '    ' +
        getCurrentCode().substring(end);
      setCurrentCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!selectedProblem) return;
    window.open(
      `https://codeforces.com/problemset/problem/${selectedProblem.contestId}/${selectedProblem.index}`,
      '_blank'
    );
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getSubmissionsForCurrentProblem = () => {
    if (!selectedProblem || !cfData?.result) return [];
    const problemKey = `${selectedProblem.contestId}${selectedProblem.index}`;
    return cfData.result
      .filter((s: any) => {
        const p = s?.problem;
        return p && `${p.contestId}${p.index}` === problemKey;
      })
      .slice(0, 20);
  };

  const getTimeUrgency = () => {
    const minutes = localTimeRemaining / (1000 * 60);
    if (minutes <= 5) return 'text-red-400 animate-pulse';
    if (minutes <= 15) return 'text-amber-400';
    return 'text-emerald-400';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Card className="bg-[#161b22]/80 backdrop-blur-xl border-red-500/30 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Contest Not Found
            </h1>
            <p className="text-gray-400 mb-6">
              {error?.message || 'Failed to load contest'}
            </p>
            <Button
              onClick={() => router.push('/contests')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Contests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !contest) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="h-16 border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur-xl px-6 flex items-center">
          <Skeleton className="h-6 w-48 bg-[#30363d]" />
          <div className="ml-auto flex gap-4">
            <Skeleton className="h-9 w-32 bg-[#30363d]" />
            <Skeleton className="h-9 w-24 bg-[#30363d]" />
          </div>
        </div>
        <div className="flex h-[calc(100vh-64px)]">
          <div className="w-64 border-r border-[#30363d] p-4">
            <Skeleton className="h-6 w-24 mb-4 bg-[#30363d]" />
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-14 w-full mb-2 bg-[#30363d]" />
            ))}
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-64 mb-4 bg-[#30363d]" />
            <Skeleton className="h-4 w-full mb-2 bg-[#30363d]" />
            <Skeleton className="h-4 w-3/4 mb-4 bg-[#30363d]" />
            <Skeleton className="h-32 w-full bg-[#30363d]" />
          </div>
          <div className="w-96 border-l border-[#30363d] p-4">
            <Skeleton className="h-8 w-full mb-4 bg-[#30363d]" />
            <Skeleton className="h-64 w-full bg-[#30363d]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Trophy className="h-5 w-5 text-indigo-400 shrink-0" />
          <h1 className="text-lg font-semibold truncate max-w-[200px] lg:max-w-none">
            {contest.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                  handle
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {handle ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">
                  {handle ? 'CF Connected' : 'CF Disconnected'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {handle
                ? `Connected as ${handle}`
                : 'Verify CF handle in profile for auto-sync'}
            </TooltipContent>
          </Tooltip>

          {/* Refresh Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshCF()}
                disabled={!handle || cfRefreshing}
                className="text-gray-400 hover:text-white hover:bg-[#30363d]"
                aria-label="Refresh Codeforces status"
              >
                <RefreshCw
                  className={`h-4 w-4 ${cfRefreshing ? 'animate-spin' : ''}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh CF Status</TooltipContent>
          </Tooltip>

          {/* Timer */}
          {contest.status === 'live' && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] ${getTimeUrgency()}`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg font-semibold tabular-nums">
                {formatTime(localTimeRemaining)}
              </span>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-gray-400 hover:text-white hover:bg-[#30363d]"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left Panel - Problem List */}
        <aside className="w-full lg:w-56 xl:w-64 border-b lg:border-b-0 lg:border-r border-[#30363d] bg-[#161b22]/50 shrink-0">
          <div className="p-3 border-b border-[#30363d]">
            <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Problems ({contest.problems?.length || 0})
            </h2>
          </div>
          <ScrollArea className="h-32 lg:h-[calc(100vh-128px)]">
            <nav className="p-2" role="navigation" aria-label="Problem list">
              {!contest.problems || contest.problems.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  No problems available
                </div>
              ) : (
                <ul className="space-y-1 flex lg:block overflow-x-auto lg:overflow-x-visible">
                  {contest.problems.map((problem, index) => {
                    const key = `${problem.contestId}${problem.index}`;
                    const status =
                      problemVerdicts.get(key)?.verdict ?? 'UNATTEMPTED';
                    const isSolved = status === 'AC';
                    const isAttempted = status !== 'UNATTEMPTED';
                    const isSelected = selectedProblemIndex === index;

                    return (
                      <li key={problem.id}>
                        <button
                          onClick={() => setSelectedProblemIndex(index)}
                          className={`w-full lg:w-auto min-w-[140px] lg:min-w-0 flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 border border-indigo-500/50 text-white'
                              : 'hover:bg-[#21262d] text-gray-300 border border-transparent'
                          }`}
                          aria-current={isSelected ? 'page' : undefined}
                          aria-label={`Problem ${problem.index}: ${problem.name}${isSolved ? ', solved' : isAttempted ? ', attempted' : ''}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSolved
                                ? 'bg-emerald-500/30 text-emerald-400 ring-1 ring-emerald-500/50'
                                : isAttempted
                                  ? 'bg-red-500/30 text-red-400 ring-1 ring-red-500/50'
                                  : 'bg-[#30363d] text-gray-400'
                            }`}
                          >
                            {problem.index}
                          </span>
                          <span className="truncate text-sm flex-1 hidden lg:block">
                            {problem.name}
                          </span>
                          <span className="shrink-0">
                            {isSolved && (
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                            )}
                            {isAttempted && !isSolved && (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </nav>
          </ScrollArea>
        </aside>

        {/* Center Panel - Problem Statement */}
        <main className="flex-1 min-w-0 border-b lg:border-b-0 lg:border-r border-[#30363d] bg-[#0d1117]">
          {selectedProblem ? (
            <ScrollArea className="h-64 lg:h-[calc(100vh-64px)]">
              <div className="p-4 lg:p-6">
                {/* Problem Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
                      <span className="text-indigo-400">
                        {selectedProblem.index}.
                      </span>
                      {selectedProblem.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {selectedProblem.rating && (
                        <Badge
                          variant="outline"
                          className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                        >
                          Rating: {selectedProblem.rating}
                        </Badge>
                      )}
                      {(() => {
                        const key = `${selectedProblem.contestId}${selectedProblem.index}`;
                        const status =
                          problemVerdicts.get(key)?.verdict ?? 'UNATTEMPTED';
                        if (status === 'UNATTEMPTED') return null;
                        return (
                          <Badge
                            className={`${getVerdictColor(status)} border`}
                          >
                            {status === 'AC' ? 'Solved' : `Last: ${status}`}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      window.open(
                        `https://codeforces.com/problemset/problem/${selectedProblem.contestId}/${selectedProblem.index}`,
                        '_blank'
                      )
                    }
                    variant="outline"
                    className="bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-white shrink-0"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open on CF
                  </Button>
                </div>

                {/* Constraints */}
                <Card className="bg-[#161b22]/80 backdrop-blur-xl border-[#30363d] mb-6">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Time Limit:</span>
                        <span className="ml-2 text-white">
                          {selectedProblem.timeLimit || '1s'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Memory Limit:</span>
                        <span className="ml-2 text-white">
                          {selectedProblem.memoryLimit || '256 MB'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Problem Statement Placeholder */}
                <div className="prose prose-invert max-w-none mb-6">
                  <p className="text-gray-400">
                    View the full problem statement on Codeforces. Click
                    &quot;Open on CF&quot; to see constraints, examples, and
                    submit your solution.
                  </p>
                </div>

                {/* Sample Test Cases */}
                {selectedProblem.sampleTests &&
                  selectedProblem.sampleTests.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">
                        Sample Tests
                      </h3>
                      {selectedProblem.sampleTests.map((test, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <Card className="bg-[#161b22]/80 backdrop-blur-xl border-[#30363d]">
                            <CardHeader className="py-2 px-4 border-b border-[#30363d]">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm text-gray-400">
                                  Input #{idx + 1}
                                </CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(test.input, idx * 2)
                                  }
                                  className="h-6 w-6 p-0 text-gray-500 hover:text-white"
                                  aria-label="Copy input"
                                >
                                  {copiedIndex === idx * 2 ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              <pre className="p-3 text-sm font-mono text-gray-300 overflow-x-auto">
                                {test.input}
                              </pre>
                            </CardContent>
                          </Card>
                          <Card className="bg-[#161b22]/80 backdrop-blur-xl border-[#30363d]">
                            <CardHeader className="py-2 px-4 border-b border-[#30363d]">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm text-gray-400">
                                  Output #{idx + 1}
                                </CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(test.output, idx * 2 + 1)
                                  }
                                  className="h-6 w-6 p-0 text-gray-500 hover:text-white"
                                  aria-label="Copy output"
                                >
                                  {copiedIndex === idx * 2 + 1 ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              <pre className="p-3 text-sm font-mono text-gray-300 overflow-x-auto">
                                {test.output}
                              </pre>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a problem to view</p>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel - Code Editor & Submissions */}
        <aside className="w-full lg:w-[400px] xl:w-[480px] bg-[#161b22]/50 shrink-0 flex flex-col">
          <Tabs
            value={rightTab}
            onValueChange={v => setRightTab(v as 'editor' | 'submissions')}
            className="flex flex-col h-full"
          >
            <TabsList className="w-full justify-start rounded-none border-b border-[#30363d] bg-transparent h-11 p-0">
              <TabsTrigger
                value="editor"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent data-[state=active]:text-white px-4 h-full"
              >
                <Code2 className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent data-[state=active]:text-white px-4 h-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="editor"
              className="flex-1 flex flex-col m-0 overflow-hidden"
            >
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between p-3 border-b border-[#30363d] shrink-0">
                <Select
                  value={language}
                  onValueChange={v => setLanguage(v as Language)}
                >
                  <SelectTrigger className="w-[140px] bg-[#21262d] border-[#30363d] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#21262d] border-[#30363d]">
                    {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="text-white hover:bg-[#30363d] focus:bg-[#30363d]"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    Ctrl+Enter to submit
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedProblem}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </Button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 flex">
                  {/* Line Numbers */}
                  <div
                    className="w-12 bg-[#0d1117] border-r border-[#30363d] text-right pr-2 pt-3 select-none overflow-hidden"
                    aria-hidden="true"
                  >
                    {getCurrentCode()
                      .split('\n')
                      .map((_, i) => (
                        <div
                          key={i}
                          className="text-xs text-gray-600 leading-6 font-mono"
                        >
                          {i + 1}
                        </div>
                      ))}
                  </div>
                  {/* Editor Textarea */}
                  <textarea
                    ref={editorRef}
                    value={getCurrentCode()}
                    onChange={e => setCurrentCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-[#0d1117] text-gray-100 font-mono text-sm leading-6 p-3 resize-none outline-none border-none focus:ring-0"
                    spellCheck={false}
                    aria-label="Code editor"
                    placeholder="Write your solution here..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="submissions"
              className="flex-1 m-0 overflow-hidden"
            >
              <ScrollArea className="h-[calc(100vh-128px)] lg:h-full">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-400">
                      {selectedProblem
                        ? `Submissions for ${selectedProblem.index}`
                        : 'Submissions'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refreshCF()}
                      disabled={!handle || cfRefreshing}
                      className="text-gray-500 hover:text-white"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${cfRefreshing ? 'animate-spin' : ''}`}
                      />
                    </Button>
                  </div>

                  {!handle ? (
                    <div className="text-center py-8 text-gray-500">
                      <WifiOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Connect CF handle to view submissions</p>
                    </div>
                  ) : !selectedProblem ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select a problem first</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getSubmissionsForCurrentProblem().length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No submissions yet</p>
                          <p className="text-xs mt-1">
                            Submit on Codeforces and refresh
                          </p>
                        </div>
                      ) : (
                        getSubmissionsForCurrentProblem().map(
                          (sub: any, idx: number) => {
                            const verdict = verdictFromCF(sub?.verdict);
                            const time = sub?.creationTimeSeconds
                              ? new Date(
                                  sub.creationTimeSeconds * 1000
                                ).toLocaleTimeString()
                              : '';
                            return (
                              <Card
                                key={`${sub?.id}-${idx}`}
                                className="bg-[#21262d]/80 backdrop-blur-xl border-[#30363d]"
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={`${getVerdictColor(verdict)} border text-xs`}
                                      >
                                        {verdict}
                                      </Badge>
                                      {sub?.programmingLanguage && (
                                        <span className="text-xs text-gray-500">
                                          {sub.programmingLanguage}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {time}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          }
                        )
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
