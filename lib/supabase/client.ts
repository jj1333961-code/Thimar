import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export type SupabaseCookieAdapter = {
  getAll: () => { name: string; value: string }[]
  setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => void
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
}

if (!supabasePublishableKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured')
}

const configuredSupabaseUrl = supabaseUrl as string
const configuredSupabasePublishableKey = supabasePublishableKey as string

export function createSupabaseClient(options?: Parameters<typeof createClient>[2]) {
  return createClient(configuredSupabaseUrl, configuredSupabasePublishableKey, {
    ...options,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      ...options?.auth,
    },
  })
}

export const supabase = createSupabaseClient()

export function createSupabaseServerClient(cookies: SupabaseCookieAdapter) {
  return createServerClient(configuredSupabaseUrl, configuredSupabasePublishableKey, {
    cookies: {
      getAll: cookies.getAll,
      setAll: cookies.setAll,
    },
  })
}
