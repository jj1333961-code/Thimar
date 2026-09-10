import { NextRequest, NextResponse } from 'next/server'
import { joinRequestsDb } from '@/lib/supabase/database'
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

// GET /api/supabase/join-requests - جلب طلبات الانضمام
export async function GET(request: NextRequest) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null

    const requests = await joinRequestsDb.getAll(status || undefined)
    return json({ requests })
  } catch (error) {
    console.error('[API/supabase/join-requests] GET error:', error)
    return json({ error: 'فشل جلب طلبات الانضمام' }, 500)
  }
}

// POST /api/supabase/join-requests - إنشاء طلب انضمام جديد
export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  const auth = await requireUser(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { student_name, parent_name, email, phone, grade_level, notes } = body

    if (!student_name) {
      return json({ error: 'اسم الطالب مطلوب' }, 400)
    }

    const request_entry = await joinRequestsDb.create({
      student_name,
      parent_name,
      email,
      phone,
      grade_level,
      notes,
      requested_by: auth.user?.id,
    })

    return json({ request: request_entry }, 201)
  } catch (error) {
    console.error('[API/supabase/join-requests] POST error:', error)
    return json({ error: 'فشل إنشاء طلب الانضمام' }, 500)
  }
}

// PATCH /api/supabase/join-requests - تحديث حالة طلب الانضمام
export async function PATCH(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { id, status, rejection_reason } = body

    if (!id || !status) {
      return json({ error: 'معرف الطلب والحالة مطلوبان' }, 400)
    }

    if (!['approved', 'rejected'].includes(status)) {
      return json({ error: 'الحالة يجب أن تكون approved أو rejected' }, 400)
    }

    const updated = await joinRequestsDb.updateStatus(
      id,
      status as 'approved' | 'rejected',
      auth.user?.id,
      rejection_reason
    )

    return json({ request: updated })
  } catch (error) {
    console.error('[API/supabase/join-requests] PATCH error:', error)
    return json({ error: 'فشل تحديث حالة الطلب' }, 500)
  }
}
