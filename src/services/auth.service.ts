import { apiGet, apiPost, apiPut } from './api'
import type { AuthCodeChallenge, RegisterData, UpdateProfileData, User, VerifyAuthCodeData } from '@/types/auth.types'

export function getMe(): Promise<{ user: User }> {
  return apiGet('/api/auth/me')
}

export function updateProfile(data: UpdateProfileData): Promise<{ user: User }> {
  return apiPut('/api/auth/me', data)
}

export function requestLoginCode(email: string): Promise<AuthCodeChallenge> {
  return apiPost('/api/auth/login/request-code', { email })
}

export function verifyLoginCode(data: VerifyAuthCodeData): Promise<{ user: User }> {
  return apiPost('/api/auth/login/verify-code', data)
}

export function requestRegisterCode(data: RegisterData): Promise<AuthCodeChallenge> {
  return apiPost('/api/auth/register/request-code', data)
}

export function verifyRegisterCode(data: VerifyAuthCodeData): Promise<{ user: User }> {
  return apiPost('/api/auth/register/verify-code', data)
}

export function logout(): Promise<{ ok: boolean }> {
  return apiPost('/api/auth/logout')
}
