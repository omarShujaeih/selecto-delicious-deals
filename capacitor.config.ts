import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.selecto.app',
  appName: 'Selecto',
  webDir: 'dist/client',
  // Uncomment and change this to your production or staging URL
  // because TanStack Start uses SSR. For local dev with android emulator,
  // you can use 'http://10.0.2.2:8080'
  /*
  server: {
    url: 'https://your-production-url.com',
    cleartext: true
  }
  */
};

export default config;
