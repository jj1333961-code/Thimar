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

async function resolveConfig(itemId: string, itemType: string) {
  const item = await db.select().from(antiCheatItemConfigs).where(and(eq(antiCheatItemConfigs.itemId, itemId), eq(antiCheatItemConfigs.itemType, itemType))).limit(1)
  if (item[0]) return { config: safeConfig({ enabled: item[0].enabled, ...(item[0].config as object) }), source: 'override' as const }
  const global = await db.select().from(antiCheatGlobalConfig).where(eq(antiCheatGlobalConfig.id, true)).limit(1)
  const current = global[0]
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
      const sessions = await db.select().from(antiCheatSessions).where(eq(antiCheatSessions.id, sessionId)).limit(1)
      if (!sessions[0]) return NextResponse.json({ error: 'جلسة المراقبة غير موجودة' }, { status: 404 })
      const events = await db.select().from(antiCheatEvents).where(eq(antiCheatEvents.sessionId, sessionId)).orderBy(desc(antiCheatEvents.timestamp))
      return NextResponse.json({ session: sessions[0], events })
    }
    if (itemId && itemType && validType(itemType)) return NextResponse.json(await resolveConfig(itemId, itemType))
    const admin = await requireAdmin(request)
    if (admin.response) return admin.response
    const [global, items] = await Promise.all([
      db.select().from(antiCheatGlobalConfig).where(eq(antiCheatGlobalConfig.id, true)).limit(1),
      db.select().from(antiCheatItemConfigs).orderBy(desc(antiCheatItemConfigs.updatedAt)),
    ])
    return NextResponse.json({ global: global[0] ?? { id: true, enabled: false, config: {} }, items })
  } catch (error) { console.error('[v0] GET /api/anti-cheat failed:', error instanceof Error ? error.message : error); return NextResponse.json({ error: 'تعذر تحميل إعدادات مكافحة الغش', code: 'ANTI_CHEAT_READ_FAILED' }, { status: 500 }) }
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
      const existingGlobal = await db.select().from(antiCheatGlobalConfig).where(eq(antiCheatGlobalConfig.id, true)).limit(1)
      const config = body.config && typeof body.config === 'object' ? body.config : existingGlobal[0]?.config ?? {}
      await db.insert(antiCheatGlobalConfig).values({ id: true, enabled, config }).onConflictDoUpdate({ target: antiCheatGlobalConfig.id, set: { enabled, config, updatedAt: new Date() } })
      const saved = await db.select().from(antiCheatGlobalConfig).where(eq(antiCheatGlobalConfig.id, true)).limit(1)
      return NextResponse.json({ ok: true, global: saved[0] })
    }
    if (action === 'save-config') {
      const itemId = String(body.item?.itemId ?? '')
      const itemType = String(body.item?.itemType ?? '')
      if (!itemId || !validType(itemType)) return NextResponse.json({ error: 'هوية العنصر غير صالحة' }, { status: 400 })
      const enabled = Boolean(body.item.enabled)
      await db.insert(antiCheatItemConfigs).values({ itemId, itemType, enabled, isOverride: true, config: body.item.config ?? {} }).onConflictDoUpdate({ target: [antiCheatItemConfigs.itemId, antiCheatItemConfigs.itemType], set: { enabled, isOverride: true, config: body.item.config ?? {}, updatedAt: new Date() } })
      const saved = await db.select().from(antiCheatItemConfigs).where(and(eq(antiCheatItemConfigs.itemId, itemId), eq(antiCheatItemConfigs.itemType, itemType))).limit(1)
      return NextResponse.json({ ok: true, item: saved[0] })
    }
    if (action === 'start') {
      const session = body.session ?? {}
      const itemId = String(session.itemId ?? ''), itemType = String(session.itemType ?? '')
      if (!session.studentId || !itemId || !validType(itemType)) return NextResponse.json({ error: 'بيانات الجلسة غير مكتملة' }, { status: 400 })
      const resolved = await resolveConfig(itemId, itemType)
      if (!resolved.config.enabled) return NextResponse.json({ sessionId: null, config: resolved.config, source: resolved.source, disabled: true })
      const existing = session.sessionId ? await db.select().from(antiCheatSessions).where(eq(antiCheatSessions.id, String(session.sessionId))).limit(1) : []
      if (existing[0]?.status === 'active') return NextResponse.json({ sessionId: existing[0].id, config: resolved.config, source: resolved.source, reused: true })
      const created = { id: id(), studentId: String(session.studentId), itemId, itemType, status: 'active', riskScore: 0, severity: 'NORMAL', currentQuestion: session.currentQuestion == null ? null : Number(session.currentQuestion), attemptId: session.attemptId ? String(session.attemptId) : null }
      await db.insert(antiCheatSessions).values(created)
      return NextResponse.json({ sessionId: created.id, config: resolved.config, source: resolved.source, reused: false })
    }
    if (action === 'event') {
      const event = body.event ?? {}
      if (!event.sessionId || !event.studentId || !event.itemId || !validType(event.itemType) || !event.eventType) return NextResponse.json({ error: 'بيانات الحدث غير مكتملة' }, { status: 400 })
      const sessionRows = await db.select().from(antiCheatSessions).where(eq(antiCheatSessions.id, String(event.sessionId))).limit(1)
      const session = sessionRows[0]
      if (!session || session.status !== 'active' || session.studentId !== String(event.studentId) || session.itemId !== String(event.itemId) || session.itemType !== String(event.itemType)) return NextResponse.json({ error: 'جلسة المراقبة غير صالحة' }, { status: 403 })
      const resolved = await resolveConfig(session.itemId, session.itemType)
      const rawSignals = Array.isArray(event.signals) ? event.signals.filter((signal: unknown) => signal && typeof signal === 'object').slice(0, 20) : []
      const signals: Array<{ type: string; active: boolean; durationMs: number; frequency: number }> = rawSignals.map((signal: Record<string, unknown>) => ({ type: String(signal.type || 'unknown').slice(0, 64), active: Boolean(signal.active), durationMs: clamp(signal.durationMs, 0, 86400000), frequency: clamp(signal.frequency, 0, 100) }))
      const riskScore = clamp(calculateRiskScore(signals, session.riskScore)), severity = severityFor(riskScore, resolved.config)
      const riskDelta = riskScore - session.riskScore
      const reason = String(event.reason || 'تم رصد إشارة قابلة للتفسير من مجموعة الفحوص').slice(0, 300)
      const metadata = event.metadata && typeof event.metadata === 'object' ? event.metadata : { signalCount: signals.filter((signal) => signal.active).length, signalTypes: signals.filter((signal) => signal.active).map((signal) => signal.type) }
      await db.insert(antiCheatEvents).values({ id: id(), sessionId: session.id, studentId: session.studentId, itemId: session.itemId, itemType: session.itemType, eventType: String(event.eventType).slice(0, 64), riskScore, riskDelta, severity, decision: severity, reason, durationMs: clamp(event.durationMs, 0, 86400000), metadata })
      await db.update(antiCheatSessions).set({ riskScore, severity, updatedAt: new Date() }).where(eq(antiCheatSessions.id, session.id))
      return NextResponse.json({ ok: true, riskScore, severity })
    }
    if (action === 'end' && body.session?.id) { await db.update(antiCheatSessions).set({ status: 'completed', endedAt: new Date(), updatedAt: new Date(), riskScore: clamp(body.session.riskScore), severity: String(body.session.severity || 'NORMAL') }).where(eq(antiCheatSessions.id, String(body.session.id))); return NextResponse.json({ ok: true }) }
    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 })
  } catch (error) { console.error('[v0] POST /api/anti-cheat failed:', error instanceof Error ? error.message : error); return NextResponse.json({ error: 'تعذر حفظ بيانات المراقبة', code: 'ANTI_CHEAT_WRITE_FAILED' }, { status: 500 }) }
}
