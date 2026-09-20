import { NextRequest, NextResponse } from 'next/server'
import { devicesDb } from '@/lib/supabase/database'
import { rejectCrossOrigin } from '@/lib/request-security'
import { requireUser, requireAdmin } from '@/lib/server-auth'

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

// GET /api/supabase/devices - جلب جميع الأجهزة
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const devices = await devicesDb.getAll()
    return json({ devices })
  } catch (error) {
    console.error('[API/supabase/devices] GET error:', error)
    return json({ error: 'فشل جلب قائمة الأجهزة' }, 500)
  }
}

// POST /api/supabase/devices - تسجيل جهاز جديد
export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  const auth = await requireUser(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { device_id, user_name, role, user_agent } = body

    if (!device_id) {
      return json({ error: 'معرف الجهاز مطلوب' }, 400)
    }

    const device = await devicesDb.registerDevice({
      device_id,
      user_id: auth.user?.id,
      user_name,
      role,
      user_agent,
    })

    return json({ device }, 201)
  } catch (error) {
    console.error('[API/supabase/devices] POST error:', error)
    return json({ error: 'فشل تسجيل الجهاز' }, 500)
  }
}

// PATCH /api/supabase/devices - تحديث بيانات الجهاز
export async function PATCH(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  const auth = await requireUser(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { device_id, current_page, locked_page, user_name } = body

    if (!device_id) {
      return json({ error: 'معرف الجهاز مطلوب' }, 400)
    }

    const device = await devicesDb.updateDevice(device_id, {
      current_page,
      locked_page,
      user_id: auth.user?.id,
      user_name,
    })

    return json({ device })
  } catch (error) {
    console.error('[API/supabase/devices] PATCH error:', error)
    return json({ error: 'فشل تحديث بيانات الجهاز' }, 500)
  }
}
