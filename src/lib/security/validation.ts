// Input validation utilities
import { z } from 'zod'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validateHandle = (handle: string): boolean => {
  // Codeforces handle validation
  const handleRegex = /^[a-zA-Z0-9_]{1,24}$/
  return handleRegex.test(handle)
}

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) errors.push("Password must be at least 8 characters")
  if (!/[A-Z]/.test(password)) errors.push("Password must contain uppercase letter")
  if (!/[a-z]/.test(password)) errors.push("Password must contain lowercase letter")
  if (!/[0-9]/.test(password)) errors.push("Password must contain number")

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .slice(0, 1000) // Limit length
}

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}

// ============================================================================
// Zod Validation Schemas for API endpoints
// ============================================================================

export const profileStatusSchema = z.enum(['student', 'working'], {
  errorMap: () => ({ message: 'Status must be either "student" or "working"' }),
})

export const degreeTypeSchema = z.enum(
  ['btech', 'mtech', 'bsc', 'msc', 'bca', 'mca', 'mba', 'phd', 'other'],
  {
    errorMap: () => ({ message: 'Invalid degree type' }),
  }
)

export const yearSchema = z
  .string()
  .regex(/^[1-5]$/, 'Year must be between 1 and 5')

export const profileUpdateSchema = z
  .object({
    status: profileStatusSchema.optional(),
    degree_type: degreeTypeSchema.optional().nullable(),
    college_id: z.string().uuid('Invalid college ID').optional().nullable(),
    year: yearSchema.optional().nullable(),
    company_id: z.string().uuid('Invalid company ID').optional().nullable(),
    custom_company: z.string().max(255).optional().nullable(),
    leetcode_handle: z.string().max(50).optional().nullable(),
    codechef_handle: z.string().max(50).optional().nullable(),
    atcoder_handle: z.string().max(50).optional().nullable(),
    gfg_handle: z.string().max(50).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.status === 'student') {
        return (
          data.degree_type !== null &&
          data.degree_type !== undefined &&
          data.college_id !== null &&
          data.college_id !== undefined &&
          data.year !== null &&
          data.year !== undefined
        )
      }
      return true
    },
    {
      message: 'Student profiles require degree_type, college_id, and year fields',
      path: ['status'],
    }
  )
  .refine(
    (data) => {
      if (data.status === 'working') {
        return data.company_id !== null && data.company_id !== undefined
      }
      return true
    },
    {
      message: 'Working professional profiles require company_id field',
      path: ['status'],
    }
  )

export const codeforcesHandleSchema = z
  .string()
  .min(3, 'Codeforces handle must be at least 3 characters')
  .max(24, 'Codeforces handle must be at most 24 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Codeforces handle can only contain letters, numbers, underscores, and hyphens'
  )

export const cfVerificationStartSchema = z.object({
  handle: codeforcesHandleSchema,
})

export const cfVerificationCheckSchema = z.object({
  handle: codeforcesHandleSchema,
  verificationId: z
    .string()
    .min(1, 'Verification ID is required')
    .max(100, 'Invalid verification ID'),
})

export const collegeCreateSchema = z.object({
  name: z
    .string()
    .min(3, 'College name must be at least 3 characters')
    .max(255, 'College name must be at most 255 characters')
    .trim(),
  country: z.string().max(100).default('India'),
})

export const companyCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name must be at most 255 characters')
    .trim(),
})

export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const searchQuerySchema = z
  .string()
  .max(100, 'Search query too long')
  .optional()

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// Helper function for safe validation
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const parsed = schema.parse(data)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
      }
    }
    return { success: false, error: 'Invalid data format' }
  }
}
