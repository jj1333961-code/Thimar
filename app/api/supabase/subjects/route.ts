import { NextRequest, NextResponse } from 'next/server'
import { subjectsDb } from '@/lib/supabase/database'
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

// GET /api/supabase/subjects - جلب جميع المواد
export async function GET(request: NextRequest) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response

  try {
    const subjects = await subjectsDb.getAll()
    return json({ subjects })
  } catch (error) {
    console.error('[API/supabase/subjects] GET error:', error)
    return json({ error: 'فشل جلب قائمة المواد' }, 500)
  }
}

// POST /api/supabase/subjects - إنشاء مادة جديدة
export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return json({ error: 'اسم المادة مطلوب' }, 400)
    }

    const subject = await subjectsDb.create({
      name: name.trim(),
      description: description?.trim() || undefined,
    })

    return json({ subject }, 201)
  } catch (error) {
    console.error('[API/supabase/subjects] POST error:', error)
    return json({ error: 'فشل إنشاء المادة' }, 500)
  }
}
