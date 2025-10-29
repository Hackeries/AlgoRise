import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase env missing; returning disabled browser client (features requiring Supabase will be unavailable).'
    );
    const disabledClient: any = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({
          data: null,
          error: new Error('Supabase disabled'),
        }),
        signUp: async () => ({
          data: null,
          error: new Error('Supabase disabled'),
        }),
        signOut: async () => ({ error: new Error('Supabase disabled') }),
        onAuthStateChange: () => ({
          data: {
            subscription: {
              unsubscribe: () => {
                /* no-op */
              },
            },
          },
          error: new Error('Supabase disabled'),
        }),
      },
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
          ilike: () => builder,
          like: () => builder,
          not: () => builder,
          order: () => builder,
          range: () => builder,
          limit: () => builder,
          single: async () => ({
            data: null,
            error: new Error('Supabase disabled'),
          }),
          maybeSingle: async () => ({
            data: null,
            error: new Error('Supabase disabled'),
          }),
          then: (resolve: (v: any) => void) =>
            resolve({ data: null, error: new Error('Supabase disabled') }),
        };
        return builder;
      },
      rpc: async () => ({ data: null, error: new Error('Supabase disabled') }),
    };
    return disabledClient;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
