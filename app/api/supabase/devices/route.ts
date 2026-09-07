import { NextRequest, NextResponse } from 'next/server'
import { devicesDb } from '@/lib/supabase/database'

// GET /api/supabase/devices - جلب جميع الأجهزة
export async function GET(request: NextRequest) {
  try {
    const devices = await devicesDb.getAll()
    return NextResponse.json({ success: true, data: devices })
  } catch (error) {
    console.error('[API/supabase/devices] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب قائمة الأجهزة' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/devices - تسجيل جهاز جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { device_id, user_id, user_name, role, user_agent } = body

    if (!device_id) {
      return NextResponse.json(
        { success: false, error: 'معرف الجهاز مطلوب' },
        { status: 400 }
      )
    }

    const device = await devicesDb.registerDevice({
      device_id,
      user_id,
      user_name,
      role,
      user_agent,
    })

    return NextResponse.json({ success: true, data: device }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/devices] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل تسجيل الجهاز' },
      { status: 500 }
    )
  }
}

// PATCH /api/supabase/devices - تحديث بيانات الجهاز
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { device_id, current_page, locked_page, user_id, user_name } = body

    if (!device_id) {
      return NextResponse.json(
        { success: false, error: 'معرف الجهاز مطلوب' },
        { status: 400 }
      )
    }

    const device = await devicesDb.updateDevice(device_id, {
      current_page,
      locked_page,
      user_id,
      user_name,
    })

    return NextResponse.json({ success: true, data: device })
  } catch (error) {
    console.error('[API/supabase/devices] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل تحديث بيانات الجهاز' },
      { status: 500 }
    )
  }
}
