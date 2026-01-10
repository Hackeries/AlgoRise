export const logClientError = async (error: Error | string, context?: Record<string, any>) => {
  try {
    const message = typeof error === "string" ? error : error.message
    const stack = typeof error === "string" ? undefined : error.stack

    await fetch("/api/error-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        stack,
        url: typeof window !== "undefined" ? window.location.href : "",
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        context,
      }),
    })
  } catch (err) {
    console.error("Failed to log error:", err)
  }
}

// Global error handler
export const setupGlobalErrorHandler = () => {
  if (typeof window === "undefined") return

  window.addEventListener("error", (event) => {
    logClientError(event.error, {
      type: "uncaught_error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener("unhandledrejection", (event) => {
    logClientError(event.reason, {
      type: "unhandled_rejection",
    })
  })
}
