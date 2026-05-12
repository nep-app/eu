import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/eu/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'], // Garante que a imagem vai para cache offline
      manifest: {
        name: 'JEEP EDUCA+',
        short_name: 'JEEP',
        description: 'Aplicação de Gestão JEEP EDUCA+',
        theme_color: '#1e293b',
        background_color: '#1e293b',
        display: 'standalone',
        icons: [
          {
            // O segredo está aqui: Forçar a pasta /eu/ para o GitHub Pages não se perder
            src: '/eu/logo.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/eu/logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
