import { NextRequest, NextResponse } from 'next/server'
import { subjectsDb } from '@/lib/supabase/database'

// GET /api/supabase/subjects - جلب جميع المواد
export async function GET(request: NextRequest) {
  try {
    const subjects = await subjectsDb.getAll()
    return NextResponse.json({ success: true, data: subjects })
  } catch (error) {
    console.error('[API/supabase/subjects] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب قائمة المواد' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/subjects - إنشاء مادة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'اسم المادة مطلوب' },
        { status: 400 }
      )
    }

    const subject = await subjectsDb.create({
      name: name.trim(),
      description: description?.trim() || undefined,
    })

    return NextResponse.json({ success: true, data: subject }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/subjects] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء المادة' },
      { status: 500 }
    )
  }
}
