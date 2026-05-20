import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AdminGuard() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  return user?.isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
