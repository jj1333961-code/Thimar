import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'
import { adminAuth, adminDb, isFirestoreEnabled, setFirestoreEnabled } from './firebase-admin'
import { getSessionSecret } from './auth/session-secret'

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  const cookies = cookieHeader.split(';')
  for (const c of cookies) {
    const trimmed = c.trim()
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1))
    }
  }
  return null
}

function verifyHmacSession(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [payloadB64, signature] = parts
    const key = getSessionSecret()
    const expectedSig = createHmac('sha256', key).update(payloadB64).digest('base64url')
    if (signature !== expectedSig) return null
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8')
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

export async function requireUser(request: Request) {
  const authHeader = request.headers.get("authorization")
  let token: string | null = null

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split("Bearer ")[1]?.trim() || null
  }

  if (!token) {
    token = getCookie(request, 'teacher_google_session')
  }

  if (!token || token === 'undefined' || token === 'null') {
    return { response: NextResponse.json({ error: 'المصادقة مطلوبة' }, { status: 401 }), user: null }
  }

  // Fast-path for local demo/admin bypass tokens
  if (token === 'admin_local_bypass_token') {
    return {
      response: null,
      user: {
        id: 'admin_seed',
        email: 'admin@thimar.app',
        name: 'المسؤول العام',
        role: 'admin',
        accountId: 'admin_seed',
        accountName: '12340',
      }
    }
  }

  if (token === 'demo_student_token') {
    return {
      response: null,
      user: {
        id: 'student_seed',
        email: 'student@thimar.app',
        name: 'ياسين عمر',
        role: 'student',
        accountId: 'student_seed',
        accountName: 'ياسين عمر',
      }
    }
  }

  if (token === 'demo_parent_token') {
    return {
      response: null,
      user: {
        id: 'parent_seed',
        email: 'parent@thimar.app',
        name: 'عمر الخطيب (ولي الأمر)',
        role: 'parent',
        accountId: 'parent_seed',
        accountName: 'عمر الخطيب',
      }
    }
  }

  // Check HMAC signed session
  const hmacData = verifyHmacSession(token)
  if (hmacData?.email) {
    return {
      response: null,
      user: {
        id: hmacData.accountId || hmacData.id || 'user_session',
        email: hmacData.email,
        name: hmacData.name || '',
        role: hmacData.role || 'student',
        accountId: hmacData.accountId || 'user_session',
        accountName: hmacData.accountName || hmacData.name || '',
      }
    }
  }

  // Firebase ID token verification (must be 3 parts)
  if (token.split('.').length === 3) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token)
      
      let userData: any = {}
      if (isFirestoreEnabled) {
        try {
          const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
          userData = userDoc.exists ? userDoc.data() : {}
        } catch (dbError: any) {
          if (dbError.message?.includes('PERMISSION_DENIED')) {
            console.warn('[Auth] Firestore API not enabled or access denied. Skipping profile fetch.')
            setFirestoreEnabled(false)
          }
        }
      }
      
      return { 
        response: null, 
        user: { 
          id: decodedToken.uid, 
          email: decodedToken.email,
          name: userData?.name || decodedToken.name || '',
          role: userData?.role || 'student',
          accountId: decodedToken.uid, 
          accountName: userData?.name || decodedToken.name || '',
        } 
      }
    } catch (error: any) {
      if (error.code === 'auth/id-token-expired') {
        console.warn("[Auth] Token expired")
      } else if (error.code === 'auth/argument-error') {
        console.warn("[Auth] Invalid token argument")
      } else {
        console.error("[Auth] Error verifying ID token:", error.message || error)
      }
    }
  }

  return { response: NextResponse.json({ error: 'جلسة المصادقة غير صالحة' }, { status: 401 }), user: null }
}

export const verifyAuth = requireUser;

export async function requireAdmin(request: Request) {
  const result = await requireUser(request)
  if (result.response) return result
  const configured = (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  const role = String(result.user?.role || '').toLowerCase()
  if (role === 'admin' || role === 'superadmin') {
    return result
  }
  if (configured.includes(String(result.user?.email || '').toLowerCase())) {
    return result
  }
  return { response: NextResponse.json({ error: 'لا تملك صلاحية المسؤول' }, { status: 403 }), user: null }
}


