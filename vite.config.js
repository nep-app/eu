import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/eu/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // Força o telemóvel a reconhecer o PWA
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
          {
            src: 'logo.png', // Sem o /eu/ extra! O Vite trata disso sozinho.
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
