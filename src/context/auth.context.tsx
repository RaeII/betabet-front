import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, LoginCredentials, RegisterData } from '@/types/auth.types'
import * as authService from '@/services/auth.service'
import { ApiRequestError } from '@/services/api'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let attempt = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    async function checkAuth(): Promise<void> {
      try {
        const { user } = await authService.getMe()
        if (cancelled) return
        setUser(user)
        setIsLoading(false)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiRequestError && err.status === 401) {
          setUser(null)
          setIsLoading(false)
          return
        }
        attempt += 1
        const delay = Math.min(1000 * 2 ** Math.min(attempt - 1, 4), 16000)
        timer = setTimeout(checkAuth, delay)
      }
    }

    checkAuth()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  async function login(credentials: LoginCredentials) {
    const { user } = await authService.login(credentials.email, credentials.password)
    setUser(user)
  }

  async function register(data: RegisterData) {
    const { user } = await authService.register(data)
    setUser(user)
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, isLoading, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
