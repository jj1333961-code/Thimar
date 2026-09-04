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

async function ensureProfile(supabase: ReturnType<typeof createSupabaseServerClient>, user: { id: string }) {
  const { error } = await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' })
  if (error) {
    console.error('[v0] Supabase profile upsert failed:', error)
    return { profileReady: false, profileError: publicError(error) }
  }
  return { profileReady: true, profileError: null }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return json({ error: 'إعدادات Supabase غير مكتملة' }, 503)
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
    if (action === 'signup' && !result.data.session) return applyCookies(json({ ok: true, pendingEmailConfirmation: true, email, profileReady: false }))
    const profile = result.data.user ? await ensureProfile(supabase, result.data.user) : { profileReady: false, profileError: null }
    return applyCookies(json({ ok: true, authenticated: true, ...profile, user: result.data.user ? { id: result.data.user.id, email: result.data.user.email } : null }))
  } catch (error) {
    return json({ error: publicError(error) }, 503)
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return json({ authenticated: false, error: 'إعدادات Supabase غير مكتملة' }, 503)
    const { supabase, applyCookies } = authClient(request)
    const { data, error } = await supabase.auth.getUser()
    if (error) return json({ authenticated: false, error: publicError(error) }, 401)
    return applyCookies(json({ authenticated: true, user: { id: data.user.id, email: data.user.email } }))
  } catch (error) {
    return json({ authenticated: false, error: publicError(error) }, 401)
  }
}

export async function DELETE(request: NextRequest) {
  const { supabase, applyCookies } = authClient(request)
  await supabase.auth.signOut().catch((error) => console.error('[v0] Supabase signout error:', error))
  return applyCookies(json({ signedOut: true }))
}
