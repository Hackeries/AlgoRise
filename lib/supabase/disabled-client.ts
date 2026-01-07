// fallback client when supabase is not configured
// prevents crashes when env variables are missing

const DISABLED_ERROR = new Error('Supabase not configured')

function createQueryBuilder(): any {
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    upsert: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    is: () => builder,
    in: () => builder,
    ilike: () => builder,
    like: () => builder,
    not: () => builder,
    or: () => builder,
    and: () => builder,
    order: () => builder,
    range: () => builder,
    limit: () => builder,
    single: async () => ({ data: null, error: DISABLED_ERROR }),
    maybeSingle: async () => ({ data: null, error: DISABLED_ERROR }),
    then: (resolve: (v: any) => void) => resolve({ data: null, error: DISABLED_ERROR }),
  }
  return builder
}

export function createDisabledClient(): any {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: DISABLED_ERROR }),
      signUp: async () => ({ data: null, error: DISABLED_ERROR }),
      signOut: async () => ({ error: DISABLED_ERROR }),
      signInWithOAuth: async () => ({ data: null, error: DISABLED_ERROR }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
        error: DISABLED_ERROR,
      }),
    },
    from: () => createQueryBuilder(),
    rpc: async () => ({ data: null, error: DISABLED_ERROR }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {},
      unsubscribe: () => {},
    }),
    removeChannel: () => {},
  }
}
