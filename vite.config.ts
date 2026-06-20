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
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
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
        injectManifest: {
          // Precache do app shell (build hashado): JS, CSS, HTML, ícones, manifest.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
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
