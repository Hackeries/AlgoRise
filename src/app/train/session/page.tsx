'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { TrainSessionBuilder } from '@/components/train/TrainSessionBuilder'
import { TrainSessionPanel } from '@/components/train/TrainSessionPanel'
import { TrainSessionSummary } from '@/components/train/TrainSessionSummary'
import { type LogEntry } from '@/components/train/logs/LogsConsole'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type SessionPhase = 'building' | 'training' | 'summary'

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  hints_available?: number;
}

interface SessionMetrics {
  totalProblems: number;
  solvedCount: number;
  skippedCount: number;
  hintsUsed: number;
  accuracy: number;
  avgTimePerProblemMs: number;
  totalTimeMs: number;
}

interface TopicStat {
  solved: number;
  attempted: number;
  hintsUsed: number;
}

interface SessionData {
  id: string;
  status: 'active' | 'paused' | 'finished';
  current_problem_index: number;
  current_problem: Problem | null;
  config: {
    topics: string[];
    hintsEnabled: boolean;
    language: string;
  };
  metrics: SessionMetrics;
  recommendations: string[];
}

interface SessionSummaryData {
  session_id: string;
  status: string;
  metrics: {
    total_problems: number;
    solved_count: number;
    skipped_count: number;
    hints_used: number;
    accuracy: number;
    avg_time_per_problem_ms: number;
    total_time_ms: number;
    topic_stats: Record<string, { solved: number; attempted: number; hintsUsed: number }>;
  };
  topic_mastery: Record<string, number>;
  recommendations: string[];
  next_steps: string[];
  completed_at: number;
}

// max reconnect attempts for SSE before giving up
const MAX_RECONNECT_ATTEMPTS = 5

