import { db } from '@/lib/db'
import { appSnapshots } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { rejectCrossOrigin } from '@/lib/request-security'
import { requireAdmin, requireUser } from '@/lib/server-auth'

export const runtime = 'nodejs'
const SNAPSHOT_ID = 'teacher-platform-v1'
const ALLOWED_DATA_KEYS = new Set(['subjects', 'students', 'messages', 'devices', 'admins', 'files', 'devAuditLog', 'proctoringIncidents', 'recordElements', 'extraElements', 'adminWhatsapp', 'joinRequests', 'notifications', 'aiQuestionHistory'])
const USER_DATA_KEYS = new Set(['subjects', 'students', 'recordElements', 'extraElements', 'notifications'])

function response(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response
  try {
    const result = await db.select({ data: appSnapshots.data, updatedAt: appSnapshots.updatedAt })
      .from(appSnapshots)
      .where(eq(appSnapshots.id, SNAPSHOT_ID))
      .limit(1)
    const snapshot = result[0]
    const storedData = snapshot?.data
    const admin = await requireAdmin(request)
    if (!admin.response) return response({ data: storedData ?? null, updatedAt: snapshot?.updatedAt ?? null })
    const email = String(auth.user?.email || '').trim().toLowerCase()
    const role = String(auth.user?.role || '').trim().toLowerCase()
    const accountId = String(auth.user?.accountId || '').trim()
    const accountName = String(auth.user?.accountName || '').trim().toLowerCase()
    const rawData = storedData && typeof storedData === 'object' && !Array.isArray(storedData) ? storedData as Record<string, unknown> : {}
    const data = Object.fromEntries(Object.entries(rawData).filter(([key]) => USER_DATA_KEYS.has(key)).map(([key, value]) => {
      if (key === 'students' && Array.isArray(value)) {
        return [key, value.filter((student) => {
          if (!student || typeof student !== 'object') return false
          const record = student as Record<string, unknown>
          if (role === 'student') return String(record.id || '') === accountId || String(record.username || '').trim().toLowerCase() === accountName
          if (role === 'parent') return String(record.parent || '').trim().toLowerCase() === accountName || String(record.parentPhone || '').replace(/\D/g, '') === accountName.replace(/\D/g, '') || String(record.id || '') === accountId
          return [record.email, record.googleEmail, record.parentEmail, record.parentGoogleEmail].some((candidate) => String(candidate || '').trim().toLowerCase() === email)
        })]
      }
      if (key === 'notifications' && Array.isArray(value)) {
        return [key, value.filter((notification) => {
          if (!notification || typeof notification !== 'object') return false
          const record = notification as Record<string, unknown>
          return [record.userId, record.email, record.recipientId].some((candidate) => String(candidate || '').trim().toLowerCase() === email || String(candidate || '').trim() === accountId)
        })]
      }
      return [key, value]
    }))
    return response({ data, updatedAt: snapshot?.updatedAt ?? null })
  } catch (error) {
    console.error('[v0] GET /api/data failed', error)
    return response({ error: 'تعذر الاتصال بقاعدة البيانات' }, 503)
  }
}

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  const auth = await requireUser(request)
  if (auth.response) return auth.response
  try {
    const body = await request.json()
    const existing = await db.select({ data: appSnapshots.data })
      .from(appSnapshots)
      .where(eq(appSnapshots.id, SNAPSHOT_ID))
      .limit(1)
    const existingData = existing[0]?.data && typeof existing[0].data === 'object' && !Array.isArray(existing[0].data)
      ? existing[0].data as Record<string, unknown>
      : {}

    if (body?.action === 'request_logout') {
      const role = String(auth.user?.role || '').toLowerCase()
      if (role !== 'student' && role !== 'parent') return response({ error: 'هذا الطلب متاح للطالب وولي الأمر فقط' }, 403)
      const requestId = `logout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const accountId = String(auth.user?.accountId || '').slice(0, 160)
      const notifications = Array.isArray(existingData.notifications) ? existingData.notifications.filter((item) => item && typeof item === 'object') as Record<string, unknown>[] : []
      const active = notifications.find((item) => item.type === 'logout_request' && String(item.userId || '') === accountId && (item.status === 'pending' || item.status === 'approved'))
      if (active) return response({ saved: true, request: active })
      const now = new Date()
      const item = {
        id: requestId,
        requestId,
        type: 'logout_request',
        category: 'تسجيل الخروج',
        title: 'طلب تسجيل خروج',
        message: `طلب ${role === 'parent' ? 'ولي الأمر' : 'الطالب'} تسجيل الخروج من الصفحة الحالية`,
        role,
        roleLabel: role === 'parent' ? 'ولي أمر' : 'طالب',
        userId: accountId,
        email: String(auth.user?.email || '').slice(0, 240).toLowerCase(),
        name: String(auth.user?.name || auth.user?.accountName || '').slice(0, 160),
        requestedFromPage: String(body?.page || '').slice(0, 120),
        deviceId: String(body?.deviceId || '').slice(0, 120),
        status: 'pending',
        time: now.toLocaleString('ar-EG'),
        createdAt: now.toISOString(),
        read: false,
      }
      const mergedData = { ...existingData, notifications: [item, ...notifications].slice(0, 500) }
      await db.insert(appSnapshots)
        .values({ id: SNAPSHOT_ID, data: mergedData, updatedAt: now })
        .onConflictDoUpdate({ target: appSnapshots.id, set: { data: mergedData, updatedAt: now } })
      return response({ saved: true, request: item })
    }

    if (body?.action === 'resolve_logout_request') {
      const admin = await requireAdmin(request)
      if (admin.response) return admin.response
      const requestId = String(body?.requestId || '')
      const status = body?.status === 'approved' ? 'approved' : body?.status === 'rejected' ? 'rejected' : ''
      if (!requestId || !status) return response({ error: 'طلب الخروج غير صالح' }, 400)
      const notifications = Array.isArray(existingData.notifications) ? existingData.notifications.filter((item) => item && typeof item === 'object') as Record<string, unknown>[] : []
      const target = notifications.find((item) => String(item.id || item.requestId || '') === requestId && item.type === 'logout_request')
      if (!target) return response({ error: 'لم يتم العثور على طلب الخروج' }, 404)
      Object.assign(target, { status, read: true, reviewedAt: new Date().toISOString(), reviewedBy: admin.user?.email || admin.user?.id || null })
      const mergedData = { ...existingData, notifications }
      await db.insert(appSnapshots)
        .values({ id: SNAPSHOT_ID, data: mergedData, updatedAt: new Date() })
        .onConflictDoUpdate({ target: appSnapshots.id, set: { data: mergedData, updatedAt: new Date() } })
      return response({ saved: true, request: target })
    }

    const device = body?.device
    if (!device || typeof device !== 'object' || Array.isArray(device) || typeof device.deviceId !== 'string') {
      return response({ error: 'بيانات الجهاز غير صالحة' }, 400)
    }
    const devices = Array.isArray(existingData.devices) ? existingData.devices.filter((item) => item && typeof item === 'object') as Record<string, unknown>[] : []
    const safeDevice = {
      deviceId: device.deviceId.slice(0, 120),
      role: String(auth.user?.role || device.role || '').slice(0, 30),
      userId: auth.user?.id || null,
      userName: String(device.userName || '').slice(0, 160),
      lastSeenAt: new Date().toISOString(),
      userAgent: String(device.userAgent || '').slice(0, 240),
    }
    const withoutCurrent = devices.filter((item) => item.deviceId !== safeDevice.deviceId)
    const mergedData = { ...existingData, devices: [safeDevice, ...withoutCurrent].slice(0, 100) }
    await db.insert(appSnapshots)
      .values({ id: SNAPSHOT_ID, data: mergedData, updatedAt: new Date() })
      .onConflictDoUpdate({ target: appSnapshots.id, set: { data: mergedData, updatedAt: new Date() } })
    return response({ saved: true })
  } catch (error) {
    console.error('[v0] POST /api/data device registration failed', error)
    return response({ error: 'تعذر تسجيل الجهاز' }, 503)
  }
}

export async function PUT(request: Request) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response
  try {
    const body = await request.json()
    if (!body || typeof body.data !== 'object' || Array.isArray(body.data)) {
      return response({ error: 'صيغة البيانات غير صالحة' }, 400)
    }
    const sanitizedData = Object.fromEntries(Object.entries(body.data).filter(([key]) => ALLOWED_DATA_KEYS.has(key)))
    const audit = body.audit && typeof body.audit === 'object' && !Array.isArray(body.audit) ? body.audit as Record<string, unknown> : null
    const existingForAudit = Array.isArray(sanitizedData.devAuditLog) ? sanitizedData.devAuditLog : []
    if (audit) {
      sanitizedData.devAuditLog = [...existingForAudit, {
        id: `visit_${Date.now()}`,
        action: 'admin_visit_update',
        actorId: auth.user?.id ?? null,
        actorEmail: auth.user?.email ?? null,
        targetUserId: String(audit.targetUserId ?? ''),
        targetRole: audit.targetRole === 'parent' ? 'parent' : 'student',
        at: new Date().toISOString(),
      }].slice(-500)
    }
    const serialized = JSON.stringify(sanitizedData)
    if (serialized.length > 5_000_000) {
      return response({ error: 'حجم البيانات أكبر من الحد المسموح' }, 413)
    }
    const existing = await db.select({ data: appSnapshots.data })
      .from(appSnapshots)
      .where(eq(appSnapshots.id, SNAPSHOT_ID))
      .limit(1)
    const existingData = existing[0]?.data && typeof existing[0].data === 'object' && !Array.isArray(existing[0].data)
      ? existing[0].data as Record<string, unknown>
      : {}
    const mergedData = { ...existingData, ...sanitizedData }
    const result = await db.insert(appSnapshots)
      .values({ id: SNAPSHOT_ID, data: mergedData, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSnapshots.id,
        set: { data: mergedData, updatedAt: new Date() },
      })
      .returning({ updatedAt: appSnapshots.updatedAt })
    return response({ saved: true, updatedAt: result[0]?.updatedAt ?? new Date() })
  } catch (error) {
    console.error('[v0] PUT /api/data failed', error)
    return response({ error: 'تعذر حفظ البيانات في قاعدة البيانات' }, 503)
  }
}
