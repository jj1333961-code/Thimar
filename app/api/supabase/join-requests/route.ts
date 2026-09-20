import { NextRequest, NextResponse } from 'next/server'
import { joinRequestsDb } from '@/lib/supabase/database'
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

// GET /api/supabase/join-requests - جلب طلبات الانضمام
export async function GET(request: NextRequest) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null

    const requests = await joinRequestsDb.getAll(status || undefined)
    return json({ requests })
  } catch (error) {
    console.error('[API/supabase/join-requests] GET error:', error)
    return json({ error: 'فشل جلب طلبات الانضمام' }, 500)
  }
}

// POST /api/supabase/join-requests - إنشاء طلب انضمام جديد
export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  try {
    const body = await request.json()
    const { name, email, phone, role, country, identity_code, age, provider = 'direct' } = body

    if (!name || !email || !phone || !role || !country || !identity_code) {
      return json({ error: 'جميع الحقول مطلوبة' }, 400)
    }

    const request_entry = await joinRequestsDb.create({
      name,
      email,
      phone,
      role,
      country,
      identity_code,
      age,
      provider,
    })

    // Also automatically create a notification for admin
    try {
      const { notificationsDb, messagesDb } = await import('@/lib/supabase/database')
      const roleLabel = role === 'teacher' ? 'معلم' : role === 'student' ? 'طالب' : 'ولي أمر'
      const providerLabel = provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : provider === 'whatsapp' ? 'WhatsApp' : 'التسجيل المباشر'
      
      await notificationsDb.create({
        user_id: 'admin',
        title: `طلب انضمام جديد (${providerLabel}): ${name}`,
        message: `سجل ${name} عبر (${providerLabel}) كـ (${roleLabel}) بكود هوية: ${identity_code}. الحساب بانتظار الاعتماد.`,
        type: 'signup',
        category: 'students'
      }).catch(() => {})

      // Automated pre-sent message to Admin
      await messagesDb.create({
        sender_id: email,
        sender_name: name,
        sender_role: role,
        receiver_id: 'admin@thimar.org',
        receiver_name: 'إدارة منصة ثمار',
        body: `السلام عليكم ورحمة الله، أنا ${name} قمت بالتسجيل عبر (${providerLabel}) كـ (${roleLabel}) بكود الهوية [${identity_code}]. أرجو مراجعة حسابي واعتماده.`,
      }).catch(() => {})
    } catch (e) {
      console.warn('Could not dispatch join notification/message:', e)
    }

    return json({ request: request_entry }, 201)
  } catch (error) {
    console.error('[API/supabase/join-requests] POST error:', error)
    return json({ error: 'فشل إنشاء طلب الانضمام' }, 500)
  }
}

// PATCH /api/supabase/join-requests - تحديث حالة طلب الانضمام (موافقة / رفض / حظر)
export async function PATCH(request: NextRequest) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError

  const auth = await requireAdmin(request)
  if (auth.response) return auth.response

  try {
    const body = await request.json()
    const { id, status, rejection_reason } = body

    if (!id || !status) {
      return json({ error: 'معرف الطلب والحالة مطلوبان' }, 400)
    }

    if (!['approved', 'rejected', 'banned'].includes(status)) {
      return json({ error: 'الحالة يجب أن تكون approved أو rejected أو banned' }, 400)
    }

    const updated = await joinRequestsDb.updateStatus(
      id,
      status as 'approved' | 'rejected' | 'banned',
      auth.user?.id,
      rejection_reason
    )

    // Notify and dispatch automated chat message
    try {
      const { notificationsDb, messagesDb } = await import('@/lib/supabase/database')
      if (status === 'banned') {
        await notificationsDb.create({
          user_id: 'admin',
          title: `⛔ تنبيه أمني: تم حظر حساب ${updated?.name || ''}`,
          message: `قام المسؤول بحظر المستخدم ${updated?.name || ''} (${updated?.email || ''}) ومنعه من دخول المنصة.`,
          type: 'security',
          category: 'security'
        }).catch(() => {})

        if (updated?.email) {
          await messagesDb.create({
            sender_id: 'admin@thimar.org',
            sender_name: 'إدارة منصة ثمار',
            sender_role: 'admin',
            receiver_id: updated.email,
            receiver_name: updated.name,
            body: 'تم حظر هذا الحساب من قبل إدارة المنصة لمخالفة السياسات والشروط.'
          }).catch(() => {})
        }
      } else if (status === 'approved' && updated?.email) {
        await notificationsDb.create({
          user_id: 'admin',
          title: `✅ تم اعتماد وتفعيل حساب ${updated.name}`,
          message: `تم اعتماد وتفعيل حساب ${updated.name} كـ (${updated.role}) بنجاح.`,
          type: 'success',
          category: 'students'
        }).catch(() => {})

        await messagesDb.create({
          sender_id: 'admin@thimar.org',
          sender_name: 'إدارة منصة ثمار',
          sender_role: 'admin',
          receiver_id: updated.email,
          receiver_name: updated.name,
          body: 'تهانينا! تمت مراجعة حسابك والموافقة عليه وتفعيله بنجاح. يمكنك الآن الدخول إلى المنصة وبدء مسيرتك القرآنية المباركة.'
        }).catch(() => {})
      } else if (status === 'rejected' && updated?.email) {
        await messagesDb.create({
          sender_id: 'admin@thimar.org',
          sender_name: 'إدارة منصة ثمار',
          sender_role: 'admin',
          receiver_id: updated.email,
          receiver_name: updated.name,
          body: `نعتذر منك، تم رفض طلب التسجيل الحالي.${rejection_reason ? ' السبب: ' + rejection_reason : ''}`
        }).catch(() => {})
      }
    } catch (e) {
      console.warn('Could not dispatch status change messages:', e)
    }

    return json({ request: updated })
  } catch (error) {
    console.error('[API/supabase/join-requests] PATCH error:', error)
    return json({ error: 'فشل تحديث حالة الطلب' }, 500)
  }
}
