"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase-browser"; // your supabase init for browser

export function useRealtime(userId: string, onSubmission?: () => void, onRating?: () => void) {
  useEffect(() => {
    const supabase = createClient();

    // Listen for new submissions
    const subListener = supabase
      .channel("submissions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submission", filter: `userId=eq.${userId}` },
        () => {
          onSubmission?.();
        }
      )
      .subscribe();

    // Listen for rating changes
    const ratingListener = supabase
      .channel("rating")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ratingSnapshot", filter: `userId=eq.${userId}` },
        () => {
          onRating?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subListener);
      supabase.removeChannel(ratingListener);
    };
  }, [userId, onSubmission, onRating]);
}
