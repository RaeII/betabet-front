import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function PushNotificationHost() {
  const { isAuthenticated, isLoading } = useAuth()
  const { syncExisting } = usePushNotifications()

  useEffect(() => {
    if (!isAuthenticated || isLoading) return
    void syncExisting()
  }, [isAuthenticated, isLoading, syncExisting])

  return null
}
