import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export type SupabaseCookieAdapter = {
  getAll: () => { name: string; value: string }[]
  setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => void
}

// Support both naming conventions for backward compatibility
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function requireSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    console.warn('Supabase not configured. Using mock client.')
    const noOp = () => Promise.resolve({ data: null, error: null })
    const mockClient = new Proxy({}, {
      get: (_, prop) => {
        if (prop === 'auth') return {
          getSession: noOp,
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          getUser: noOp,
          signInWithPassword: noOp,
          signOut: noOp,
        }
        if (prop === 'from') return () => ({
          select: () => ({
            eq: () => ({
              single: noOp,
              maybeSingle: noOp,
              order: () => ({ limit: noOp }),
              limit: noOp,
            }),
            order: () => ({ limit: noOp }),
          }),
          insert: noOp,
          update: noOp,
          delete: noOp,
          upsert: noOp,
        })
        return noOp
      }
    })
    return { url: 'http://localhost', key: 'mock', mock: true, mockClient }
  }
  return { url: supabaseUrl, key: supabasePublishableKey, mock: false }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey)
}

export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    key: supabasePublishableKey,
    configured: isSupabaseConfigured(),
  }
}

export function createSupabaseClient(options?: Parameters<typeof createClient>[2]) {
  const config = requireSupabaseConfig()
  if (config.mock) return config.mockClient as any
  return createClient(config.url, config.key!, {
    ...options,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      ...options?.auth,
    },
  })
}

export function createSupabaseServerClient(cookies: SupabaseCookieAdapter) {
  const config = requireSupabaseConfig()
  if (config.mock) return config.mockClient as any
  return createServerClient(config.url, config.key!, {
    cookies: {
      getAll: cookies.getAll,
      setAll: cookies.setAll,
    },
  })
}
