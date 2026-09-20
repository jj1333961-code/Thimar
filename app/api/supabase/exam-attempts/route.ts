import { NextRequest, NextResponse } from 'next/server'
import { examAttemptsDb } from '@/lib/supabase/database'

// GET /api/supabase/exam-attempts - جلب المحاولات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const examId = searchParams.get('examId')

    let attempts

    if (studentId) {
      attempts = await examAttemptsDb.getByStudent(studentId)
    } else if (examId) {
      attempts = await examAttemptsDb.getByExam(examId)
    } else {
      return NextResponse.json(
        { success: false, error: 'معرف الطالب أو الاختبار مطلوب' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: attempts })
  } catch (error) {
    console.error('[API/supabase/exam-attempts] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب محاولات الاختبار' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/exam-attempts - إنشاء محاولة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { exam_id, student_id } = body

    if (!exam_id || !student_id) {
      return NextResponse.json(
        { success: false, error: 'معرف الاختبار والطالب مطلوبان' },
        { status: 400 }
      )
    }

    const attempt = await examAttemptsDb.create({
      exam_id,
      student_id,
    })

    return NextResponse.json({ success: true, data: attempt }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/exam-attempts] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء المحاولة' },
      { status: 500 }
    )
  }
}

// PATCH /api/supabase/exam-attempts - تحديث المحاولة
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, current_question, answers, score, time_spent_seconds, submit, total_score } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المحاولة مطلوب' },
        { status: 400 }
      )
    }

    let result

    if (submit) {
      result = await examAttemptsDb.submit(id, score || 0, time_spent_seconds || 0)
    } else {
      result = await examAttemptsDb.update(id, {
        current_question,
        answers,
        score,
        time_spent_seconds,
        total_score,
      })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[API/supabase/exam-attempts] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل تحديث المحاولة' },
      { status: 500 }
    )
  }
}
