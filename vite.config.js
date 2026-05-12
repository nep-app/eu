import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // O nome do teu repositório no GitHub. Altera se não for "eu"
  base: '/eu/', 
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Isto é o que diz ao telemóvel "Sou uma App!"
      manifest: {
        name: 'JEEP EDUCA+',
        short_name: 'JEEP',
        description: 'Aplicação de Gestão JEEP EDUCA+',
        theme_color: '#1e293b', // A cor do teu Soft Dark Mode
        background_color: '#1e293b',
        display: 'standalone', // Faz com que abra sem a barra de endereço do browser
        icons: [
          {
            src: 'logo.png',
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
  ]
})
