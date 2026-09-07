import { NextRequest, NextResponse } from 'next/server'
import { studentsDb, DatabaseError, checkDatabaseConnection } from '@/lib/supabase/database'
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
  console.error('[v0] Supabase students API error:', error)
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
    const query = searchParams.get('q')

    if (id) {
      const student = await studentsDb.getById(id)
      if (!student) return json({ error: 'الطالب غير موجود' }, 404)
      return json({ student })
    }

    if (query) {
      const students = await studentsDb.search(query)
      return json({ students })
    }

    const students = await studentsDb.getAll()
    return json({ students })
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
    if (!body || typeof body !== 'object') {
      return json({ error: 'بيانات غير صالحة' }, 400)
    }

    const student = await studentsDb.create(body)
    return json({ student, saved: true })
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
      return json({ error: 'معرف الطالب مطلوب' }, 400)
    }

    const student = await studentsDb.update(id, updates)
    return json({ student, saved: true })
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
      return json({ error: 'معرف الطالب مطلوب' }, 400)
    }

    await studentsDb.delete(id)
    return json({ deleted: true })
  } catch (error) {
    return errorResponse(error)
  }
}
