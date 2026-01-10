/**
 * Per-session pub-sub system for SSE streaming.
 * 
 * TODO: Replace in-memory subscribers with Redis pub-sub for horizontal scaling.
 */

type Subscriber = (data: string) => void;

// In-memory subscriber map: sessionId -> Set of subscriber callbacks
const subscribers = new Map<string, Set<Subscriber>>();

/**
 * Subscribe to a session's event stream.
 * 
 * @param sessionId - The session ID to subscribe to
 * @param callback - Function to call when a message is published
 * @returns Unsubscribe function
 */
export function subscribe(sessionId: string, callback: Subscriber): () => void {
  if (!subscribers.has(sessionId)) {
    subscribers.set(sessionId, new Set());
  }
  subscribers.get(sessionId)!.add(callback);

  return () => {
    const subs = subscribers.get(sessionId);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        subscribers.delete(sessionId);
      }
    }
  };
}

/**
 * Publish a message to all subscribers of a session.
 * 
 * @param sessionId - The session ID to publish to
 * @param event - The event type (e.g., 'state_update', 'metrics', 'recommendation')
 * @param data - The data to publish
 */
export function publish(sessionId: string, event: string, data: unknown): void {
  const subs = subscribers.get(sessionId);
  if (!subs || subs.size === 0) {
    return;
  }

  const message = formatSSEMessage(event, data);
  subs.forEach((callback) => {
    try {
      callback(message);
    } catch (error) {
      console.error('Error in SSE subscriber callback:', error);
    }
  });
}

/**
 * Format data as SSE message.
 */
export function formatSSEMessage(event: string, data: unknown): string {
  const jsonData = JSON.stringify(data);
  return `event: ${event}\ndata: ${jsonData}\n\n`;
}

/**
 * Create an SSE ReadableStream for a session.
 * Includes heartbeat to keep connection alive.
 * 
 * @param sessionId - The session ID to stream
 * @returns ReadableStream for SSE
 */
export function createSSEStream(sessionId: string): ReadableStream {
  let unsubscribe: (() => void) | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  return new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(
        encoder.encode(formatSSEMessage('connected', { sessionId, timestamp: Date.now() }))
      );

      // Subscribe to session events
      unsubscribe = subscribe(sessionId, (message) => {
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          // Stream closed
        }
      });

      // Heartbeat every 30 seconds to keep connection alive
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          // Stream closed
        }
      }, 30000);
    },

    cancel() {
      if (unsubscribe) {
        unsubscribe();
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    },
  });
}

/**
 * Get count of active subscribers for a session.
 */
export function getSubscriberCount(sessionId: string): number {
  return subscribers.get(sessionId)?.size ?? 0;
}
