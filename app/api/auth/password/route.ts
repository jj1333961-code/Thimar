import { createHmac } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { appSnapshotsDb } from "@/lib/supabase/database"
import { getSessionSecret } from "@/lib/auth/session-secret"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const COOKIE = "teacher_google_session"
const SNAPSHOT_ID = "teacher-platform-v1"
const MAX_AGE = 60 * 60 * 24 * 7

type Snapshot = {
  admins?: Array<Record<string, unknown>>
  students?: Array<Record<string, unknown>>
}

const DEFAULT_ADMIN = {
  id: "admin_seed",
  name: "المسؤول التجريبي",
  mobile: "01000000000",
  password: "1234",
  role: "admin",
  isMain: true,
}

function secret() {
  return getSessionSecret()
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("base64url")
}

function makeSession(email: string, name: string, key: string, role: string, accountId: string, accountName: string) {
  const payload = Buffer.from(JSON.stringify({ email, name, role, accountId, accountName, issuedAt: Date.now() })).toString("base64url")
  return `${payload}.${sign(payload, key)}`
}

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

function phone(value: unknown) {
  return String(value || "").replace(/\D/g, "")
}

function prepareAdmins(data: Snapshot): Array<Record<string, unknown>> {
  const admins = Array.isArray(data.admins) ? data.admins : []
  if (!admins.length) {
    data.admins = [DEFAULT_ADMIN]
    return data.admins
  }
  if (admins.length === 1 && phone(admins[0].mobile) === "00000000000" && String(admins[0].password || "") === "1234") {
    data.admins = [{ ...admins[0], mobile: DEFAULT_ADMIN.mobile, name: admins[0].name || DEFAULT_ADMIN.name, role: "admin", isMain: true }]
  }
  return data.admins || []
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

    const snapshot = await appSnapshotsDb.get(SNAPSHOT_ID)
    const data = (snapshot?.data && typeof snapshot.data === "object" ? snapshot.data : {}) as Snapshot
    const hadAdmins = Array.isArray(data.admins) && data.admins.length > 0
    const admins = prepareAdmins(data)
    if (!hadAdmins || admins.some((item) => phone(item.mobile) === phone(DEFAULT_ADMIN.mobile) && String(item.password || "") === DEFAULT_ADMIN.password)) {
      await appSnapshotsDb.upsert(SNAPSHOT_ID, data)
    }
    const students = Array.isArray(data.students) ? data.students : []
    const admin = admins.find((item) => phone(item.mobile) === phone(username) && String(item.password || "") === password)
    const student = students.find((item) => normalize(item.username) === normalize(username) && String(item.studentPass || "") === password)
    const parent = students.find((item) => (normalize(item.parent) === normalize(username) || phone(item.parentPhone) === phone(username) || phone(item.phone) === phone(username)) && String(item.parentPass || "") === password)
    const matched = admin || student || parent
    if (!matched) return response({ error: "اسم المستخدم أو الرقم السري غير صحيح" }, 401)

    const role = admin ? "admin" : parent ? "parent" : "student"
    const email = normalize(matched.email || matched.googleEmail || matched.parentEmail || matched.parentGoogleEmail || matched.parent || matched.username || matched.mobile)
    if (!email) return response({ error: "الحساب لا يملك معرفاً صالحاً" }, 422)
    const name = String(matched.name || matched.parent || matched.username || matched.mobile || "")
    const accountId = String(matched.id || "")
    const accountName = role === "parent" ? String(matched.parent || username) : String(matched.username || matched.mobile || "")
    const result = response({ authenticated: true, role, accountId, accountName })
    result.cookies.set(COOKIE, makeSession(email, name, key, role, accountId, accountName), { httpOnly: true, secure: request.nextUrl.protocol === "https:" || process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE })
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