export default function TrainSessionPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [phase, setPhase] = useState<SessionPhase>('building')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [summary, setSummary] = useState<SessionSummaryData | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentHint, setCurrentHint] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionLost, setConnectionLost] = useState(false)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  // Add log entry
  const addLog = useCallback((event: string, message: string, data?: Record<string, unknown>) => {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      event,
      message,
      timestamp: Date.now(),
      data,
    };
    setLogs((prev) => [...prev, entry]);
  }, []);

  // connect to SSE stream with reconnection logic
  const connectSSE = useCallback((sid: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(`/api/train/session/${sid}/stream`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      reconnectAttemptsRef.current = 0
      setConnectionLost(false)
      addLog('connected', 'Connected to real-time stream')
    }

    eventSource.onerror = () => {
      reconnectAttemptsRef.current += 1

      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setConnectionLost(true)
        addLog('error', 'Connection lost - click Reconnect to continue')
        eventSource.close()
        return
      }

      addLog('error', `Connection lost - reconnecting (attempt ${reconnectAttemptsRef.current})...`)

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      // exponential backoff for reconnection
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
      reconnectTimeoutRef.current = setTimeout(() => {
        if (phase === 'training') {
          connectSSE(sid)
        }
      }, delay)
    }

    // Listen to all events
    const eventTypes = [
      'connected', 'attempt', 'hint', 'skip', 'pass_tests', 'fail_tests',
      'submit', 'pause', 'resume', 'recommendation', 'adaptive_recommendations',
      'metrics_update', 'session_finished',
    ];

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Log the event
          let message = '';
          switch (eventType) {
            case 'connected':
              message = 'Session stream connected';
              break;
            case 'hint':
              message = `Hint: ${data.hint}`;
              setCurrentHint(data.hint);
              break;
            case 'skip':
              message = 'Problem skipped';
              setCurrentHint(null);
              break;
            case 'submit':
              message = `Problem solved! (${data.solvedCount} total)`;
              setCurrentHint(null);
              break;
            case 'pause':
              message = 'Session paused';
              break;
            case 'resume':
              message = 'Session resumed';
              break;
            case 'recommendation':
            case 'adaptive_recommendations':
              message = data.message || data.recommendations?.join('; ') || 'New recommendations';
              break;
            case 'metrics_update':
              message = `Metrics updated (accuracy: ${(data.metrics?.accuracy * 100).toFixed(0)}%)`;
              break;
            case 'session_finished':
              message = 'Session completed!';
              break;
            default:
              message = JSON.stringify(data);
          }
          
          addLog(eventType, message, data);
          
          // Refresh session data on key events
          if (['submit', 'skip', 'pause', 'resume', 'metrics_update'].includes(eventType)) {
            fetchSessionData(sid);
          }
          
          // Handle session finished
          if (eventType === 'session_finished' && data.summary) {
            setSummary(data.summary);
            setPhase('summary');
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      });
    });
  }, [addLog, phase]);

  // Fetch session data
  const fetchSessionData = useCallback(async (sid: string) => {
    try {
      const response = await fetch(`/api/train/session/${sid}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      
      const data = await response.json();
      setSessionData({
        id: data.id,
        status: data.status,
        current_problem_index: data.current_problem_index,
        current_problem: data.current_problem,
        config: data.config,
        metrics: {
          totalProblems: data.metrics.totalProblems,
          solvedCount: data.metrics.solvedCount,
          skippedCount: data.metrics.skippedCount,
          hintsUsed: data.metrics.hintsUsed,
          accuracy: data.metrics.accuracy,
          avgTimePerProblemMs: data.metrics.avgTimePerProblemMs,
          totalTimeMs: Date.now() - data.started_at,
        },
        recommendations: data.recommendations || [],
      });
    } catch (e) {
      console.error('Error fetching session:', e);
    }
  }, []);

  // Start session
  const handleStartSession = async (config: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/train/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }
      
      const data = await response.json();
      setSessionId(data.session_id);
      
      // Fetch initial session data
      await fetchSessionData(data.session_id);
      
      // Connect to SSE
      connectSSE(data.session_id);
      
      setPhase('training');
      addLog('connected', `Session started with ${data.planned_problems.length} problems`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  // Send event to session
  const sendEvent = async (type: string, data: Record<string, unknown> = {}) => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/train/session/${sessionId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to send event');
      }
      
      const result = await response.json();
      
      // Update session data from response
      if (result.current_problem) {
        setSessionData((prev) => prev ? {
          ...prev,
          current_problem: result.current_problem,
          current_problem_index: prev.current_problem_index + (type === 'submit' || type === 'skip' ? 1 : 0),
        } : null);
      }
      
      if (result.metrics) {
        setSessionData((prev) => prev ? {
          ...prev,
          metrics: {
            ...prev.metrics,
            ...result.metrics,
            totalTimeMs: Date.now() - (prev.metrics.totalTimeMs || Date.now()),
          },
        } : null);
      }
      
      // Handle hint response
      if (type === 'hint' && result.hint) {
        setCurrentHint(result.hint);
      }
      
      // Check if no more problems
      if (!result.current_problem && (type === 'submit' || type === 'skip')) {
        // Auto-finish when all problems done
        await handleFinish();
      }
    } catch (e) {
      console.error('Error sending event:', e);
      addLog('error', e instanceof Error ? e.message : 'Failed to send event');
    } finally {
      setIsLoading(false);
    }
  };

  // Finish session
  const handleFinish = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/train/session/${sessionId}/finish`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to finish session');
      }
      
      const result = await response.json();
      setSummary(result);
      setPhase('summary');
      addLog('session_finished', 'Session completed successfully');
    } catch (e) {
      console.error('Error finishing session:', e);
      addLog('error', e instanceof Error ? e.message : 'Failed to finish session');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // manual reconnect handler
  const handleReconnect = useCallback(() => {
    if (sessionId) {
      reconnectAttemptsRef.current = 0
      setConnectionLost(false)
      connectSSE(sessionId)
    }
  }, [sessionId, connectSSE])

  // handle new session
  const handleNewSession = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setSessionId(null)
    setSessionData(null)
    setSummary(null)
    setLogs([])
    setCurrentHint(null)
    setError(null)
    setConnectionLost(false)
    setPhase('building')
  }

  // Loading state
  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {connectionLost && phase === 'training' && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-between">
            <span className="text-yellow-600">Connection lost to training server</span>
            <Button variant="outline" size="sm" onClick={handleReconnect}>
              Reconnect
            </Button>
          </div>
        )}

        {phase === 'building' && (
          <TrainSessionBuilder
            onStartSession={handleStartSession}
            isLoading={isLoading}
          />
        )}

        {phase === 'training' && sessionData && (
          <TrainSessionPanel
            sessionId={sessionData.id}
            status={sessionData.status as 'active' | 'paused'}
            currentProblem={sessionData.current_problem}
            currentProblemIndex={sessionData.current_problem_index}
            metrics={sessionData.metrics}
            topicStats={sessionData.config.topics.reduce((acc, topic) => {
              acc[topic] = { solved: 0, attempted: 0, hintsUsed: 0 };
              return acc;
            }, {} as Record<string, TopicStat>)}
            sessionTopics={sessionData.config.topics}
            recommendations={sessionData.recommendations}
            logs={logs}
            hintsEnabled={sessionData.config.hintsEnabled}
            language={sessionData.config.language}
            currentHint={currentHint}
            onHint={() => sendEvent('hint')}
            onSkip={() => sendEvent('skip')}
            onSubmit={(code) => sendEvent('submit', { code, language: sessionData.config.language })}
            onPause={() => sendEvent('pause')}
            onResume={() => sendEvent('resume')}
            onFinish={handleFinish}
            isLoading={isLoading}
          />
        )}

        {phase === 'summary' && summary && (
          <TrainSessionSummary
            summary={summary}
            onNewSession={handleNewSession}
            onViewAnalytics={() => router.push('/analytics')}
          />
        )}
      </section>
    </main>
  );
}
