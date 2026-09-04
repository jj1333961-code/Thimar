'use client'

import { useEffect } from 'react'
import { translate, type Locale } from '@/lib/i18n'

const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'aria-description', 'alt', 'value'] as const
const PROTECTED_SELECTOR = 'script,style,noscript,code,pre,[data-no-translate],.quran-text,.ayah,.hadith,.dhikr,.thimar-ayah-frame,.thimar-ayah-ref,.thimar-footer .ayah,.thimar-footer .ref,.thimar-footer-sidq'

export function LanguageRuntime() {
  useEffect(() => {
    const readLocale = (): Locale => (localStorage.getItem('lang') === 'en' ? 'en' : 'ar')
    let locale = readLocale()
    const originals = new WeakMap<Text, string>()
    let applying = false
    let frame = 0

    const isProtected = (node: Node) => {
      const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
      return !element || element.closest(PROTECTED_SELECTOR) !== null
    }

    const apply = (root: ParentNode = document.body, full = false) => {
      if (applying) return
      applying = true
      document.documentElement.lang = locale
      document.documentElement.dir = locale === 'en' ? 'ltr' : 'rtl'

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let node: Node | null
      while ((node = walker.nextNode())) {
        const text = node as Text
        if (!text.nodeValue?.trim() || isProtected(text)) continue
        if (!originals.has(text)) originals.set(text, text.nodeValue)
        text.nodeValue = translate(originals.get(text) ?? text.nodeValue, locale)
      }

      const elements = full
        ? Array.from(document.querySelectorAll<HTMLElement>('*'))
        : root instanceof Element
          ? [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
          : []
      elements.forEach((element) => {
        if (isProtected(element)) return
        TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
          if (attribute === 'value' && !['button', 'submit', 'reset'].includes(element.getAttribute('type') ?? '')) return
          const originalAttribute = `data-i18n-original-${attribute}`
          if (!element.hasAttribute(originalAttribute) && element.hasAttribute(attribute)) {
            element.setAttribute(originalAttribute, element.getAttribute(attribute) ?? '')
          }
          if (element.hasAttribute(originalAttribute)) {
            element.setAttribute(attribute, translate(element.getAttribute(originalAttribute) ?? '', locale))
          }
        })
      })

      applying = false
    }

    const schedule = (root: ParentNode = document.body, full = false) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => apply(root, full))
    }

    const syncLanguage = () => {
      locale = readLocale()
      schedule(document.body, true)
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        Array.from(mutation.addedNodes).forEach((added) => {
          if (added instanceof Element || added instanceof Text) schedule(added.parentElement ?? document.body)
        })
      })
    })

    window.addEventListener('languagechange', syncLanguage)
    observer.observe(document.body, { childList: true, subtree: true })
    schedule(document.body, true)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('languagechange', syncLanguage)
    }
  }, [])

  return null
}
