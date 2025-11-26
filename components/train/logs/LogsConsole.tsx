'use client';

import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, AlertCircle, CheckCircle2, Info, Lightbulb, Zap } from 'lucide-react';

/**
 * Real-time SSE event log display.
 */

export interface LogEntry {
  id: string;
  event: string;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

interface LogsConsoleProps {
  logs: LogEntry[];
  maxHeight?: string;
}

const eventIcons: Record<string, React.ReactNode> = {
  connected: <Zap className="h-3 w-3 text-green-500" />,
  attempt: <Info className="h-3 w-3 text-blue-500" />,
  hint: <Lightbulb className="h-3 w-3 text-yellow-500" />,
  skip: <AlertCircle className="h-3 w-3 text-orange-500" />,
  pass_tests: <CheckCircle2 className="h-3 w-3 text-green-500" />,
  fail_tests: <AlertCircle className="h-3 w-3 text-red-500" />,
  submit: <CheckCircle2 className="h-3 w-3 text-green-500" />,
  pause: <Info className="h-3 w-3 text-gray-500" />,
  resume: <Zap className="h-3 w-3 text-blue-500" />,
  recommendation: <Lightbulb className="h-3 w-3 text-purple-500" />,
  adaptive_recommendations: <Lightbulb className="h-3 w-3 text-purple-500" />,
  metrics_update: <Info className="h-3 w-3 text-cyan-500" />,
  session_finished: <CheckCircle2 className="h-3 w-3 text-green-500" />,
  error: <AlertCircle className="h-3 w-3 text-red-500" />,
};

const eventColors: Record<string, string> = {
  connected: 'bg-green-500/20 text-green-500',
  attempt: 'bg-blue-500/20 text-blue-500',
  hint: 'bg-yellow-500/20 text-yellow-500',
  skip: 'bg-orange-500/20 text-orange-500',
  pass_tests: 'bg-green-500/20 text-green-500',
  fail_tests: 'bg-red-500/20 text-red-500',
  submit: 'bg-green-500/20 text-green-500',
  pause: 'bg-gray-500/20 text-gray-500',
  resume: 'bg-blue-500/20 text-blue-500',
  recommendation: 'bg-purple-500/20 text-purple-500',
  adaptive_recommendations: 'bg-purple-500/20 text-purple-500',
  metrics_update: 'bg-cyan-500/20 text-cyan-500',
  session_finished: 'bg-green-500/20 text-green-500',
  error: 'bg-red-500/20 text-red-500',
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function LogsConsole({ logs, maxHeight = '300px' }: LogsConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Event Log
          <Badge variant="secondary" className="ml-auto">
            {logs.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea
          ref={scrollRef}
          className="px-4 pb-4"
          style={{ maxHeight }}
        >
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No events yet. Start solving problems to see activity.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 text-xs font-mono"
                >
                  <span className="text-muted-foreground flex-shrink-0">
                    [{formatTime(log.timestamp)}]
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {eventIcons[log.event] || <Info className="h-3 w-3" />}
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1 py-0 ${eventColors[log.event] || ''}`}
                    >
                      {log.event}
                    </Badge>
                  </div>
                  <span className="text-foreground break-all">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
