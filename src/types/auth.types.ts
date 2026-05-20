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
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  referralCode?: string
}
