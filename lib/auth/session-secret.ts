const LOCAL_SESSION_SECRET = 'thimar-local-session-secret-v1-change-this-in-production'

export function getSessionSecret() {
  return process.env.THIMAR_SESSION_SECRET?.trim()
    || process.env.GOOGLE_CLIENT_SECRET?.trim()
    || process.env.DATABASE_URL?.trim()
    || LOCAL_SESSION_SECRET
}
