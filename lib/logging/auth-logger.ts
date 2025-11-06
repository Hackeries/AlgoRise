/**
 * Structured logging utility for authentication and profile events
 * Provides consistent logging format across the application
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface AuthEvent {
  event: string;
  level: LogLevel;
  timestamp: string;
  context?: LogContext;
  message?: string;
  error?: any;
}

class Logger {
  private formatLog(event: AuthEvent): string {
    const { event: eventName, level, timestamp, context, message, error } = event;
    
    const logData: any = {
      event: eventName,
      level,
      timestamp,
    };

    if (message) {
      logData.message = message;
    }

    if (context) {
      logData.context = context;
    }

    if (error) {
      logData.error = {
        message: error.message || String(error),
        stack: error.stack,
        ...error,
      };
    }

    return JSON.stringify(logData);
  }

  private log(event: AuthEvent): void {
    const formatted = this.formatLog(event);
    
    switch (event.level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(formatted);
        }
        break;
      case 'info':
      default:
        console.log(formatted);
    }
  }

  // Auth Events
  logSignup(context: LogContext, success: boolean, error?: any): void {
    this.log({
      event: 'auth.signup',
      level: success ? 'info' : 'error',
      timestamp: new Date().toISOString(),
      context,
      message: success ? 'User signup successful' : 'User signup failed',
      error,
    });
  }

  logLogin(context: LogContext, success: boolean, error?: any): void {
    this.log({
      event: 'auth.login',
      level: success ? 'info' : 'error',
      timestamp: new Date().toISOString(),
      context,
      message: success ? 'User login successful' : 'User login failed',
      error,
    });
  }

  logLogout(context: LogContext): void {
    this.log({
      event: 'auth.logout',
      level: 'info',
      timestamp: new Date().toISOString(),
      context,
      message: 'User logout successful',
    });
  }

  logOAuthStart(provider: string, context: LogContext): void {
    this.log({
      event: 'auth.oauth.start',
      level: 'info',
      timestamp: new Date().toISOString(),
      context: { ...context, provider },
      message: `OAuth flow started with ${provider}`,
    });
  }

  logOAuthCallback(provider: string, context: LogContext, success: boolean, error?: any): void {
    this.log({
      event: 'auth.oauth.callback',
      level: success ? 'info' : 'error',
      timestamp: new Date().toISOString(),
      context: { ...context, provider },
      message: success 
        ? `OAuth callback successful from ${provider}` 
        : `OAuth callback failed from ${provider}`,
      error,
    });
  }

  logEmailVerification(context: LogContext, success: boolean, error?: any): void {
    this.log({
      event: 'auth.email.verification',
      level: success ? 'info' : 'error',
      timestamp: new Date().toISOString(),
      context,
      message: success 
        ? 'Email verification successful' 
        : 'Email verification failed',
      error,
    });
  }

  // Profile Events
  logProfileUpdate(context: LogContext, fields: string[], success: boolean, error?: any): void {
    this.log({
      event: 'profile.update',
      level: success ? 'info' : 'error',
      timestamp: new Date().toISOString(),
      context: { ...context, fields },
      message: success 
        ? 'Profile update successful' 
        : 'Profile update failed',
      error,
    });
  }

  logProfileView(context: LogContext): void {
    this.log({
      event: 'profile.view',
      level: 'debug',
      timestamp: new Date().toISOString(),
      context,
      message: 'Profile viewed',
    });
  }

  // CF Verification Events
  logCFVerificationStart(context: LogContext, handle: string): void {
    this.log({
      event: 'cf.verification.start',
      level: 'info',
      timestamp: new Date().toISOString(),
      context: { ...context, handle },
      message: 'CF verification started',
    });
  }

  logCFVerificationCheck(context: LogContext, handle: string, success: boolean, error?: any): void {
    this.log({
      event: 'cf.verification.check',
      level: success ? 'info' : 'warn',
      timestamp: new Date().toISOString(),
      context: { ...context, handle },
      message: success 
        ? 'CF verification successful' 
        : 'CF verification check failed',
      error,
    });
  }

  logCFVerificationComplete(context: LogContext, handle: string): void {
    this.log({
      event: 'cf.verification.complete',
      level: 'info',
      timestamp: new Date().toISOString(),
      context: { ...context, handle },
      message: 'CF verification completed',
    });
  }

  logCFHandleUnlink(context: LogContext, handle: string): void {
    this.log({
      event: 'cf.handle.unlink',
      level: 'info',
      timestamp: new Date().toISOString(),
      context: { ...context, handle },
      message: 'CF handle unlinked',
    });
  }

  // Security Events
  logRateLimitExceeded(context: LogContext, endpoint: string): void {
    this.log({
      event: 'security.rate_limit.exceeded',
      level: 'warn',
      timestamp: new Date().toISOString(),
      context: { ...context, endpoint },
      message: 'Rate limit exceeded',
    });
  }

  logUnauthorizedAccess(context: LogContext, resource: string): void {
    this.log({
      event: 'security.unauthorized',
      level: 'warn',
      timestamp: new Date().toISOString(),
      context: { ...context, resource },
      message: 'Unauthorized access attempt',
    });
  }

  logValidationError(context: LogContext, field: string, error: string): void {
    this.log({
      event: 'validation.error',
      level: 'warn',
      timestamp: new Date().toISOString(),
      context: { ...context, field, validationError: error },
      message: 'Validation error',
    });
  }

  // Generic Events
  logError(event: string, context: LogContext, error: any): void {
    this.log({
      event,
      level: 'error',
      timestamp: new Date().toISOString(),
      context,
      error,
    });
  }

  logInfo(event: string, context: LogContext, message: string): void {
    this.log({
      event,
      level: 'info',
      timestamp: new Date().toISOString(),
      context,
      message,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper to extract context from Next.js request
export function getRequestContext(request: Request): LogContext {
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return {
    ip,
    userAgent,
  };
}
