import { NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { antiCheatEvents, antiCheatGlobalConfig, antiCheatItemConfigs, antiCheatSessions } from '@/lib/db/schema'
import { calculateRiskScore, defaultAntiCheatConfig, normalizeServerConfig, severityFor, type AntiCheatConfig } from '@/lib/anti-cheat-engine'
import { rejectCrossOrigin } from '@/lib/request-security'
import { requireAdmin, requireUser } from '@/lib/server-auth'

const id = () => crypto.randomUUID()
const clamp = (value: unknown, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0))
const validType = (value: unknown) => value === 'recitation' || value === 'exam' || value === 'task'
const safeConfig = (value: unknown): AntiCheatConfig => normalizeServerConfig(value)

// Safe In-Memory Store when external relational DB is unreachable
const memoryStore = {
  global: { id: true, enabled: false, config: {} as Record<string, unknown> },
  items: new Map<string, { itemId: string; itemType: string; enabled: boolean; isOverride: boolean; config: Record<string, unknown>; updatedAt: Date }>(),
  sessions: new Map<string, Record<string, unknown>>(),
  events: [] as Array<Record<string, unknown>>,
}

async function safeDbSelectGlobal() {
  try {
    const rows = await Promise.race([
      db.select().from(antiCheatGlobalConfig).where(eq(antiCheatGlobalConfig.id, true)).limit(1),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ])
    if (rows && rows[0]) {
      memoryStore.global = rows[0] as any
      return rows[0]
    }
  } catch {
    // fallback to memory
  }
  return memoryStore.global
}

async function safeDbSelectItems() {
  try {
    const rows = await Promise.race([
      db.select().from(antiCheatItemConfigs).orderBy(desc(antiCheatItemConfigs.updatedAt)),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ])
    if (Array.isArray(rows)) return rows
  } catch {
    // fallback to memory
  }
  return Array.from(memoryStore.items.values())
}

async function safeDbSelectItem(itemId: string, itemType: string) {
  try {
    const rows = await Promise.race([
      db.select().from(antiCheatItemConfigs).where(and(eq(antiCheatItemConfigs.itemId, itemId), eq(antiCheatItemConfigs.itemType, itemType))).limit(1),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ])
    if (rows && rows[0]) return rows[0]
  } catch {
    // fallback to memory
  }
  return memoryStore.items.get(`${itemId}:${itemType}`) || null
}

async function resolveConfig(itemId: string, itemType: string) {
  const item = await safeDbSelectItem(itemId, itemType)
  if (item) return { config: safeConfig({ enabled: item.enabled, ...(item.config as object) }), source: 'override' as const }
  const current = await safeDbSelectGlobal()
  return { config: safeConfig({ enabled: current?.enabled ?? false, ...(current?.config as object ?? {}) }), source: 'global-default' as const }
}

