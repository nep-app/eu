import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Plugin: gera firebase-messaging-sw.js com a config injetada em build time
  const firebaseSwPlugin = {
    name: 'firebase-messaging-sw',
    apply: 'build',
    generateBundle() {
      const cfg = JSON.stringify({
        apiKey:            env.VITE_FIREBASE_API_KEY            || "",
        authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN        || "",
        projectId:         env.VITE_FIREBASE_PROJECT_ID         || "",
        storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET     || "",
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
        appId:             env.VITE_FIREBASE_APP_ID             || "",
      });
      this.emitFile({
        type: 'asset',
        fileName: 'firebase-messaging-sw.js',
        source: `
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp(${cfg});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || 'JEEP EDUCA+', {
    body:  n.body  || '',
    icon:  n.icon  || '/eu/logo.png',
    badge: n.badge || '/eu/logo.png',
    tag:   'jeep-push',
    renotify: true,
  });
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('https://nep-app.github.io/eu/'));
});
`,
      });
    },
  };

  return {
    base: '/eu/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
        },
        includeAssets: ['logo.png'],
        manifest: {
          name: 'JEEP EDUCA+',
          short_name: 'JEEP',
          description: 'Aplicação de Gestão JEEP EDUCA+',
          theme_color: '#0d1526',
          background_color: '#0d1526',
          start_url: '/eu/',
          scope: '/eu/',
          display: 'standalone',
          icons: [
            { src: 'logo.png', sizes: '192x192', type: 'image/png' },
            { src: 'logo.png', sizes: '512x512', type: 'image/png' },
          ],
        },
      }),
      firebaseSwPlugin,
    ],
  };
});
