import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createDisabledClient } from './disabled-client'

// server client for use in server components and api routes
// important: dont put this in a global variable - create new client per request

export async function createClient() {
  const cookieStore = (await cookies()) as any

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env missing - returning disabled client')
    return createDisabledClient()
  }

  const cookieGet = (name: string) => {
    return cookieStore.get(name)?.value as string | undefined
  }

  const cookieSet = (name: string, value: string, options: CookieOptions) => {
    cookieStore.set({ name, value, ...options })
  }

  const cookieRemove = (name: string, options: CookieOptions) => {
    if (typeof cookieStore.delete === 'function') {
      cookieStore.delete({ name, ...options })
    } else {
      cookieStore.set({ name, value: '', ...options })
    }
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { get: cookieGet, set: cookieSet, remove: cookieRemove } as any,
  })
}

export async function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase service role key missing')
    return null
  }

  // service role client doesnt use cookies - for server to server operations
  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    } as any,
  })
}

export const getSupabaseServer = createClient
