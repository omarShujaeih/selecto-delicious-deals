import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ps.selecto.app',
  appName: 'Selecto',
  webDir: 'dist/client',
  
  // ---------------------------------------------------------
  // CAPACITOR SSR CONFIGURATION
  // ---------------------------------------------------------
  // Because Selecto uses TanStack Start (SSR + Server Functions), 
  // the Android app acts as a shell that loads a hosted URL.
  // 
  // IMPORTANT: Choose ONE of the server configurations below 
  // and comment out the others.
  
  server: {
    // 1. FOR EMULATOR DEVELOPMENT:
    // url: 'http://10.0.2.2:5173',
    // cleartext: true
    
    // 2. FOR PHYSICAL DEVICE DEVELOPMENT (on same Wi-Fi):
    // Replace with your local machine's IPv4 address
    // url: 'http://192.168.1.xxx:5173',
    // cleartext: true

    // 3. FOR STAGING APK (Shareable with testers):
    // Replace with your actual Cloudflare Pages / Staging URL
    url: 'https://YOUR_STAGING_DOMAIN_HERE.com',
    cleartext: false

    // 4. FOR PRODUCTION PLAY STORE RELEASE:
    // url: 'https://selecto.app',
    // cleartext: false
  }
};

export default config;
