import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export function AdminGuard() {
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth()

  if (isAdminLoading) return null

  return isAdminAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />
}
