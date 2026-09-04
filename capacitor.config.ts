import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.thimar.app',
  appName: 'ثمار',
  webDir: 'public',
  // The hosted shell keeps the existing same-origin API, auth cookies, and routes working in native builds.
  // Set CAPACITOR_SERVER_URL to a staging URL when testing a different deployment.
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://thimar-1jsvz90zj-to-30b1.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#1f5845',
    },
    Keyboard: {
      resize: 'body',
    },
  },
}

export default config
