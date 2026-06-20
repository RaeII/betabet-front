import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { isPwaStandalone } from '@/hooks/usePwaInstall'
import {
  getCurrentPushSubscription,
  getWebPushKey,
  registerPushSubscription,
  removeCurrentPushSubscription,
} from '@/services/notification.service'

export type PushNotificationStatus =
  | 'checking'
  | 'unsupported'
  | 'unavailable'
  | 'default'
  | 'denied'
  | 'inactive'
  | 'active'
  | 'error'

function hasPushSupport(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    isPwaStandalone() &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

export function usePushNotifications() {
  const { isAuthenticated } = useAuth()
  const [status, setStatus] = useState<PushNotificationStatus>('checking')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !hasPushSupport()) {
      setStatus('unsupported')
      setError(null)
      return
    }

    const permission = Notification.permission
    if (permission === 'denied') {
      setStatus('denied')
      setError(null)
      return
    }
    if (permission === 'default') {
      setStatus('default')
      setError(null)
      return
    }

    try {
      const subscription = await getCurrentPushSubscription()
      setStatus(subscription ? 'active' : 'inactive')
      setError(null)
    } catch {
      setStatus('error')
      setError('Não foi possível verificar este aparelho.')
    }
  }, [isAuthenticated])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const enable = useCallback(async () => {
    if (!isAuthenticated || !hasPushSupport()) {
      setStatus('unsupported')
      return false
    }

    setBusy(true)
    setError(null)
    try {
      const key = await getWebPushKey()
      if (!key.enabled || !key.publicKey) {
        setStatus('unavailable')
        return false
      }

      const permission =
        Notification.permission === 'granted'
          ? 'granted'
          : await Notification.requestPermission()
      if (permission !== 'granted') {
        await refresh()
        return false
      }

      const registration = await navigator.serviceWorker.ready
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key.publicKey),
        }))

      await registerPushSubscription(subscription)
      setStatus('active')
      return true
    } catch {
      setStatus('error')
      setError('Não foi possível ativar as notificações.')
      return false
    } finally {
      setBusy(false)
    }
  }, [isAuthenticated, refresh])

  const disable = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      await removeCurrentPushSubscription()
      await refresh()
      return true
    } catch {
      setStatus('error')
      setError('Não foi possível desativar as notificações.')
      return false
    } finally {
      setBusy(false)
    }
  }, [refresh])

  const syncExisting = useCallback(async () => {
    if (!isAuthenticated || !hasPushSupport() || Notification.permission !== 'granted') return
    try {
      const key = await getWebPushKey()
      if (!key.enabled) {
        setStatus('unavailable')
        return
      }
      const subscription = await getCurrentPushSubscription()
      if (!subscription) {
        setStatus('inactive')
        return
      }
      await registerPushSubscription(subscription)
      setStatus('active')
      setError(null)
    } catch {
      setStatus('error')
    }
  }, [isAuthenticated])

  return {
    status,
    busy,
    error,
    isSupported: status !== 'unsupported',
    isActive: status === 'active',
    canEnable: status === 'default' || status === 'inactive' || status === 'error',
    enable,
    disable,
    refresh,
    syncExisting,
  }
}
