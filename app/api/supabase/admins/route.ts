import { NextRequest, NextResponse } from 'next/server'
import { adminsDb } from '@/lib/supabase/database'

// GET /api/supabase/admins - جلب جميع المسؤولين
export async function GET(request: NextRequest) {
  try {
    const admins = await adminsDb.getAll()
    return NextResponse.json({ success: true, data: admins })
  } catch (error) {
    console.error('[API/supabase/admins] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب قائمة المسؤولين' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/admins - إنشاء مسؤول جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, mobile, password, google_email, google_id, role, whatsapp } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existing = await adminsDb.getByEmail(email)
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً' },
        { status: 409 }
      )
    }

    const admin = await adminsDb.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile,
      password, // Note: In production, hash this password
      google_email,
      google_id,
      role: role || 'admin',
      whatsapp,
    })

    return NextResponse.json({ success: true, data: admin }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/admins] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء حساب المسؤول' },
      { status: 500 }
    )
  }
}
