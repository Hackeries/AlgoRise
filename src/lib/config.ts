import { z } from 'zod';

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

type Env = z.infer<typeof EnvSchema>;

/**
 * Validate env lazily on first call.
 * In Next.js, environment variables are provided via Vercel Vars (no .env file).
 */
let cached: Env | null = null;
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    console.error(
      '[config] Missing or invalid env:',
      parsed.error.flatten().fieldErrors
    );
    // In preview, proceed with partial functionality; callers should handle fallbacks
    // Throwing here would break the whole app if env is not yet configured.
  } else {
    cached = parsed.data;
  }
  return cached ?? ({} as Env);
}
