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

  // Auth-specific logging methods
  logSignup(context: Record<string, any>, success: boolean, error?: Error | unknown) {
    const message = success ? 'User signup successful' : 'User signup failed'
    const level = success ? LogLevel.INFO : LogLevel.ERROR
    const stack = error instanceof Error ? error.stack : undefined
    this.log(level, message, { ...context, event: 'auth.signup' }, stack)
  }

  logLogin(context: Record<string, any>, success: boolean, error?: Error | unknown) {
    const message = success ? 'User login successful' : 'User login failed'
    const level = success ? LogLevel.INFO : LogLevel.ERROR
    const stack = error instanceof Error ? error.stack : undefined
    this.log(level, message, { ...context, event: 'auth.login' }, stack)
  }

  logLogout(context: Record<string, any>) {
    this.log(LogLevel.INFO, 'User logout successful', { ...context, event: 'auth.logout' })
  }

  logOAuthStart(provider: string, context: Record<string, any>) {
    this.log(LogLevel.INFO, `OAuth flow started with ${provider}`, {
      ...context,
      event: 'auth.oauth.start',
      provider,
    })
  }

  logOAuthCallback(provider: string, context: Record<string, any>, success: boolean, error?: Error | unknown) {
    const message = success
      ? `OAuth callback successful from ${provider}`
      : `OAuth callback failed from ${provider}`
    const level = success ? LogLevel.INFO : LogLevel.ERROR
    const stack = error instanceof Error ? error.stack : undefined
    this.log(level, message, { ...context, event: 'auth.oauth.callback', provider }, stack)
  }

  logEmailVerification(context: Record<string, any>, success: boolean, error?: Error | unknown) {
    const message = success ? 'Email verification successful' : 'Email verification failed'
    const level = success ? LogLevel.INFO : LogLevel.ERROR
    const stack = error instanceof Error ? error.stack : undefined
    this.log(level, message, { ...context, event: 'auth.email.verification' }, stack)
  }

  logProfileUpdate(context: Record<string, any>, fields: string[], success: boolean, error?: Error | unknown) {
    const message = success ? 'Profile update successful' : 'Profile update failed'
    const level = success ? LogLevel.INFO : LogLevel.ERROR
    const stack = error instanceof Error ? error.stack : undefined
    this.log(level, message, { ...context, event: 'profile.update', fields }, stack)
  }

  logProfileView(context: Record<string, any>) {
    this.log(LogLevel.DEBUG, 'Profile viewed', { ...context, event: 'profile.view' })
  }

  logCFVerificationStart(context: Record<string, any>, handle: string) {
    this.log(LogLevel.INFO, 'CF verification started', {
      ...context,
      event: 'cf.verification.start',
      handle,
    })
  }

  logCFVerificationCheck(context: Record<string, any>, handle: string, success: boolean, error?: Error | unknown) {
    const message = success ? 'CF verification successful' : 'CF verification check failed'
    const level = success ? LogLevel.INFO : LogLevel.WARN
    const stack = error instanceof Error ? error.stack : undefined
    this.log(level, message, { ...context, event: 'cf.verification.check', handle }, stack)
  }

  logCFVerificationComplete(context: Record<string, any>, handle: string) {
    this.log(LogLevel.INFO, 'CF verification completed', {
      ...context,
      event: 'cf.verification.complete',
      handle,
    })
  }

  logCFHandleUnlink(context: Record<string, any>, handle: string) {
    this.log(LogLevel.INFO, 'CF handle unlinked', {
      ...context,
      event: 'cf.handle.unlink',
      handle,
    })
  }

  logRateLimitExceeded(context: Record<string, any>, endpoint: string) {
    this.log(LogLevel.WARN, 'Rate limit exceeded', {
      ...context,
      event: 'security.rate_limit.exceeded',
      endpoint,
    })
  }

  logUnauthorizedAccess(context: Record<string, any>, resource: string) {
    this.log(LogLevel.WARN, 'Unauthorized access attempt', {
      ...context,
      event: 'security.unauthorized',
      resource,
    })
  }

  logValidationError(context: Record<string, any>, field: string, validationError: string) {
    this.log(LogLevel.WARN, 'Validation error', {
      ...context,
      event: 'validation.error',
      field,
      validationError,
    })
  }
}

export const logger = new Logger()

// Helper to extract context from Next.js request
export function getRequestContext(request: Request): Record<string, any> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const userAgent = request.headers.get('user-agent') || 'unknown'

  return {
    ip,
    userAgent,
  }
}
