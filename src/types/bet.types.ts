import type { User } from './auth.types'

export type BetOutcome = 'home' | 'draw' | 'away'

export interface Bet {
  id: string
  matchId: string
  userId: string
  groupId: string
  homeScore: number
  awayScore: number
  resultPoints: number | null
  exactScorePoints: number | null
  createdAt: string
  updatedAt: string
}

export interface BetWithUser extends Bet {
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
  reactions: EmojiReaction[]
}

export interface BetFormData {
  homeScore: number
  awayScore: number
  replicateToAllGroups: boolean
}

export interface PlaceBetRequest {
  matchId: string
  groupId: string
  homeScore: number
  awayScore: number
  replicateToAllGroups: boolean
}

export interface EmojiReaction {
  id: string
  betId: string
  userId: string
  emoji: string
  createdAt: string
}

export const ALLOWED_EMOJIS = ['🔥', '❤️', '😂', '😮', '👎', '🏆'] as const
export type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number]
