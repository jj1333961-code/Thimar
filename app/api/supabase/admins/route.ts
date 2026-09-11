import { NextRequest, NextResponse } from 'next/server'
import { adminsDb } from '@/lib/supabase/database'
import { rejectCrossOrigin } from '@/lib/request-security'
import { requireAdmin } from '@/lib/server-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

// GET /api/supabase/admins - جلب جميع المسؤولين
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const admins = await adminsDb.getAll()
    return json({ admins })
  } catch (error) {
    console.error('[API/supabase/admins] GET error:', error)
    return json({ error: 'فشل جلب قائمة المسؤولين' }, 500)
  }
}

// POST /api/supabase/admins - إنشاء مسؤول جديد
export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { name, email, mobile, password, google_email, google_id, role, whatsapp } = body

    if (!name || !email || !password) {
      return json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' }, 400)
    }

    // Check if admin already exists
    const existing = await adminsDb.getByEmail(email)
    if (existing) {
      return json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, 409)
    }

    const admin = await adminsDb.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile,
      password,
      google_email,
      google_id,
      role: role || 'admin',
      whatsapp,
    })

    return json({ admin }, 201)
  } catch (error) {
    console.error('[API/supabase/admins] POST error:', error)
    return json({ error: 'فشل إنشاء حساب المسؤول' }, 500)
  }
}
