import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

// GET /api/supabase/extra-elements - جلب العناصر الإضافية
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('activeOnly') !== 'false' //默认为true

    const supabase = createSupabaseAdmin()
    let query = supabase.from('extra_elements').select('*').order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (activeOnly) {
      query = query.eq('active', true)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('[API/supabase/extra-elements] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب العناصر الإضافية' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/extra-elements - إنشاء عنصر إضافي جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, name, description, category, data, active } = body

    if (!type || !name) {
      return NextResponse.json(
        { success: false, error: 'النوع والاسم مطلوبان' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const { data: element, error } = await supabase
      .from('extra_elements')
      .insert({
        type,
        name,
        description,
        category,
        data: data || {},
        active: active !== false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: element }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/extra-elements] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء العنصر الإضافي' },
      { status: 500 }
    )
  }
}

// PATCH /api/supabase/extra-elements - تحديث عنصر إضافي
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
      .from('extra_elements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: element })
  } catch (error) {
    console.error('[API/supabase/extra-elements] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل تحديث العنصر الإضافي' },
      { status: 500 }
    )
  }
}

// DELETE /api/supabase/extra-elements - حذف عنصر إضافي
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
      .from('extra_elements')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API/supabase/extra-elements] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل حذف العنصر الإضافي' },
      { status: 500 }
    )
  }
}