export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const itemType = searchParams.get('itemType')
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      const admin = await requireAdmin(request)
      if (admin.response) return admin.response
      let session: Record<string, unknown> | null = null
      let events: Array<Record<string, unknown>> = []
      try {
        const rows = await db.select().from(antiCheatSessions).where(eq(antiCheatSessions.id, sessionId)).limit(1)
        session = (rows && rows[0]) as any
        if (session) {
          events = (await db.select().from(antiCheatEvents).where(eq(antiCheatEvents.sessionId, sessionId)).orderBy(desc(antiCheatEvents.timestamp))) as any
        }
      } catch {
        session = memoryStore.sessions.get(sessionId) || null
        events = memoryStore.events.filter((e) => e.sessionId === sessionId)
      }
      if (!session) return NextResponse.json({ error: 'جلسة المراقبة غير موجودة' }, { status: 404 })
      return NextResponse.json({ session, events })
    }

    if (itemId && itemType && validType(itemType)) return NextResponse.json(await resolveConfig(itemId, itemType))

    const admin = await requireAdmin(request)
    if (admin.response) return admin.response

    const [global, items] = await Promise.all([
      safeDbSelectGlobal(),
      safeDbSelectItems(),
    ])

    return NextResponse.json({ global: global ?? { id: true, enabled: false, config: {} }, items: items ?? [] })
  } catch (error) {
    return NextResponse.json({ global: memoryStore.global, items: Array.from(memoryStore.items.values()) })
  }
}

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  const auth = await requireUser(request)
  if (auth.response) return auth.response
  try {
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > 256_000) return NextResponse.json({ error: 'بيانات المراقبة أكبر من الحد المسموح' }, { status: 413 })
    const body = await request.json()
    const { action } = body ?? {}

    if (action === 'save-global' || action === 'save-config') {
      const admin = await requireAdmin(request)
      if (admin.response) return admin.response
    }

    if (action === 'save-global') {
      const enabled = Boolean(body.enabled)
      const existingGlobal = await safeDbSelectGlobal()
      const config = body.config && typeof body.config === 'object' ? body.config : existingGlobal?.config ?? {}
      memoryStore.global = { id: true, enabled, config }
      try {
        await db.insert(antiCheatGlobalConfig).values({ id: true, enabled, config }).onConflictDoUpdate({ target: antiCheatGlobalConfig.id, set: { enabled, config, updatedAt: new Date() } })
      } catch {}
      return NextResponse.json({ ok: true, global: memoryStore.global })
    }

    if (action === 'save-config') {
      const itemId = String(body.item?.itemId ?? '')
      const itemType = String(body.item?.itemType ?? '')
      if (!itemId || !validType(itemType)) return NextResponse.json({ error: 'هوية العنصر غير صالحة' }, { status: 400 })
      const enabled = Boolean(body.item.enabled)
      const itemRecord = { itemId, itemType, enabled, isOverride: true, config: body.item.config ?? {}, updatedAt: new Date() }
      memoryStore.items.set(`${itemId}:${itemType}`, itemRecord)
      try {
        await db.insert(antiCheatItemConfigs).values(itemRecord).onConflictDoUpdate({ target: [antiCheatItemConfigs.itemId, antiCheatItemConfigs.itemType], set: { enabled, isOverride: true, config: body.item.config ?? {}, updatedAt: new Date() } })
      } catch {}
      return NextResponse.json({ ok: true, item: itemRecord })
    }

    if (action === 'start') {
      const session = body.session ?? {}
      const itemId = String(session.itemId ?? ''), itemType = String(session.itemType ?? '')
      if (!session.studentId || !itemId || !validType(itemType)) return NextResponse.json({ error: 'بيانات الجلسة غير مكتملة' }, { status: 400 })
      const resolved = await resolveConfig(itemId, itemType)
      if (!resolved.config.enabled) return NextResponse.json({ sessionId: null, config: resolved.config, source: resolved.source, disabled: true })

      const newId = session.sessionId ? String(session.sessionId) : id()
      const created = { id: newId, studentId: String(session.studentId), itemId, itemType, status: 'active', riskScore: 0, severity: 'NORMAL', currentQuestion: session.currentQuestion == null ? null : Number(session.currentQuestion), attemptId: session.attemptId ? String(session.attemptId) : null }
      memoryStore.sessions.set(created.id, created)
      try {
        await db.insert(antiCheatSessions).values(created as any)
      } catch {}
      return NextResponse.json({ sessionId: created.id, config: resolved.config, source: resolved.source, reused: false })
    }

    if (action === 'event') {
      const event = body.event ?? {}
      if (!event.sessionId || !event.studentId || !event.itemId || !validType(event.itemType) || !event.eventType) return NextResponse.json({ error: 'بيانات الحدث غير مكتملة' }, { status: 400 })
      let session = memoryStore.sessions.get(String(event.sessionId))
      if (!session) {
        try {
          const sessionRows = await db.select().from(antiCheatSessions).where(eq(antiCheatSessions.id, String(event.sessionId))).limit(1)
          session = sessionRows[0] as any
        } catch {}
      }
      const resolved = await resolveConfig(String(event.itemId), String(event.itemType))
      const rawSignals = Array.isArray(event.signals) ? event.signals.filter((signal: unknown) => signal && typeof signal === 'object').slice(0, 20) : []
      const signals: Array<{ type: string; active: boolean; durationMs: number; frequency: number }> = rawSignals.map((signal: Record<string, unknown>) => ({ type: String(signal.type || 'unknown').slice(0, 64), active: Boolean(signal.active), durationMs: clamp(signal.durationMs, 0, 86400000), frequency: clamp(signal.frequency, 0, 100) }))
      const prevRisk = Number(session?.riskScore || 0)
      const riskScore = clamp(calculateRiskScore(signals, prevRisk)), severity = severityFor(riskScore, resolved.config)
      const riskDelta = riskScore - prevRisk
      const reason = String(event.reason || 'تم رصد إشارة قابلة للتفسير من مجموعة الفحوص').slice(0, 300)
      const metadata = event.metadata && typeof event.metadata === 'object' ? event.metadata : { signalCount: signals.filter((signal) => signal.active).length, signalTypes: signals.filter((signal) => signal.active).map((signal) => signal.type) }

      const evRecord = { id: id(), sessionId: String(event.sessionId), studentId: String(event.studentId), itemId: String(event.itemId), itemType: String(event.itemType), eventType: String(event.eventType).slice(0, 64), riskScore, riskDelta, severity, decision: severity, reason, durationMs: clamp(event.durationMs, 0, 86400000), metadata }
      memoryStore.events.push(evRecord)
      if (session) {
        session.riskScore = riskScore
        session.severity = severity
      }
      try {
        await db.insert(antiCheatEvents).values(evRecord as any)
        await db.update(antiCheatSessions).set({ riskScore, severity, updatedAt: new Date() }).where(eq(antiCheatSessions.id, String(event.sessionId)))
      } catch {}
      return NextResponse.json({ ok: true, riskScore, severity })
    }

    if (action === 'end' && body.session?.id) {
      const sess = memoryStore.sessions.get(String(body.session.id))
      if (sess) {
        sess.status = 'completed'
        sess.endedAt = new Date()
      }
      try {
        await db.update(antiCheatSessions).set({ status: 'completed', endedAt: new Date(), updatedAt: new Date(), riskScore: clamp(body.session.riskScore), severity: String(body.session.severity || 'NORMAL') }).where(eq(antiCheatSessions.id, String(body.session.id)))
      } catch {}
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
