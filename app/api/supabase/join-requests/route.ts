import { NextRequest, NextResponse } from 'next/server'
import { joinRequestsDb } from '@/lib/supabase/database'

// GET /api/supabase/join-requests - جلب طلبات الانضمام
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null

    const requests = await joinRequestsDb.getAll(status || undefined)
    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    console.error('[API/supabase/join-requests] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب طلبات الانضمام' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/join-requests - إنشاء طلب انضمام جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_name, parent_name, email, phone, grade_level, notes } = body

    if (!student_name) {
      return NextResponse.json(
        { success: false, error: 'اسم الطالب مطلوب' },
        { status: 400 }
      )
    }

    const request_entry = await joinRequestsDb.create({
      student_name,
      parent_name,
      email,
      phone,
      grade_level,
      notes,
    })

    return NextResponse.json({ success: true, data: request_entry }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/join-requests] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء طلب الانضمام' },
      { status: 500 }
    )
  }
}

// PATCH /api/supabase/join-requests - تحديث حالة طلب الانضمام
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, reviewed_by, rejection_reason } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'معرف الطلب والحالة مطلوبان' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'الحالة يجب أن تكون approved أو rejected' },
        { status: 400 }
      )
    }

    const updated = await joinRequestsDb.updateStatus(
      id,
      status as 'approved' | 'rejected',
      reviewed_by,
      rejection_reason
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[API/supabase/join-requests] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل تحديث حالة الطلب' },
      { status: 500 }
    )
  }
}
