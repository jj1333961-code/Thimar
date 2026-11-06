'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getAppLanguage, setAppLanguage, type Locale } from '@/lib/i18n'

export function LanguageToggle() {
  const [locale, setLocale] = useState<Locale>('ar')

  useEffect(() => {
    const sync = () => setLocale(getAppLanguage())
    sync()
    window.addEventListener('languagechange', sync)
    window.addEventListener('thimar:language-changed', sync)
    return () => {
      window.removeEventListener('languagechange', sync)
      window.removeEventListener('thimar:language-changed', sync)
    }
  }, [])

  const toggle = () => {
    const next: Locale = locale === 'ar' ? 'en' : 'ar'
    setAppLanguage(next)
    setLocale(next)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-card/90 text-foreground border-border hover:bg-muted shadow-sm backdrop-blur-md rounded-xl font-bold px-3 py-1.5 text-xs transition-all"
      aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      onClick={toggle}
    >
      {locale === 'ar' ? 'English' : 'العربية'}
    </Button>
  )
}
