/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        // الجذر يعرض شاشة ترحيب خفيفة ومستقلة؛ التطبيق الكامل يُحمّل فقط بعد انتهاء التلاوة.
        { source: '/', destination: '/index.html' },
      ],
    }
  },
}

export default nextConfig
