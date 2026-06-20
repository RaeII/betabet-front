import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { AuthCodeChallenge, RegisterData, User, VerifyAuthCodeData } from '@/types/auth.types'
import * as authService from '@/services/auth.service'
import { removeCurrentPushSubscription } from '@/services/notification.service'
import { ApiRequestError } from '@/services/api'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  requestLoginCode: (email: string) => Promise<AuthCodeChallenge>
  verifyLoginCode: (data: VerifyAuthCodeData) => Promise<void>
  requestRegisterCode: (data: RegisterData) => Promise<AuthCodeChallenge>
  verifyRegisterCode: (data: VerifyAuthCodeData) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

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

  async function requestLoginCode(email: string) {
    return authService.requestLoginCode(email)
  }

  async function verifyLoginCode(data: VerifyAuthCodeData) {
    queryClient.clear()
    const { user } = await authService.verifyLoginCode(data)
    setUser(user)
  }

  async function requestRegisterCode(data: RegisterData) {
    return authService.requestRegisterCode(data)
  }

  async function verifyRegisterCode(data: VerifyAuthCodeData) {
    queryClient.clear()
    const { user } = await authService.verifyRegisterCode(data)
    setUser(user)
  }

  async function logout() {
    await removeCurrentPushSubscription().catch(() => undefined)
    await authService.logout()
    setUser(null)
    queryClient.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        requestLoginCode,
        verifyLoginCode,
        requestRegisterCode,
        verifyRegisterCode,
        logout,
        setUser,
      }}
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
