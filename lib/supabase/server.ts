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
    // Graceful, no-throw fallback: return a disabled client that reports no user
    console.warn(
      'Supabase env missing; returning disabled server client (features requiring Supabase will be unavailable).'
    );
    const disabledClient: any = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: new Error('Supabase disabled') }),
      },
      // Common query helpers return chainable stubs; terminal calls return disabled error
      from: () => {
        const builder: any = {
          select: () => builder,
          insert: () => builder,
          update: () => builder,
          delete: () => builder,
          eq: () => builder,
          neq: () => builder,
          gte: () => builder,
          lte: () => builder,
          is: () => builder,
          order: () => builder,
          range: () => builder,
          single: async () => ({
            data: null,
            error: new Error('Supabase disabled'),
          }),
          maybeSingle: async () => ({
            data: null,
            error: new Error('Supabase disabled'),
          }),
        };
        return builder;
      },
      rpc: async () => ({ data: null, error: new Error('Supabase disabled') }),
    };
    return disabledClient;
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
