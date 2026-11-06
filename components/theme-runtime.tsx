'use client'

import { useEffect } from 'react'

export type AppTheme = 'light' | 'dark' | 'system'

export function getAppTheme(): AppTheme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem('thimar_theme') || localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

export function setAppTheme(theme: AppTheme): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('thimar_theme', theme)
  localStorage.setItem('theme', theme)
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent('thimar:theme-changed', { detail: { theme } }))
}

function applyTheme(theme: AppTheme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else if (theme === 'light') {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  } else {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }
}

export function ThemeRuntime() {
  useEffect(() => {
    const currentTheme = getAppTheme()
    applyTheme(currentTheme)

    const handleThemeChange = (e: any) => {
      const theme = e.detail?.theme || getAppTheme()
      applyTheme(theme)
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = () => {
      if (getAppTheme() === 'system') {
        applyTheme('system')
      }
    }

    window.addEventListener('thimar:theme-changed', handleThemeChange)
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      window.removeEventListener('thimar:theme-changed', handleThemeChange)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  return null
}
