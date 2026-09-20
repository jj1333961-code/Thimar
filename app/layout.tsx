import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ثمار | منصة القرآن والتعليم',
  description: 'منصة قرآنية هادئة للتسميع والاختبارات والمهام، تجمع الطالب والمعلم في مساحة للنمو والثبات.',
  openGraph: {
    title: 'ثمار | منصة القرآن والتعليم',
    description: 'منصة قرآنية هادئة للتسميع والاختبارات والمهام، تجمع الطالب والمعلم في مساحة للنمو والثبات.',
    locale: 'ar_SA',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#064e3b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-stone-50 text-stone-900 min-h-screen flex flex-col font-cairo">
        {children}
      </body>
    </html>
  );
}
