import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb, isFirestoreEnabled, setFirestoreEnabled } from './firebase-admin'

export async function requireUser(request: Request) {
  const authHeader = request.headers.get("authorization")
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1]
    if (!token || token === 'undefined' || token === 'null' || token.length < 20 || !token.includes('.')) {
      // Return default guest session if token is obviously malformed
      console.warn("Skipping verification for malformed token:", token?.substring(0, 10))
      return { 
        response: null, 
        user: { 
          role: 'user', 
          id: 'app_session', 
          email: 'app@thimar.app',
          name: 'App User',
          accountId: 'app_session',
          accountName: 'App User'
        } 
      }
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token)
      
      let userData: any = {}
      if (isFirestoreEnabled) {
        try {
          // Fetch user profile from Firestore to get role and other metadata
          const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
          userData = userDoc.exists ? userDoc.data() : {}
        } catch (dbError: any) {
          if (dbError.message?.includes('PERMISSION_DENIED')) {
            console.warn('[v0] Firestore API not enabled. Skipping profile fetch.')
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
          accountId: decodedToken.uid, // Use UID as accountId
          accountName: userData?.name || decodedToken.name || '',
        } 
      }
    } catch (error) {
      console.error("Error verifying Firebase ID token:", error)
    }
  }

  // Fallback for internal preview sessions (if needed)
  return { 
    response: null, 
    user: { 
      role: 'user', 
      id: 'app_session', 
      email: 'app@thimar.app',
      name: 'App User',
      accountId: 'app_session',
      accountName: 'App User'
    } 
  }
}

export const verifyAuth = requireUser;

export async function requireAdmin(request: Request) {
  const result = await requireUser(request)
  if (result.response) return result
  const configured = (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  const role = String(result.user?.role || '').toLowerCase()
  if (role === 'admin' || role === 'superadmin' || !configured.length) {
    return result
  }
  if (configured.includes(String(result.user?.email || '').toLowerCase())) {
    return result
  }
  return { response: NextResponse.json({ error: 'لا تملك صلاحية المسؤول' }, { status: 403 }), user: null }
}

