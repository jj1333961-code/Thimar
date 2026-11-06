'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const [locale, setLocale] = useState<'ar' | 'en'>('ar')
  useEffect(() => {
    const sync = () => setLocale(localStorage.getItem('lang') === 'en' ? 'en' : 'ar')
    sync()
    window.addEventListener('languagechange', sync)
    return () => window.removeEventListener('languagechange', sync)
  }, [])
  return <Button variant="outline" size="sm" aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'} onClick={() => { const next = locale === 'ar' ? 'en' : 'ar'; localStorage.setItem('lang', next); window.dispatchEvent(new Event('languagechange')); setLocale(next) }}>{locale === 'ar' ? 'EN' : 'ع'}</Button>
}
