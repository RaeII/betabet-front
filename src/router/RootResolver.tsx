import { Navigate, useLocation } from 'react-router-dom'
import { useLastAccessedGroup } from '@/hooks/useLastAccessedGroup'

export function RootResolver() {
  const { groupId, isReady, reason } = useLastAccessedGroup()
  const location = useLocation()

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--text-muted)]" />
    )
  }

  if (reason === 'none' || groupId === null) {
    return <Navigate to={`/onboarding${location.search}`} replace />
  }

  return <Navigate to={`/groups/${groupId}${location.search}`} replace />
}
