import { NextRequest, NextResponse } from 'next/server'
import { examsDb, examAttemptsDb, DatabaseError, checkDatabaseConnection } from '@/lib/supabase/database'
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

function errorResponse(error: unknown) {
  if (error instanceof DatabaseError) {
    return json({ error: error.message }, 503)
  }
  console.error('[v0] Supabase exams API error:', error)
  return json({ error: 'تعذر الاتصال بقاعدة البيانات' }, 503)
}

export async function GET(request: NextRequest) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response
  
  try {
    const connection = await checkDatabaseConnection()
    if (!connection.connected) {
      return json({ error: 'تعذر الاتصال بقاعدة البيانات', details: connection.error }, 503)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const published = searchParams.get('published')
    const studentId = searchParams.get('student_id')

    if (id) {
      const exam = await examsDb.getById(id)
      if (!exam) return json({ error: 'الاختبار غير موجود' }, 404)
      return json({ exam })
    }

    if (published === 'true') {
      const exams = await examsDb.getPublished()
      return json({ exams })
    }

    if (studentId) {
      const attempts = await examAttemptsDb.getByStudent(studentId)
      return json({ attempts })
    }

    const exams = await examsDb.getAll()
    return json({ exams })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    
    // Check if this is an exam attempt or a new exam
    if (body.exam_id && body.student_id) {
      const attempt = await examAttemptsDb.create({
        exam_id: body.exam_id,
        student_id: body.student_id,
        current_question: body.current_question || 0,
        answers: body.answers || {},
        completed: false,
      })
      return json({ attempt, saved: true })
    }
    
    if (!body || typeof body !== 'object') {
      return json({ error: 'بيانات غير صالحة' }, 400)
    }

    const exam = await examsDb.create(body)
    return json({ exam, saved: true })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { id, attempt_id, ...updates } = body
    
    // Handle exam attempt updates
    if (attempt_id) {
      const attempt = await examAttemptsDb.update(attempt_id, updates)
      return json({ attempt, saved: true })
    }
    
    if (!id) {
      return json({ error: 'معرف الاختبار مطلوب' }, 400)
    }

    const exam = await examsDb.update(id, updates)
    return json({ exam, saved: true })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return json({ error: 'معرف الاختبار مطلوب' }, 400)
    }

    await examsDb.delete(id)
    return json({ deleted: true })
  } catch (error) {
    return errorResponse(error)
  }
}
