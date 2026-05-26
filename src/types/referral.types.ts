export interface ReferralInfo {
  code: string
  link: string
  count: number
  isUnlocked: boolean
  referredUsers: ReferredUser[]
}

export interface ReferredUser {
  id: string
  name: string
  avatarUrl?: string | null
  joinedAt: string
}
