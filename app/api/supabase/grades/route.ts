import { NextRequest, NextResponse } from 'next/server'
import { gradesDb, DatabaseError, checkDatabaseConnection } from '@/lib/supabase/database'
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
  console.error('[v0] Supabase grades API error:', error)
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
    const studentId = searchParams.get('student_id')
    const subjectId = searchParams.get('subject_id')

    if (studentId) {
      const grades = await gradesDb.getByStudent(studentId)
      return json({ grades })
    }

    if (subjectId) {
      const grades = await gradesDb.getBySubject(subjectId)
      return json({ grades })
    }

    return json({ error: 'معرف الطالب أو المادة مطلوب' }, 400)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  
  const adminAuth = await requireAdmin(request)
  if (adminAuth.response) return adminAuth.response

  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || !body.student_id) {
      return json({ error: 'معرف الطالب مطلوب' }, 400)
    }

    const grade = await gradesDb.create(body)
    return json({ grade, saved: true })
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
    const { id, ...updates } = body
    
    if (!id) {
      return json({ error: 'معرف الدرجة مطلوب' }, 400)
    }

    const grade = await gradesDb.update(id, updates)
    return json({ grade, saved: true })
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
      return json({ error: 'معرف الدرجة مطلوب' }, 400)
    }

    await gradesDb.delete(id)
    return json({ deleted: true })
  } catch (error) {
    return errorResponse(error)
  }
}
