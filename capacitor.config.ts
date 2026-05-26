import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ps.selecto.app',
  appName: 'Selecto',
  webDir: 'dist/client',
  // Point to local Vite dev server for Android Emulator testing
  // because this is an SSR app without a static index.html
  server: {
    url: 'http://10.0.2.2:5173',
    cleartext: true
  }
};

export default config;
