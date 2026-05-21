import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import * as adminService from '@/services/admin.service'

interface AdminAuthContextValue {
  isAdminAuthenticated: boolean
  isAdminLoading: boolean
  adminLogin: (email: string, password: string) => Promise<void>
  adminLogout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isAdminLoading, setIsAdminLoading] = useState(true)

  useEffect(() => {
    // Probe the admin session by hitting a protected endpoint.
    // No dedicated /admin/auth/me exists, so stats serves as the check.
    adminService
      .getAdminStats()
      .then(() => setIsAdminAuthenticated(true))
      .catch(() => setIsAdminAuthenticated(false))
      .finally(() => setIsAdminLoading(false))
  }, [])

  async function adminLogin(email: string, password: string) {
    await adminService.adminLogin(email, password)
    setIsAdminAuthenticated(true)
  }

  async function adminLogout() {
    await adminService.adminLogout()
    setIsAdminAuthenticated(false)
  }

  return (
    <AdminAuthContext.Provider
      value={{ isAdminAuthenticated, isAdminLoading, adminLogin, adminLogout }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuthContext(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuthContext must be used inside AdminAuthProvider')
  return ctx
}
