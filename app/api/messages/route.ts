import { rejectCrossOrigin } from '@/lib/request-security'
import { requireUser } from '@/lib/server-auth'
import { appSnapshotsDb, messagesDb } from '@/lib/supabase/database'

export const runtime = 'nodejs'

const MAX_MESSAGE_LENGTH = 5000
const ALLOWED_ROLES = new Set(['admin', 'student', 'parent', 'user'])

function response(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function normalizedEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function adminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => normalizedEmail(email))
      .filter(Boolean),
  )
}

function record(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

async function aliasesForUser(email: string) {
  const aliases = new Set([email])
  const snapshot = await appSnapshotsDb.get('teacher-platform-v1')
  const data = record(snapshot?.data)
  const students = Array.isArray(data?.students) ? data.students : []

  for (const value of students) {
    const student = record(value)
    if (!student) continue
    const studentMatches = [student.email, student.googleEmail].some((candidate) => normalizedEmail(candidate) === email)
    const parentMatches = [student.parentEmail, student.parentGoogleEmail].some((candidate) => normalizedEmail(candidate) === email)
    if (!studentMatches && !parentMatches) continue

    for (const key of ['id', 'email', 'googleEmail']) {
      if (student[key] != null && String(student[key]).trim()) aliases.add(String(student[key]).trim())
    }
    if (parentMatches || studentMatches) {
      for (const key of ['parent', 'parentName', 'parentEmail', 'parentGoogleEmail']) {
        if (student[key] != null && String(student[key]).trim()) aliases.add(String(student[key]).trim())
      }
    }
  }

  return [...aliases]
}

async function getContext(request: Request) {
  const auth = await requireUser(request)
  if (auth.response) return { response: auth.response, email: '', name: '', isAdmin: false, aliases: [] as string[] }
  const email = normalizedEmail(auth.user?.email)
  if (!email) return { response: response({ error: 'هوية المستخدم غير مكتملة' }, 400), email: '', name: '', isAdmin: false, aliases: [] as string[] }
  const isAdmin = adminEmails().has(email)
  const aliases = isAdmin ? [email] : await aliasesForUser(email)
  return { response: null, email, name: String(auth.user?.name || auth.user?.email || '').trim(), isAdmin, aliases }
}

async function getMessagesForUser(email: string, isAdmin: boolean): Promise<Record<string, unknown>[]> {
  try {
    const allMessages = await messagesDb.getAll()
    if (isAdmin) return allMessages
    return allMessages.filter((msg) => {
      const senderId = String(msg.sender_id || msg.senderId || '').trim().toLowerCase()
      const receiverId = String(msg.receiver_id || msg.receiverId || '').trim().toLowerCase()
      const senderEmail = String(msg.sender_email || '').trim().toLowerCase()
      const receiverEmail = String(msg.receiver_email || '').trim().toLowerCase()
      return email === senderId || email === receiverId || email === senderEmail || email === receiverEmail
    })
  } catch (error) {
    console.warn('[v0] messagesDb.getAll() failed, falling back to snapshots', error)
    const snapshot = await appSnapshotsDb.get('teacher-platform-v1')
    const data = record(snapshot?.data)
    return Array.isArray(data?.messages) ? data.messages as Record<string, unknown>[] : []
  }
}

export async function GET(request: Request) {
  const context = await getContext(request)
  if (context.response) return context.response
  try {
    const messages = await getMessagesForUser(context.email, context.isAdmin)
    messages.sort((a, b) => {
      const dateA = new Date(String(a.created_at || a.time || 0)).getTime()
      const dateB = new Date(String(b.created_at || b.time || 0)).getTime()
      return dateA - dateB
    })
    return response({
      messages,
      identity: { id: context.email, name: context.name, role: context.isAdmin ? 'admin' : 'user' },
      isAdmin: context.isAdmin,
    })
  } catch (error) {
    console.error('[v0] GET /api/messages failed', error)
    return response({ error: 'تعذر تحميل الرسائل' }, 503)
  }
}

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  const context = await getContext(request)
  if (context.response) return context.response
  try {
    const body = await request.json()
    const recipientId = typeof body?.recipientId === 'string' ? body.recipientId.trim() : ''
    const recipientName = typeof body?.recipientName === 'string' ? body.recipientName.trim() : ''
    const recipientRole = typeof body?.recipientRole === 'string' ? body.recipientRole.trim() : ''
    const text = typeof body?.text === 'string' ? body.text.trim() : typeof body?.body === 'string' ? body.body.trim() : ''
    const requestedRole = typeof body?.senderRole === 'string' ? body.senderRole.trim() : 'user'
    const senderRole = context.isAdmin && ALLOWED_ROLES.has(requestedRole) ? requestedRole : requestedRole === 'student' || requestedRole === 'parent' ? requestedRole : 'user'

    if (!recipientId || !recipientName || !ALLOWED_ROLES.has(recipientRole) || !text) return response({ error: 'بيانات الرسالة غير مكتملة' }, 400)
    if (text.length > MAX_MESSAGE_LENGTH || context.email.length > 160 || recipientId.length > 160 || recipientName.length > 240) return response({ error: 'بيانات الرسالة تتجاوز الحد المسموح' }, 400)

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const message = {
      sender_id: context.email,
      sender_name: context.name || context.email,
      sender_role: senderRole,
      receiver_id: recipientId,
      receiver_name: recipientName,
      receiver_role: recipientRole,
      body: text,
      sender_email: context.email,
      receiver_email: recipientId.includes('@') ? recipientId : undefined,
      type: 'direct' as const,
      approved: true,
      read: false,
      id,
    }

    try {
      const saved = await messagesDb.create(message as Parameters<typeof messagesDb.create>[0])
      return response({ message: saved, saved: true })
    } catch (dbError) {
      console.warn('[v0] messagesDb.create() failed, saving to snapshots', dbError)
      const snapshot = await appSnapshotsDb.get('teacher-platform-v1')
      const data = record(snapshot?.data)
      const existingMessages = Array.isArray(data?.messages) ? data.messages : []
      const merged = { ...data, messages: [message, ...existingMessages].slice(0, 500) }
      await appSnapshotsDb.upsert('teacher-platform-v1', merged)
      return response({ message, saved: true, fallback: true })
    }
  } catch (error) {
    console.error('[v0] POST /api/messages failed', error)
    return response({ error: 'تعذر حفظ الرسالة' }, 503)
  }
}

export async function PATCH(request: Request) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  const context = await getContext(request)
  if (context.response) return context.response
  try {
    const body = await request.json()
    const parsedIds: string[] = Array.isArray(body?.ids)
      ? body.ids.map((value: unknown) => String(value)).filter((value: string) => value.trim().length > 0)
      : []
    const ids = [...new Set(parsedIds)].slice(0, 100)
    if (!ids.length) return response({ error: 'لم يتم تحديد رسائل صالحة' }, 400)

    for (const id of ids) {
      try {
        await messagesDb.markRead(id)
      } catch (e) {
        console.warn(`[v0] Failed to mark message ${id} as read`, e)
      }
    }

    return response({ updated: true, ids })
  } catch (error) {
    console.error('[v0] PATCH /api/messages failed', error)
    return response({ error: 'تعذر تحديث حالة الرسائل' }, 503)
  }
}
