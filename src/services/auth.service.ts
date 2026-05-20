import { apiGet, apiPost } from './api'
import type { User } from '@/types/auth.types'

export function getMe(): Promise<{ user: User }> {
  return apiGet('/api/auth/me')
}

export function login(email: string, password: string): Promise<{ user: User }> {
  return apiPost('/api/auth/login', { email, password })
}

export function register(data: {
  name: string
  email: string
  password: string
  referralCode?: string
}): Promise<{ user: User }> {
  return apiPost('/api/auth/register', data)
}

export function logout(): Promise<{ ok: boolean }> {
  return apiPost('/api/auth/logout')
}
