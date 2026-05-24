import { Navigate } from 'react-router-dom'
import { useLastAccessedGroup } from '@/hooks/useLastAccessedGroup'

export function RootResolver() {
  const { groupId, isReady, reason } = useLastAccessedGroup()

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--text-muted)]" />
    )
  }

  if (reason === 'none' || groupId === null) {
    return <Navigate to="/onboarding" replace />
  }

  return <Navigate to={`/groups/${groupId}`} replace />
}
