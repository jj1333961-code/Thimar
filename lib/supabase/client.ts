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
  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not configured. Please set it in your .env.local file.'
    )
  }
  if (!supabasePublishableKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Please set it in your .env.local file.'
    )
  }
  return { url: supabaseUrl, key: supabasePublishableKey }
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
  return createClient(config.url, config.key, {
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
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: cookies.getAll,
      setAll: cookies.setAll,
    },
  })
}
