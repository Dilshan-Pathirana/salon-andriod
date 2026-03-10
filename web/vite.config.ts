import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Salon Ru Zero One',
        short_name: 'Salon R01',
        description: 'Book your appointment at Salon Ru Zero One',
        theme_color: '#0D9488',
        background_color: '#F0FDFA',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/services') || url.pathname.startsWith('/api/gallery'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-public-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
            },
          },
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
});
