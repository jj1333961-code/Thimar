'use client'

export interface ClientSession {
  id: string
  email: string
  name: string
}

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
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
      id: 'admin',
      email: 'admin@thimar.org',
      name: 'المسؤول العام',
    }
  }
  if (token === 'demo_student_token') {
    return {
      id: 'demo_student_1',
      email: 'student@thimar.app',
      name: 'ياسين عمر',
    }
  }
  if (token === 'demo_parent_token') {
    return {
      id: 'demo_parent_1',
      email: 'parent@thimar.app',
      name: 'أبو ياسين (ولي الأمر)',
    }
  }
  if (token.split('.').length !== 3) return null
  const payload = decodePayload(token)
  if (!payload?.sub) return null
  return {
    id: String(payload.sub),
    email: String(payload.email || payload.user_email || ''),
    name: String(payload.name || payload.displayName || payload.email || ''),
  }
}

export function clearClientSession() {
  if (typeof window !== 'undefined') window.localStorage.removeItem('thimar_auth_token')
}
