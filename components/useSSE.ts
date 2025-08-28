"use client";
import { useEffect } from "react";

export function useSSE(onEvent: (ev: { type: string; data: any }) => void) {
  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.addEventListener("ac", (e) => onEvent({ type: "ac", data: JSON.parse((e as MessageEvent).data) }));
    es.addEventListener("rating", (e) => onEvent({ type: "rating", data: JSON.parse((e as MessageEvent).data) }));
    es.addEventListener("ping", () => {});
    return () => es.close();
  }, [onEvent]);
}
