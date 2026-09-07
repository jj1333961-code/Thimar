import { NextRequest, NextResponse } from 'next/server'
import { notificationsDb } from '@/lib/supabase/database'

// GET /api/supabase/notifications - جلب الإشعارات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    const notifications = await notificationsDb.getByUser(userId, unreadOnly)
    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error('[API/supabase/notifications] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب الإشعارات' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/notifications - إنشاء إشعار جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, email, type, category, title, message, related_type, related_id } = body

    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: 'نوع الإشعار والعنوان مطلوبان' },
        { status: 400 }
      )
    }

    const notification = await notificationsDb.create({
      user_id,
      email,
      type,
      category,
      title,
      message,
      related_type,
      related_id,
    })

    return NextResponse.json({ success: true, data: notification }, { status: 201 })
  } catch (error) {
    console.error('[API/supabase/notifications] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء الإشعار' },
      { status: 500 }
    )
  }
}

// PATCH /api/supabase/notifications - تحديث الإشعارات
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, markAllRead, userId } = body

    if (markAllRead && userId) {
      await notificationsDb.markAllAsRead(userId)
      return NextResponse.json({ success: true, message: 'تم تحديد جميع الإشعارات كمقروءة' })
    }

    if (id) {
      await notificationsDb.markAsRead(id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: 'معرف الإشعار مطلوب' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API/supabase/notifications] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل تحديث الإشعارات' },
      { status: 500 }
    )
  }
}
