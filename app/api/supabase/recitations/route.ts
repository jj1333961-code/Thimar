import { NextRequest, NextResponse } from 'next/server'
import { recitationsDb, DatabaseError, checkDatabaseConnection } from '@/lib/supabase/database'
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
  console.error('[v0] Supabase recitations API error:', error)
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

    if (!studentId) {
      return json({ error: 'معرف الطالب مطلوب' }, 400)
    }

    const recitations = await recitationsDb.getByStudent(studentId)
    return json({ recitations })
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
    if (!body || typeof body !== 'object' || !body.student_id) {
      return json({ error: 'معرف الطالب مطلوب' }, 400)
    }

    const recitation = await recitationsDb.create({
      student_id: body.student_id,
      surah_from: body.surah_from,
      surah_to: body.surah_to,
      ayah_from: body.ayah_from,
      ayah_to: body.ayah_to,
      type: body.type,
      grade: body.grade,
      score: body.score,
      evaluator_notes: body.evaluator_notes,
      audio_url: body.audio_url,
      audio_duration_seconds: body.audio_duration_seconds,
      ai_analysis: body.ai_analysis,
      ai_confidence: body.ai_confidence,
      evaluated_by: auth.user?.id,
      evaluated_at: new Date().toISOString(),
    })
    return json({ recitation, saved: true })
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
      return json({ error: 'معرف التسميع مطلوب' }, 400)
    }

    const recitation = await recitationsDb.update(id, updates)
    return json({ recitation, saved: true })
  } catch (error) {
    return errorResponse(error)
  }
}
