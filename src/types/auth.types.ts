export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  referralCode: string
  referredByCode: string | null
  referralCount: number
  chartUnlocked: boolean
  isAdmin: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
}

export interface RegisterData {
  name: string
  email: string
  referralCode?: string
}

export interface VerifyAuthCodeData {
  challengeId: string
  code: string
}

export interface UpdateProfileData {
  name?: string
  avatarUrl?: string | null
}

export interface AuthCodeChallenge {
  challengeId: string
  expiresAt: string
  resendAvailableAt: string
  debugCode?: string
}

export interface AdminLoginCredentials {
  email: string
  password: string
}
