import { z } from 'zod';

/**
 * Validation schemas for authentication and profile management
 * Uses Zod for type-safe server-side validation
 */

// ============================================================================
// Profile Validation Schemas
// ============================================================================

export const profileStatusSchema = z.enum(['student', 'working'], {
  errorMap: () => ({ message: 'Status must be either "student" or "working"' }),
});

export const degreeTypeSchema = z.enum(
  ['btech', 'mtech', 'bsc', 'msc', 'bca', 'mca', 'mba', 'phd', 'other'],
  {
    errorMap: () => ({ message: 'Invalid degree type' }),
  }
);

export const yearSchema = z
  .string()
  .regex(/^[1-5]$/, 'Year must be between 1 and 5');

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
      // If status is student, require degree_type, college_id, and year
      if (data.status === 'student') {
        return (
          data.degree_type !== null &&
          data.degree_type !== undefined &&
          data.college_id !== null &&
          data.college_id !== undefined &&
          data.year !== null &&
          data.year !== undefined
        );
      }
      return true;
    },
    {
      message:
        'Student profiles require degree_type, college_id, and year fields',
      path: ['status'],
    }
  )
  .refine(
    (data) => {
      // If status is working, require company_id
      if (data.status === 'working') {
        return data.company_id !== null && data.company_id !== undefined;
      }
      return true;
    },
    {
      message: 'Working professional profiles require company_id field',
      path: ['status'],
    }
  );

// ============================================================================
// Codeforces Handle Validation Schemas
// ============================================================================

export const codeforcesHandleSchema = z
  .string()
  .min(3, 'Codeforces handle must be at least 3 characters')
  .max(24, 'Codeforces handle must be at most 24 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Codeforces handle can only contain letters, numbers, underscores, and hyphens'
  );

export const cfVerificationStartSchema = z.object({
  handle: codeforcesHandleSchema,
});

export const cfVerificationCheckSchema = z.object({
  handle: codeforcesHandleSchema,
  verificationId: z
    .string()
    .min(1, 'Verification ID is required')
    .max(100, 'Invalid verification ID'),
});

// ============================================================================
// College/Company Validation Schemas
// ============================================================================

export const collegeCreateSchema = z.object({
  name: z
    .string()
    .min(3, 'College name must be at least 3 characters')
    .max(255, 'College name must be at most 255 characters')
    .trim(),
  country: z.string().max(100).default('India'),
});

export const companyCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name must be at most 255 characters')
    .trim(),
});

// ============================================================================
// Auth Validation Schemas
// ============================================================================

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters'); // Common password length limit for security

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// ============================================================================
// Query Parameter Validation
// ============================================================================

export const searchQuerySchema = z
  .string()
  .max(100, 'Search query too long')
  .optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================================
// Helper function for safe validation
// ============================================================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
      };
    }
    return { success: false, error: 'Invalid data format' };
  }
}
