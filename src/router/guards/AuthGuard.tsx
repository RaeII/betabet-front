import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { JoinRequestStatusHost } from '@/components/group/JoinRequestStatusHost'
import { PendingJoinHost } from '@/components/group/PendingJoinHost'
import { ReferralApplyHost } from '@/components/referral/ReferralApplyHost'
import { useAuth } from '@/hooks/useAuth'

export function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null

  if (!isAuthenticated) return <Navigate to={`/auth/login${location.search}`} replace />

  return (
    <>
      <Outlet />
      <PendingJoinHost />
      <JoinRequestStatusHost />
      <ReferralApplyHost />
    </>
  )
}
