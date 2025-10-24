// Logging utilities
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  stack?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, stack?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack,
    }

    const formatted = this.formatLog(entry)

    // Console output
    if (this.isDevelopment) {
      const colors = {
        [LogLevel.DEBUG]: "\x1b[36m", // Cyan
        [LogLevel.INFO]: "\x1b[32m", // Green
        [LogLevel.WARN]: "\x1b[33m", // Yellow
        [LogLevel.ERROR]: "\x1b[31m", // Red
        [LogLevel.FATAL]: "\x1b[35m", // Magenta
      }
      const reset = "\x1b[0m"
      console.log(`${colors[level]}[${level}]${reset} ${formatted}`)
    } else {
      console.log(formatted)
    }

    // In production, send to external logging service
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      this.sendToExternalLogger(entry)
    }
  }

  private async sendToExternalLogger(entry: LogEntry) {
    try {
      // Example: Send to Sentry, LogRocket, or similar service
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
    } catch (error) {
      console.error("Failed to send log to external service:", error)
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const stack = error instanceof Error ? error.stack : undefined
    this.log(LogLevel.ERROR, message, context, stack)
  }

  fatal(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const stack = error instanceof Error ? error.stack : undefined
    this.log(LogLevel.FATAL, message, context, stack)
  }
}

export const logger = new Logger()
