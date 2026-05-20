import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editBet, placeBet, toggleReaction } from '@/services/bets.service'
import { matchKeys } from './useMatches'
import type { PlaceBetRequest } from '@/types/bet.types'

export function usePlaceBet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PlaceBetRequest) => placeBet(data),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: matchKeys.detail(variables.matchId) })
    },
  })
}

export function useEditBet(matchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ betId, homeScore, awayScore }: { betId: string; homeScore: number; awayScore: number }) =>
      editBet(betId, homeScore, awayScore),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: matchKeys.detail(matchId) })
    },
  })
}

export function useToggleReaction() {
  return useMutation({
    mutationFn: ({ betId, emoji }: { betId: string; emoji: string }) =>
      toggleReaction(betId, emoji),
  })
}
