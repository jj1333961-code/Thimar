import { NextRequest, NextResponse } from 'next/server'
import { proctoringDb } from '@/lib/supabase/database'

// GET /api/supabase/proctoring - جلب حوادث المراقبة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'معرف الطالب مطلوب' },
        { status: 400 }
      )
    }

    const incidents = await proctoringDb.getByStudent(studentId)
    return NextResponse.json({ success: true, data: incidents })
  } catch (error) {
    console.error('[API/supabase/proctoring] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب حوادث المراقبة' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/proctoring - تسجيل حادث جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, student_id, exam_attempt_id, event_type, severity, risk_score, description, metadata } = body

    if (!event_type) {
      return NextResponse.json(
        { success: false, error: 'نوع الحدث مطلوب' },
        { status: 400 }
      )
    }

    const incident = await proctoringDb.create({
      session_id,
      student_id,
      exam_attempt_id,
      event_type,
      severity: severity || 'low',
      risk_score,
      description,
      metadata,
    })

    return NextResponse.json({ success: true, data: incident }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/proctoring] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل تسجيل الحادث' },
      { status: 500 }
    )
  }
}
