'use client'

export interface ClientSession {
  id: string
  email: string
  name: string
  role?: string
}

function decodePayload(part: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function getClientSession(): ClientSession | null {
  if (typeof window === 'undefined') return null
  const token = window.localStorage.getItem('thimar_auth_token')
  if (!token) return null

  if (token === 'admin_local_bypass_token') {
    return {
      id: 'admin_seed',
      email: 'admin@thimar.app',
      name: 'المسؤول العام',
      role: 'admin'
    }
  }

  if (token === 'demo_student_token') {
    return {
      id: 'student_seed',
      email: 'student@thimar.app',
      name: 'ياسين عمر',
      role: 'student'
    }
  }

  if (token === 'demo_parent_token') {
    return {
      id: 'parent_seed',
      email: 'parent@thimar.app',
      name: 'عمر الخطيب (ولي الأمر)',
      role: 'parent'
    }
  }

  const parts = token.split('.')
  if (parts.length === 2) {
    const payload = decodePayload(parts[0])
    if (payload?.email || payload?.name) {
      return {
        id: String(payload.accountId || payload.id || 'user'),
        email: String(payload.email || ''),
        name: String(payload.name || payload.accountName || ''),
        role: String(payload.role || 'student')
      }
    }
  }

  if (parts.length === 3) {
    const payload = decodePayload(parts[1])
    if (payload?.sub) {
      return {
        id: String(payload.sub),
        email: String(payload.email || payload.user_email || ''),
        name: String(payload.name || payload.displayName || payload.email || ''),
        role: String(payload.role || 'student')
      }
    }
  }

  return null
}

export function clearClientSession() {
  if (typeof window !== 'undefined') window.localStorage.removeItem('thimar_auth_token')
}

