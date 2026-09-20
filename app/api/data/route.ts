import { rejectCrossOrigin } from '@/lib/request-security'
import { requireAdmin, requireUser } from '@/lib/server-auth'
import { appSnapshotsDb, messagesDb, devicesDb } from '@/lib/supabase/database'

export const runtime = 'nodejs'
const SNAPSHOT_ID = 'teacher-platform-v1'
const ALLOWED_DATA_KEYS = new Set(['subjects', 'students', 'messages', 'devices', 'admins', 'files', 'devAuditLog', 'proctoringIncidents', 'recordElements', 'extraElements', 'adminWhatsapp', 'adminWhatsappCountry', 'joinRequests', 'notifications', 'aiQuestionHistory', 'tasks', 'evaluations'])
const USER_DATA_KEYS = new Set(['subjects', 'students', 'recordElements', 'extraElements', 'notifications', 'tasks', 'evaluations'])

function response(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function safeArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return []
  return value.filter((item) => item && typeof item === 'object' && !Array.isArray(item)) as Record<string, unknown>[]
}

export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response
  try {
    const snapshot = await appSnapshotsDb.get(SNAPSHOT_ID)
    const storedData = isPlainObject(snapshot?.data) ? snapshot!.data : {}

    const admin = await requireAdmin(request)
    if (!admin.response) {
      return response({ data: storedData, updatedAt: snapshot?.updated_at ?? null })
    }

    const email = String(auth.user?.email || '').trim().toLowerCase()
    const role = String(auth.user?.role || '').trim().toLowerCase()
    const accountId = String(auth.user?.accountId || '').trim()
    const accountName = String(auth.user?.accountName || '').trim().toLowerCase()

    const data: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(storedData)) {
      if (!USER_DATA_KEYS.has(key)) continue
      if (key === 'students' && Array.isArray(value)) {
        const filtered = safeArray(value).filter((record) => {
          if (role === 'student') {
            return String(record.id || '') === accountId || String(record.username || '').trim().toLowerCase() === accountName
          }
          if (role === 'parent') {
            return String(record.parent || '').trim().toLowerCase() === accountName
              || String(record.parentPhone || '').replace(/\D/g, '') === accountName.replace(/\D/g, '')
              || String(record.id || '') === accountId
          }
          return [record.email, record.googleEmail, record.parentEmail, record.parentGoogleEmail].some((candidate) => String(candidate || '').trim().toLowerCase() === email)
        })
        data[key] = filtered
        continue
      }
      if (key === 'notifications' && Array.isArray(value)) {
        const filtered = safeArray(value).filter((record) => {
          return [record.userId, record.email, record.recipientId].some((candidate) => {
            const value = String(candidate || '').trim().toLowerCase()
            return value === email || String(candidate || '').trim() === accountId
          })
        })
        data[key] = filtered
        continue
      }
      if (key === 'tasks' && Array.isArray(value)) {
        const filtered = safeArray(value).filter((record) => {
          if (role === 'student') {
            return String(record.studentId || record.student_id || '') === accountId
              || String(record.studentUsername || record.student_username || '').trim().toLowerCase() === accountName
          }
          return true
        })
        data[key] = filtered
        continue
      }
      if (key === 'evaluations' && Array.isArray(value)) {
        const filtered = safeArray(value).filter((record) => {
          if (role === 'student') {
            return String(record.studentId || record.student_id || '') === accountId
              || String(record.studentUsername || record.student_username || '').trim().toLowerCase() === accountName
          }
          return true
        })
        data[key] = filtered
        continue
      }
      data[key] = value
    }
    return response({ data, updatedAt: snapshot?.updated_at ?? null })
  } catch (error) {
    console.error('[v0] GET /api/data failed', error)
    return response({ error: 'تعذر الاتصال بقاعدة البيانات' }, 503)
  }
}

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  try {
    const body = await request.json().catch(() => ({}))

    // Handle public signup / registration requests directly to database
    if (body?.action === 'submit_signup_request' && body?.request) {
      const snapshot = await appSnapshotsDb.get(SNAPSHOT_ID)
      const existingData: Record<string, unknown> = isPlainObject(snapshot?.data) ? snapshot!.data : {}
      const joinRequests = safeArray(existingData.joinRequests)
      const messages = safeArray(existingData.messages)
      const newReq = body.request
      if (!newReq.id) newReq.id = `jr_${Date.now()}`
      const mergedRequests = [newReq, ...joinRequests.filter((r) => r.id !== newReq.id)].slice(0, 500)

      let mergedMessages = messages
      if (body?.message && typeof body.message === 'object') {
        const newMsg = body.message
        if (!newMsg.id) newMsg.id = `m_${Date.now()}`
        mergedMessages = [newMsg, ...messages.filter((m) => m.id !== newMsg.id)].slice(0, 1000)
      }

      const mergedData = { ...existingData, joinRequests: mergedRequests, messages: mergedMessages }
      await appSnapshotsDb.upsert(SNAPSHOT_ID, mergedData)
      return response({ saved: true, request: newReq })
    }

    const auth = await requireUser(request)
    if (auth.response) return auth.response

    const snapshot = await appSnapshotsDb.get(SNAPSHOT_ID)
    const existingData: Record<string, unknown> = isPlainObject(snapshot?.data) ? snapshot!.data : {}

    if (body?.action === 'request_logout') {
      const role = String(auth.user?.role || '').toLowerCase()
      if (role !== 'student' && role !== 'parent') return response({ error: 'هذا الطلب متاح للطالب وولي الأمر فقط' }, 403)
      const requestId = `logout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const accountId = String(auth.user?.accountId || '').slice(0, 160)
      const notifications = safeArray(existingData.notifications)
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
        parentName: String(body?.parentName || '').slice(0, 160),
        deviceId: String(body?.deviceId || '').slice(0, 120),
        status: 'pending',
        time: now.toLocaleString('ar-EG'),
        createdAt: now.toISOString(),
        read: false,
      }
      const mergedData = { ...existingData, notifications: [item, ...notifications].slice(0, 500) }
      await appSnapshotsDb.upsert(SNAPSHOT_ID, mergedData)
      return response({ saved: true, request: item })
    }

    if (body?.action === 'consume_logout_request') {
      const role = String(auth.user?.role || '').toLowerCase()
      if (role !== 'student' && role !== 'parent') return response({ error: 'غير مصرح' }, 403)
      const requestId = String(body?.requestId || '')
      const notifications = safeArray(existingData.notifications)
      const target = notifications.find((item) => String(item.id || item.requestId || '') === requestId && item.type === 'logout_request' && String(item.userId || '') === String(auth.user?.accountId || ''))
      if (!target || target.status !== 'approved') return response({ error: 'طلب الخروج غير معتمد' }, 409)
      Object.assign(target, { status: 'completed', completedAt: new Date().toISOString(), lockedPage: '', deviceId: String(body?.deviceId || '').slice(0, 120) })
      const devices = safeArray(existingData.devices)
      const deviceId = String(body?.deviceId || '')
      const device = devices.find((item) => String(item.deviceId || '') === deviceId)
      if (device) Object.assign(device, { lockedPage: '', currentPage: '', loggedOutAt: new Date().toISOString() })
      const mergedData = { ...existingData, notifications, devices }
      await appSnapshotsDb.upsert(SNAPSHOT_ID, mergedData)
      return response({ saved: true, lockedPage: body?.lockedPage || null })
    }

    if (body?.action === 'resolve_logout_request') {
      const admin = await requireAdmin(request)
      if (admin.response) return admin.response
      const requestId = String(body?.requestId || '')
      const status = body?.status === 'approved' ? 'approved' : body?.status === 'rejected' ? 'rejected' : ''
      if (!requestId || !status) return response({ error: 'طلب الخروج غير صالح' }, 400)
      const notifications = safeArray(existingData.notifications)
      const target = notifications.find((item) => String(item.id || item.requestId || '') === requestId && item.type === 'logout_request')
      if (!target) return response({ error: 'لم يتم العثور على طلب الخروج' }, 404)
      const reviewedAt = new Date().toISOString()
      Object.assign(target, { status, read: true, reviewedAt, reviewedBy: admin.user?.email || admin.user?.id || null })
      const messages = safeArray(existingData.messages)
      const isParent = target.role === 'parent'
      const decisionText = status === 'approved'
        ? 'تم قبول طلبك في تسجيل الخروج. تم تسجيل خروج هذا الجهاز وإلغاء تقييده بهذه الصفحة.'
        : 'تم رفض طلبك في تسجيل الخروج من المسؤول.'
      messages.unshift({
        id: `m_logout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: 'admin',
        sender: 'المسؤول',
        senderId: admin.user?.id || 0,
        receiverType: isParent ? 'parent' : 'student',
        receiverId: isParent ? undefined : target.userId,
        receiverName: isParent ? String(target.parentName || target.name || '') : undefined,
        text: decisionText,
        time: new Date().toLocaleString('ar-EG'),
        approved: true,
        read: false,
        logoutRequestId: target.id || target.requestId,
      })
      const mergedData = { ...existingData, notifications, messages }
      await appSnapshotsDb.upsert(SNAPSHOT_ID, mergedData)
      return response({ saved: true, request: target })
    }

    const device = body?.device
    if (!device || typeof device !== 'object' || Array.isArray(device) || typeof device.deviceId !== 'string') {
      return response({ error: 'بيانات الجهاز غير صالحة' }, 400)
    }
    const safeDevice = {
      deviceId: String(device.deviceId).slice(0, 120),
      role: String(auth.user?.role || device.role || '').slice(0, 30),
      userId: auth.user?.id || null,
      userName: String(device.userName || '').slice(0, 160),
      lastSeenAt: new Date().toISOString(),
      currentPage: String(device.currentPage || '').slice(0, 120),
      lockedPage: String(device.lockedPage || '').slice(0, 120),
      userAgent: String(device.userAgent || '').slice(0, 240),
    }
    try {
      await devicesDb.registerDevice({
        device_id: safeDevice.deviceId,
        user_id: safeDevice.userId || undefined,
        user_name: safeDevice.userName,
        role: safeDevice.role,
        current_page: safeDevice.currentPage,
        locked_page: safeDevice.lockedPage,
        user_agent: safeDevice.userAgent,
      })
    } catch (e) {
      console.warn('[v0] device registration in dedicated table failed (continuing)', e)
    }
    const devices = safeArray(existingData.devices).filter((item) => String(item.deviceId || '') !== safeDevice.deviceId)
    const mergedData = { ...existingData, devices: [safeDevice, ...devices].slice(0, 100) }
    await appSnapshotsDb.upsert(SNAPSHOT_ID, mergedData)
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
    const sanitizedData: Record<string, unknown> = Object.fromEntries(
      Object.entries(body.data as Record<string, unknown>).filter(([key]) => ALLOWED_DATA_KEYS.has(key))
    )
    const audit = isPlainObject(body.audit) ? body.audit : null
    const existingForAudit = Array.isArray(sanitizedData.devAuditLog) ? sanitizedData.devAuditLog : []
    if (audit) {
      sanitizedData.devAuditLog = [
        ...existingForAudit,
        {
          id: `visit_${Date.now()}`,
          action: 'admin_visit_update',
          actorId: auth.user?.id ?? null,
          actorEmail: auth.user?.email ?? null,
          targetUserId: String(audit.targetUserId ?? ''),
          targetRole: audit.targetRole === 'parent' ? 'parent' : 'student',
          at: new Date().toISOString(),
        },
      ].slice(-500)
    }
    const serialized = JSON.stringify(sanitizedData)
    if (serialized.length > 5_000_000) {
      return response({ error: 'حجم البيانات أكبر من الحد المسموح' }, 413)
    }
    const snapshot = await appSnapshotsDb.get(SNAPSHOT_ID)
    const existingData: Record<string, unknown> = isPlainObject(snapshot?.data) ? snapshot!.data : {}
    const mergedData = { ...existingData, ...sanitizedData }
    const updated = await appSnapshotsDb.upsert(SNAPSHOT_ID, mergedData)
    return response({ saved: true, updatedAt: updated.updated_at })
  } catch (error) {
    console.error('[v0] PUT /api/data failed', error)
    return response({ error: 'تعذر حفظ البيانات في قاعدة البيانات' }, 503)
  }
}
