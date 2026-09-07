import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client with service role privileges.
 * Only use this on the server side for trusted operations.
 * 
 * IMPORTANT: Never expose this client to the browser.
 * The service role key has full database access and bypasses RLS.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function requireServerConfig() {
  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not configured. Please set it in your .env.local file.'
    )
  }
  if (!serviceRoleKey) {
    console.warn(
      '[Supabase Server] SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
      'Falling back to anon key. Some operations may fail due to RLS policies.'
    )
  }
  return { url: supabaseUrl, key: serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' }
}

let cachedServerClient: SupabaseClient | null = null

export function createSupabaseAdmin(): SupabaseClient {
  if (cachedServerClient) return cachedServerClient
  const config = requireServerConfig()
  cachedServerClient = createClient(config.url, config.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return cachedServerClient
}

export function isServerSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey)
}
