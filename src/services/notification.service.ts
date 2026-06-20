import { apiDelete, apiGet, apiPost } from './api'

export interface WebPushKeyResponse {
  enabled: boolean
  publicKey: string | null
}

export interface PushSubscriptionResponse {
  ok: true
  subscriptionId: string
}

interface SerializedPushSubscription {
  endpoint?: string
  expirationTime?: number | null
  keys?: {
    p256dh?: string
    auth?: string
  }
}

export function getWebPushKey(): Promise<WebPushKeyResponse> {
  return apiGet('/api/notifications/web-push-key')
}

export function registerPushSubscription(
  subscription: PushSubscription,
): Promise<PushSubscriptionResponse> {
  const json = subscription.toJSON() as SerializedPushSubscription
  return apiPost('/api/notifications/subscriptions', {
    endpoint: json.endpoint ?? subscription.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
  })
}

export function deletePushSubscription(endpoint: string): Promise<{ ok: true }> {
  return apiDelete('/api/notifications/subscriptions', { endpoint })
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

export async function removeCurrentPushSubscription(): Promise<void> {
  const subscription = await getCurrentPushSubscription()
  if (!subscription) return
  await deletePushSubscription(subscription.endpoint).catch(() => undefined)
  await subscription.unsubscribe().catch(() => undefined)
}
