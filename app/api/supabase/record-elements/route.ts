import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

// GET /api/supabase/record-elements - جلب عناصر التسجيل
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const type = searchParams.get('type')

    const supabase = createSupabaseAdmin()
    let query = supabase.from('record_elements').select('*').order('created_at', { ascending: false })

    if (studentId) {
      query = query.eq('student_id', studentId)
    }
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('[API/supabase/record-elements] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب عناصر التسجيل' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/record-elements - إنشاء عنصر تسجيل جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_id, type, title, description, data, created_by } = body

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'نوع العنصر مطلوب' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const { data: element, error } = await supabase
      .from('record_elements')
      .insert({
        student_id,
        type,
        title,
        description,
        data: data || {},
        created_by,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: element }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/record-elements] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء عنصر التسجيل' },
      { status: 500 }
    )
  }
}

// PATCH /api/supabase/record-elements - تحديث عنصر تسجيل
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف العنصر مطلوب' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const { data: element, error } = await supabase
      .from('record_elements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: element })
  } catch (error) {
    console.error('[API/supabase/record-elements] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل تحديث عنصر التسجيل' },
      { status: 500 }
    )
  }
}

// DELETE /api/supabase/record-elements - حذف عنصر تسجيل
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف العنصر مطلوب' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const { error } = await supabase
      .from('record_elements')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API/supabase/record-elements] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل حذف عنصر التسجيل' },
      { status: 500 }
    )
  }
}
