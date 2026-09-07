import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client with service role privileges.
 * Only use this on the server side for trusted operations.
 * 
 * IMPORTANT: Never expose this client to the browser.
 * The service role key has full database access and bypasses RLS.
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ''
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  ''
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''

export function isServerSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && (serviceRoleKey || anonKey))
}

let cachedServerClient: SupabaseClient | null = null

export function createSupabaseAdmin(): SupabaseClient | null {
  if (cachedServerClient) return cachedServerClient
  if (!supabaseUrl || !(serviceRoleKey || anonKey)) {
    return null
  }
  const key = serviceRoleKey || anonKey
  cachedServerClient = createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return cachedServerClient
}
