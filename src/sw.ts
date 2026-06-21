/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Parameters<typeof precacheAndRoute>[0]
}

interface PushPayload {
  type?: string
  title?: string
  body?: string
  tag?: string
  url?: string
  data?: Record<string, string>
}

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)
clientsClaim()

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// SSE (text/event-stream) NÃO pode passar pelo service worker: a interceptação
// do Workbox bufferiza/aborta o stream, fazendo a mensagem chegar só na próxima
// e travando reconexões (Workbox #2692, W3C ServiceWorker #885). Deixamos esse
// request escapar do SW (matcher retorna false) para ir direto à rede.
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/') &&
    !request.headers.get('accept')?.includes('text/event-stream'),
  new NetworkOnly(),
)

// Emoji PNGs (emoji-picker-react Apple set + custom Noto) are immutable and
// keyed by codepoint / pinned commit. The picker lazy-loads hundreds of them,
// so they must NOT share the small generic image cache — its 120-entry cap
// would thrash and evict on scroll, and any errored <img> is permanently
// dropped from the grid. Cache-first with a large, long-lived cache.
registerRoute(
  ({ url, request }) =>
    request.destination === 'image' && url.origin === 'https://cdn.jsdelivr.net',
  new CacheFirst({
    cacheName: 'emoji-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 4000,
        maxAgeSeconds: 60 * 60 * 24 * 365,
        purgeOnQuotaError: true,
      }),
    ],
  }),
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'img-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 250,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
)

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  }),
)

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api\//, /^\/admin\//],
  }),
)

async function hasVisibleWindowClient(): Promise<boolean> {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  })
  return clients.some(client => client.visibilityState === 'visible')
}

function parsePushPayload(event: PushEvent): PushPayload | null {
  if (!event.data) return null
  try {
    return event.data.json() as PushPayload
  } catch {
    return null
  }
}

self.addEventListener('push', event => {
  event.waitUntil((async () => {
    const payload = parsePushPayload(event)
    if (!payload || await hasVisibleWindowClient()) return

    await self.registration.showNotification(payload.title ?? 'Bolão CLT', {
      body: payload.body ?? 'Você tem uma nova notificação.',
      tag: payload.tag,
      renotify: false,
      icon: '/icons/pwa-192.png',
      badge: '/icons/pwa-192.png',
      data: {
        url: payload.url ?? '/',
        ...(payload.data ?? {}),
      },
    })
  })())
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil((async () => {
    const rawUrl = (event.notification.data as { url?: string } | undefined)?.url ?? '/'
    const targetUrl = new URL(rawUrl, self.location.origin).href
    const windows = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })

    for (const client of windows) {
      if (new URL(client.url).origin !== self.location.origin) continue
      await client.focus()
      return client.navigate(targetUrl)
    }

    return self.clients.openWindow(targetUrl)
  })())
})
