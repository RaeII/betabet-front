import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: null, // registramos manualmente via React (PwaUpdatePrompt)
        includeAssets: ['favicon-64.png', 'bolao_clt_fav.png', 'icons/apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Bolão CLT — Bolão da Copa 2026',
          short_name: 'Bolão CLT',
          description:
            'Palpites da Copa do Mundo 2026 com grupos, pontuação e ranking entre amigos.',
          lang: 'pt-BR',
          dir: 'ltr',
          start_url: '/?source=pwa',
          scope: '/',
          display: 'standalone',
          display_override: ['standalone', 'minimal-ui'],
          orientation: 'portrait',
          background_color: '#123D2A',
          theme_color: '#123D2A',
          categories: ['sports', 'games', 'social'],
          icons: [
            { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            {
              src: '/icons/pwa-maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icons/pwa-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Precache do app shell (build hashado): JS, CSS, HTML, ícones, manifest.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
          // SPA fallback: navegação offline cai no index.html...
          navigateFallback: '/index.html',
          // ...exceto /api e /admin (área sensível e dados que exigem rede).
          navigateFallbackDenylist: [/^\/api\//, /^\/admin\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false, // par com registerType:'prompt' (update controlado)
          runtimeCaching: [
            // API: NUNCA cachear (sessão por cookie httpOnly + dados ao vivo).
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
              handler: 'NetworkOnly',
            },
            // Imagens (escudos/bandeiras/fotos): serve do cache e revalida em background.
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'img-cache',
                expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            // Google Fonts (se utilizadas): arquivos estáveis e versionados.
            {
              urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // SW desligado em dev para não atrapalhar o HMR
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true, // escuta em 0.0.0.0 — permite acesso externo (rede local / IP público)
      proxy: {
        '/api': {
          target: env.VITE_API_URL ?? 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
