import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || 'JEEP EDUCA+', {
    body:  n.body  || '',
    icon:  '/eu/logo.png',
    badge: '/eu/logo.png',
    tag:   'jeep-push',
    renotify: true,
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('/eu/'));
});
