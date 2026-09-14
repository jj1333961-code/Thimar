import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.thimar.app',
  appName: 'ثمار',
  webDir: 'public',
  android: {
    allowMixedContent: true,
    backgroundColor: '#1f5845',
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
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
