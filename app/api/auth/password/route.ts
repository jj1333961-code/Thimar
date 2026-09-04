import { createHmac } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { appSnapshots } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const COOKIE = "teacher_google_session"
const SNAPSHOT_ID = "teacher-platform-v1"
const MAX_AGE = 60 * 60 * 24 * 7

type Snapshot = {
  admins?: Array<Record<string, unknown>>
  students?: Array<Record<string, unknown>>
}

function secret() {
  return process.env.GOOGLE_CLIENT_SECRET?.trim() || process.env.DATABASE_URL?.trim() || ""
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("base64url")
}

function makeSession(email: string, name: string, key: string) {
  const payload = Buffer.from(JSON.stringify({ email, name, issuedAt: Date.now() })).toString("base64url")
  return `${payload}.${sign(payload, key)}`
}

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

function phone(value: unknown) {
  return String(value || "").replace(/\D/g, "")
}

function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } })
}

export async function POST(request: NextRequest) {
  try {
    const key = secret()
    if (!key) return response({ error: "إعدادات تسجيل الدخول غير مكتملة" }, 503)
    const body = await request.json()
    const username = String(body?.username || "").trim()
    const password = String(body?.password || "").trim()
    if (!username || !password) return response({ error: "بيانات الدخول غير مكتملة" }, 400)

    const rows = await db.select({ data: appSnapshots.data }).from(appSnapshots).where(eq(appSnapshots.id, SNAPSHOT_ID)).limit(1)
    const snapshot = (rows[0]?.data && typeof rows[0].data === "object" ? rows[0].data : {}) as Snapshot
    const admins = Array.isArray(snapshot.admins) ? snapshot.admins : []
    const students = Array.isArray(snapshot.students) ? snapshot.students : []
    const admin = admins.find((item) => phone(item.mobile) === phone(username) && String(item.password || "") === password)
    const student = students.find((item) => normalize(item.username) === normalize(username) && String(item.studentPass || "") === password)
    const parent = students.find((item) => (normalize(item.parent) === normalize(username) || phone(item.parentPhone) === phone(username) || phone(item.phone) === phone(username)) && String(item.parentPass || "") === password)
    const matched = admin || student || parent
    if (!matched) return response({ error: "اسم المستخدم أو الرقم السري غير صحيح" }, 401)

    const email = normalize(matched.email || matched.googleEmail || matched.parentEmail || matched.parentGoogleEmail || matched.parent || matched.username || matched.mobile)
    if (!email) return response({ error: "الحساب لا يملك معرفاً صالحاً" }, 422)
    const name = String(matched.name || matched.parent || matched.username || matched.mobile || "")
    const result = response({ authenticated: true, role: admin ? "admin" : parent ? "parent" : "student" })
    result.cookies.set(COOKIE, makeSession(email, name, key), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: MAX_AGE })
    return result
  } catch (error) {
    console.error("[v0] POST /api/auth/password failed", error)
    return response({ error: "تعذر الاتصال بقاعدة البيانات" }, 503)
  }
}

export async function DELETE() {
  const result = response({ signedOut: true })
  result.cookies.delete(COOKIE)
  return result
}
