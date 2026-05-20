import { apiPost, apiPut } from './api'
import type { Bet, BetWithUser, EmojiReaction, PlaceBetRequest } from '@/types/bet.types'

export function placeBet(data: PlaceBetRequest): Promise<{ bets: Bet[] }> {
  return apiPost('/api/bets', data)
}

export function editBet(betId: string, homeScore: number, awayScore: number): Promise<{ bet: Bet }> {
  return apiPut(`/api/bets/${betId}`, { homeScore, awayScore })
}

export function getGroupMatchBets(
  groupId: string,
  matchId: string,
): Promise<{ bets: BetWithUser[]; canView: boolean }> {
  return apiPost(`/api/groups/${groupId}/matches/${matchId}/bets`)
}

export function toggleReaction(
  betId: string,
  emoji: string,
): Promise<{ reactions: EmojiReaction[] }> {
  return apiPost(`/api/bets/${betId}/reactions`, { emoji })
}
