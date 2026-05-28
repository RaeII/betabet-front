import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import * as adminService from '@/services/admin.service'
import { ApiRequestError } from '@/services/api'

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
    let cancelled = false
    let attempt = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    async function checkAdmin(): Promise<void> {
      try {
        await adminService.getAdminStats()
        if (cancelled) return
        setIsAdminAuthenticated(true)
        setIsAdminLoading(false)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiRequestError && (err.status === 401 || err.status === 403)) {
          setIsAdminAuthenticated(false)
          setIsAdminLoading(false)
          return
        }
        attempt += 1
        const delay = Math.min(1000 * 2 ** Math.min(attempt - 1, 4), 16000)
        timer = setTimeout(checkAdmin, delay)
      }
    }

    checkAdmin()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
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
