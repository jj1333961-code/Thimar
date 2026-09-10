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

export function isLikelyJwt(key: string): boolean {
  if (!key || typeof key !== 'string') return false
  const trimmed = key.trim()
  const parts = trimmed.split('.')
  return parts.length === 3 && parts[0].length >= 10 && parts[1].length >= 10
}

export function getSupabaseDiagnostics() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const rawService = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim()
  const rawAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim()

  const isUrlValid = Boolean(url && url.startsWith('http'))
  const isServiceValid = isLikelyJwt(rawService)
  const isAnonValid = isLikelyJwt(rawAnon)

  const issues: string[] = []
  if (!url) {
    issues.push('لم يتم ضبط NEXT_PUBLIC_SUPABASE_URL في إعدادات البيئة.')
  }
  if (!rawService && !rawAnon) {
    issues.push('يرجى إضافة مفتاح NEXT_PUBLIC_SUPABASE_ANON_KEY أو SUPABASE_SERVICE_ROLE_KEY.')
  }
  if (rawService && !isServiceValid) {
    if (rawService.startsWith('sk-or-')) {
      issues.push('مفتاح SUPABASE_SERVICE_ROLE_KEY يبدو كمفتاح OpenRouter (sk-or-...) بدلاً من مفتاح Supabase JWT.')
    } else {
      issues.push('مفتاح SUPABASE_SERVICE_ROLE_KEY يجب أن يكون JWT ويبدأ بـ eyJhbGciOi...')
    }
  }
  if (rawAnon && !isAnonValid) {
    if (rawAnon.startsWith('http')) {
      issues.push('مفتاح NEXT_PUBLIC_SUPABASE_ANON_KEY يحتوي على رابط (URL) بدلاً من مفتاح anon JWT الفعلي.')
    } else {
      issues.push('مفتاح NEXT_PUBLIC_SUPABASE_ANON_KEY يجب أن يكون JWT ويبدأ بـ eyJhbGciOi...')
    }
  }

  return {
    url,
    isUrlValid,
    hasServiceKey: Boolean(rawService),
    isServiceKeyValid: isServiceValid,
    hasAnonKey: Boolean(rawAnon),
    isAnonKeyValid: isAnonValid,
    isReady: Boolean(isUrlValid && (isServiceValid || isAnonValid)),
    issues,
  }
}

export function isServerSupabaseConfigured(): boolean {
  const diag = getSupabaseDiagnostics()
  return diag.isReady
}

let cachedServerClient: SupabaseClient | null = null

export function createSupabaseAdmin(): SupabaseClient | null {
  if (cachedServerClient) return cachedServerClient
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const rawService = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim()
  const rawAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim()

  if (!url) return null

  // Use valid JWT if available, or best available key
  let chosenKey = ''
  if (isLikelyJwt(rawService)) {
    chosenKey = rawService
  } else if (isLikelyJwt(rawAnon)) {
    chosenKey = rawAnon
  } else if (rawService && !rawService.startsWith('sk-or-')) {
    chosenKey = rawService
  } else if (rawAnon && !rawAnon.startsWith('http')) {
    chosenKey = rawAnon
  }

  if (!chosenKey) {
    return null
  }

  cachedServerClient = createClient(url, chosenKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return cachedServerClient
}
