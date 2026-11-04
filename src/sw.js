import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches(); // remove caches de versões antigas (evita ficar preso numa versão velha)
precacheAndRoute(self.__WB_MANIFEST);

// Jogos (Arcade): NÃO ficam no precache (ver globIgnores no vite.config). Aqui
// usamos NetworkFirst — quando há internet vai sempre buscar a versão mais
// recente; a cópia em cache é só reserva para funcionar offline. Assim, as
// alterações aos jogos aparecem logo, sem ficarem presas numa versão antiga.
registerRoute(
  ({ url }) => url.pathname.includes('/jogos/'),
  new NetworkFirst({ cacheName: 'jogos', networkTimeoutSeconds: 5 })
);

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

// A Cloud Function manda mensagens "data-only" (sem campo "notification")
// de propósito — se tivesse "notification", o browser mostrava uma
// notificação sozinho E este código mostrava outra, duplicando o aviso.
messaging.onBackgroundMessage(payload => {
  const d = payload.data || {};
  // Cada aviso tem a SUA etiqueta: com uma etiqueta fixa para todos, um aviso
  // novo substituía o anterior e perdia-se o que ainda não tinha sido visto.
  const etiqueta = 'jeep-' + (d.tag || Date.now() + '-' + Math.random().toString(36).slice(2, 8));
  self.registration.showNotification(d.title || 'JEEP EDUCA+', {
    body:  d.body  || '',
    icon:  d.icon  || '/eu/logo.png',
    badge: d.badge || '/eu/logo.png',
    tag:   etiqueta,
    renotify: true,
    data:  { link: d.link || '/eu/' },
  });
});

// Tocar no aviso: se a app já estiver aberta, salta para esse separador em vez
// de abrir mais um; só abre janela nova se não houver nenhuma.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const destino = (e.notification.data && e.notification.data.link) || '/eu/';
  e.waitUntil((async () => {
    const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const j of janelas) {
      if (j.url.includes('/eu/')) {
        if ('focus' in j) { await j.focus(); }
        if ('navigate' in j && destino !== j.url) { try { await j.navigate(destino); } catch (_) {} }
        return;
      }
    }
    await self.clients.openWindow(destino);
  })());
});
