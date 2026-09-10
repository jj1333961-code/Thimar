import { NextRequest, NextResponse } from 'next/server'
import { attendanceDb, DatabaseError, checkDatabaseConnection } from '@/lib/supabase/database'
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
  console.error('[v0] Supabase attendance API error:', error)
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
    const date = searchParams.get('date')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    if (studentId) {
      const attendance = await attendanceDb.getByStudent(studentId, fromDate || undefined, toDate || undefined)
      return json({ attendance })
    }

    if (date) {
      const attendance = await attendanceDb.getByDate(date)
      return json({ attendance })
    }

    return json({ error: 'معرف الطالب أو التاريخ مطلوب' }, 400)
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
    if (!body || typeof body !== 'object' || !body.student_id || !body.date) {
      return json({ error: 'معرف الطالب والتاريخ مطلوبان' }, 400)
    }

    const attendance = await attendanceDb.markAttendance({
      student_id: body.student_id,
      date: body.date,
      time_in: body.time_in,
      time_out: body.time_out,
      status: body.status || 'present',
      notes: body.notes,
      recorded_by: auth.user?.id,
    })
    return json({ attendance, saved: true })
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
      return json({ error: 'معرف سجل الحضور مطلوب' }, 400)
    }

    await attendanceDb.delete(id)
    return json({ deleted: true })
  } catch (error) {
    return errorResponse(error)
  }
}
