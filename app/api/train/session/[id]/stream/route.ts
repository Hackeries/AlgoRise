import { NextRequest } from 'next/server';
import { createSSEStream } from '@/lib/train/stream';
import { getSession } from '@/lib/train/session';

/**
 * GET /api/train/session/[id]/stream
 * Server-Sent Events endpoint for real-time session updates.
 * 
 * Client should connect with auto-reconnect logic:
 * ```javascript
 * const eventSource = new EventSource('/api/train/session/123/stream');
 * eventSource.onmessage = (event) => { ... };
 * eventSource.onerror = () => { setTimeout(() => reconnect(), 3000); };
 * ```
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  // Verify session exists
  const session = getSession(sessionId);
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Session not found' }),
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Create SSE stream
  const stream = createSSEStream(sessionId);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
