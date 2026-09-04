import { asc, and, eq, inArray, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { appSnapshots, messages } from '@/lib/db/schema'
import { rejectCrossOrigin } from '@/lib/request-security'
import { requireUser } from '@/lib/server-auth'

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

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

async function aliasesForUser(email: string) {
  const aliases = new Set([email])
  const snapshot = await db.select({ data: appSnapshots.data })
    .from(appSnapshots)
    .where(eq(appSnapshots.id, 'teacher-platform-v1'))
    .limit(1)
  const data = record(snapshot[0]?.data)
  const students = Array.isArray(data?.students) ? data.students : []

  students.forEach((value) => {
    const student = record(value)
    if (!student) return
    const studentMatches = [student.email, student.googleEmail].some((candidate) => normalizedEmail(candidate) === email)
    const parentMatches = [student.parentEmail, student.parentGoogleEmail].some((candidate) => normalizedEmail(candidate) === email)
    if (!studentMatches && !parentMatches) return

    for (const key of ['id', 'email', 'googleEmail']) {
      if (student[key] != null && String(student[key]).trim()) aliases.add(String(student[key]).trim())
    }
    if (parentMatches || studentMatches) {
      for (const key of ['parent', 'parentName', 'parentEmail', 'parentGoogleEmail']) {
        if (student[key] != null && String(student[key]).trim()) aliases.add(String(student[key]).trim())
      }
    }
  })

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

function participantFilter(aliases: string[]) {
  return or(...aliases.flatMap((alias) => [eq(messages.senderId, alias), eq(messages.recipientId, alias)]))
}

function recipientFilter(aliases: string[]) {
  return or(...aliases.map((alias) => eq(messages.recipientId, alias)))
}

export async function GET(request: Request) {
  const context = await getContext(request)
  if (context.response) return context.response
  try {
    const rows = context.isAdmin
      ? await db.select().from(messages).orderBy(asc(messages.createdAt))
      : await db.select().from(messages).where(participantFilter(context.aliases)).orderBy(asc(messages.createdAt))
    return response({
      messages: rows,
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

    const inserted = await db.insert(messages).values({
      senderId: context.email,
      senderName: context.name || context.email,
      senderRole,
      recipientId,
      recipientName,
      recipientRole,
      body: text,
    }).returning()
    return response({ message: inserted[0], saved: true })
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
    const parsedIds: number[] = Array.isArray(body?.ids)
      ? body.ids.map((value: unknown) => Number(value)).filter((value: number): value is number => Number.isSafeInteger(value) && value > 0)
      : []
    const ids = [...new Set<number>(parsedIds)].slice(0, 100)
    if (!ids.length) return response({ error: 'لم يتم تحديد رسائل صالحة' }, 400)

    const filter = context.isAdmin
      ? inArray(messages.id, ids)
      : and(inArray(messages.id, ids), recipientFilter(context.aliases))
    await db.update(messages).set({ readAt: new Date() }).where(filter)
    return response({ updated: true, ids })
  } catch (error) {
    console.error('[v0] PATCH /api/messages failed', error)
    return response({ error: 'تعذر تحديث حالة الرسائل' }, 503)
  }
}
