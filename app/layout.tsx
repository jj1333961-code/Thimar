const Analytics = () => null
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageRuntime } from '@/components/language-runtime'
import { ThemeRuntime } from '@/components/theme-runtime'
import { LanguageToggle } from '@/components/language-toggle'
import { ConnectivityBanner } from '@/components/connectivity-banner'
import { QueryProvider } from '@/lib/query-provider'

export const metadata: Metadata = {
  metadataBase: new URL('https://teacher-three-ashen.vercel.app'),
  alternates: {
    canonical: '/',
  },
  title: 'ثمار | منصة القرآن والتعليم',
  description: 'منصة قرآنية هادئة للتسميع والاختبارات والمهام، تجمع الطالب والمعلم في مساحة للنمو والثبات.',
  openGraph: {
    title: 'ثمار | منصة القرآن والتعليم',
    description: 'منصة قرآنية هادئة للتسميع والاختبارات والمهام، تجمع الطالب والمعلم في مساحة للنمو والثبات.',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FDFBF7' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="bg-background text-foreground">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('thimar_theme') || localStorage.getItem('theme');
                  var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                  var lang = localStorage.getItem('thimar_lang') || localStorage.getItem('lang') || 'ar';
                  document.documentElement.lang = lang;
                  document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-150">
        <QueryProvider>
          <ConnectivityBanner />
          {children}
        </QueryProvider>
        <div className="fixed start-4 top-4 z-50">
          <LanguageToggle />
        </div>
        <LanguageRuntime />
        <ThemeRuntime />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
