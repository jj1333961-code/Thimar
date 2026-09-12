import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'ثمار | منصة القرآن والتعليم',
    short_name: 'ثمار',
    description: 'منصة قرآنية هادئة للتسميع والاختبارات والمهام والنمو العلمي.',
    start_url: '/login',
    scope: '/',
    display: 'standalone',
    background_color: '#13271f',
    theme_color: '#1f5845',
    icons: [
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      }
    ]
  }
}
