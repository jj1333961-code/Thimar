import { type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}

function authClient(request: NextRequest) {
  const pending: Array<{ name: string; value: string; options: CookieOptions }> = []
  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookies) => { pending.push(...cookies) },
  })
  return { supabase, applyCookies: (response: NextResponse) => { pending.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); return response } }
}

function publicError(error: unknown) {
  const value = error instanceof Error ? error.message : String(error)
  console.error('[v0] Supabase auth error:', error)
  return value || 'تعذر إكمال عملية المصادقة'
}

async function loadProfile(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { data, error } = await supabase.from('profiles').select('id, role, display_name').eq('id', userId).maybeSingle()
  if (error) {
    console.error('[v0] Supabase profile load failed:', error)
    return { profileReady: false, profileError: publicError(error), profile: null }
  }
  if (!data) {
    console.error('[v0] Supabase profile missing for auth user:', userId)
    return { profileReady: false, profileError: 'لم يتم العثور على profile لهذا الحساب. طبّق migration الخاصة بـ Supabase.', profile: null }
  }
  return { profileReady: true, profileError: null, profile: data }
}

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key)
}

export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return json({ ok: true, unconfigured: true, message: 'سيتم حفظ الحساب في قاعدة بيانات المنصة' })
    }
    const body = await request.json().catch(() => ({}))
    const action = body?.action === 'signup' ? 'signup' : 'login'
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'أدخل بريدًا إلكترونيًا صالحًا' }, 400)
    if (password.length < 8) return json({ error: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' }, 400)
    const { supabase, applyCookies } = authClient(request)
    const result = action === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: String(body?.name || '').trim().slice(0, 120) } } })
      : await supabase.auth.signInWithPassword({ email, password })
    if (result.error) return json({ error: publicError(result.error), code: result.error.code || null }, result.error.status || 400)
    if (action === 'signup' && !result.data.session) return applyCookies(json({ ok: true, pendingEmailConfirmation: true, email, profileReady: 'trigger-required' }))
    const profile = result.data.user ? await loadProfile(supabase, result.data.user.id) : { profileReady: false, profileError: null, profile: null }
    return applyCookies(json({ ok: true, authenticated: true, ...profile, role: profile.profile?.role || null, user: result.data.user ? { id: result.data.user.id, email: result.data.user.email } : null }))
  } catch (error) {
    return json({ error: publicError(error) }, 503)
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) return json({ authenticated: false, configured: false }, 200)
    const { supabase, applyCookies } = authClient(request)
    const { data, error } = await supabase.auth.getUser()
    if (error) return json({ authenticated: false, error: publicError(error) }, 401)
    const profile = await loadProfile(supabase, data.user.id)
    return applyCookies(json({ authenticated: true, ...profile, role: profile.profile?.role || null, user: { id: data.user.id, email: data.user.email } }))
  } catch (error) {
    return json({ authenticated: false, error: publicError(error) }, 401)
  }
}

export async function DELETE(request: NextRequest) {
  const { supabase, applyCookies } = authClient(request)
  await supabase.auth.signOut().catch((error: any) => console.error('[v0] Supabase signout error:', error))
  return applyCookies(json({ signedOut: true }))
}
