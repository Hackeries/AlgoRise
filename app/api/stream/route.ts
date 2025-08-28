import { NextRequest } from "next/server";
import { events } from "@/lib/events";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (type: string, payload: any) => {
        controller.enqueue(encoder.encode(`event: ${type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const onAC = (payload: any) => send("ac", payload);
      const onRating = (payload: any) => send("rating", payload);

      events.on("ac", onAC);
      events.on("rating", onRating);

      const keepalive = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
      }, 15000);

      return () => {
        events.off("ac", onAC);
        events.off("rating", onRating);
        clearInterval(keepalive);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
