import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserGroups } from '@/hooks/useGroups'

export function OnboardingGuard() {
  const { data, isLoading } = useUserGroups()
  const { pathname } = useLocation()

  if (isLoading) return null

  const hasGroups = (data?.groups?.length ?? 0) > 0
  const isOnboarding = pathname.startsWith('/onboarding')

  if (!hasGroups && !isOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
