// Centralized error handling
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public context?: Record<string, any>,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  UNAUTHORIZED: "UNAUTHORIZED",

  // Validation errors
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_EMAIL: "INVALID_EMAIL",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  TIMEOUT: "TIMEOUT",

  // External API errors
  CODEFORCES_API_ERROR: "CODEFORCES_API_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(ERROR_CODES.INTERNAL_ERROR, 500, error.message, {
      originalError: error.message,
      stack: error.stack,
    })
  }

  return new AppError(ERROR_CODES.INTERNAL_ERROR, 500, "An unexpected error occurred", {
    error: String(error),
  })
}

export function createErrorResponse(error: AppError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { context: error.context }),
    },
  }
}
