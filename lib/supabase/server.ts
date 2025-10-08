import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = (await cookies()) as any;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase environment variables not found for server-side client.'
    );
    throw new Error(
      'Supabase configuration missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.'
    );
  }

  const cookieGet = (name: string) => {
    return cookieStore.get(name)?.value as string | undefined;
  };

  const cookieSet = (name: string, value: string, options: CookieOptions) => {
    cookieStore.set({ name, value, ...options });
  };

  const cookieRemove = (name: string, options: CookieOptions) => {
    if (typeof cookieStore.delete === 'function') {
      cookieStore.delete({ name, ...options });
    } else {
      cookieStore.set({ name, value: '', ...options });
    }
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { get: cookieGet, set: cookieSet, remove: cookieRemove } as any,
  });
}

export const getSupabaseServer = createClient;