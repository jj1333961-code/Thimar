import { NextRequest, NextResponse } from 'next/server'
import { notificationsDb } from '@/lib/supabase/database'
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

// GET /api/supabase/notifications - جلب الإشعارات
export async function GET(request: NextRequest) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    let notifications
    if (userId) {
      notifications = await notificationsDb.getByUser(userId, unreadOnly)
    } else {
      notifications = await notificationsDb.getAll(unreadOnly)
    }
    return json({ notifications })
  } catch (error) {
    console.error('[API/supabase/notifications] GET error:', error)
    return json({ error: 'فشل جلب الإشعارات' }, 500)
  }
}

// POST /api/supabase/notifications - إنشاء إشعار جديد
export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { user_id, email, type, category, title, message, related_type, related_id } = body

    if (!type || !title) {
      return json({ error: 'نوع الإشعار والعنوان مطلوبان' }, 400)
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

    return json({ notification }, 201)
  } catch (error) {
    console.error('[API/supabase/notifications] POST error:', error)
    return json({ error: 'فشل إنشاء الإشعار' }, 500)
  }
}

// PATCH /api/supabase/notifications - تحديث الإشعارات
export async function PATCH(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  const auth = await requireUser(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { id, markAllRead, userId } = body

    if (markAllRead && userId) {
      await notificationsDb.markAllAsRead(userId)
      return json({ message: 'تم تحديد جميع الإشعارات كمقروءة' })
    }

    if (id) {
      await notificationsDb.markAsRead(id)
      return json({ success: true })
    }

    return json({ error: 'معرف الإشعار مطلوب' }, 400)
  } catch (error) {
    console.error('[API/supabase/notifications] PATCH error:', error)
    return json({ error: 'فشل تحديث الإشعارات' }, 500)
  }
}
