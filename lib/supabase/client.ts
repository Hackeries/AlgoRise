import { createBrowserClient } from '@supabase/ssr'
import { createDisabledClient } from './disabled-client'

// browser client for use in client components

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env missing - returning disabled client')
    return createDisabledClient()
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
