import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.thimar.app',
  appName: 'ثمار',
  webDir: 'public',
  // Bundle the public shell so the native app can launch without internet.
  // API requests are routed to the hosted deployment by offline-runtime.js when online.

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
