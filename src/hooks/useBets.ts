import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editBet, placeBet, toggleReaction } from '@/services/bets.service'
import { matchKeys } from './useMatches'
import { groupKeys } from './useGroups'
import type { Bet, PlaceBetRequest } from '@/types/bet.types'
import type { GroupMatchesResponse, MatchWithUserBet } from '@/types/match.types'

function patchUserBet(
  prev: GroupMatchesResponse | undefined,
  matchId: string,
  bet: Bet,
): GroupMatchesResponse | undefined {
  if (!prev) return prev
  return {
    matches: prev.matches.map(m => (m.id === matchId ? { ...m, userBet: bet } : m)),
  }
}

function buildOptimisticBet(
  matchId: string,
  groupId: string,
  homeScore: number,
  awayScore: number,
  existing: Bet | null,
): Bet {
  const now = new Date().toISOString()
  return {
    id: existing?.id ?? `optimistic-${matchId}-${Date.now()}`,
    matchId,
    userId: existing?.userId ?? 'me',
    groupId,
    homeScore,
    awayScore,
    resultPoints: null,
    exactScorePoints: null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

export function usePlaceBet() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: PlaceBetRequest) => placeBet(data),
    onMutate: async vars => {
      const key = groupKeys.matches(vars.groupId)
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<GroupMatchesResponse>(key)
      qc.setQueryData<GroupMatchesResponse>(key, prev => {
        if (!prev) return prev
        const match = prev.matches.find(m => m.id === vars.matchId)
        const optimistic = buildOptimisticBet(
          vars.matchId,
          vars.groupId,
          vars.homeScore,
          vars.awayScore,
          (match as MatchWithUserBet | undefined)?.userBet ?? null,
        )
        return patchUserBet(prev, vars.matchId, optimistic)
      })
      return { previous, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && ctx.key) {
        qc.setQueryData(ctx.key, ctx.previous)
      }
    },
    onSettled: (_data, _err, vars) => {
      void qc.invalidateQueries({ queryKey: groupKeys.matches(vars.groupId) })
      void qc.invalidateQueries({ queryKey: matchKeys.detail(vars.matchId) })
    },
  })
}

interface EditBetVariables {
  betId: string
  homeScore: number
  awayScore: number
  matchId?: string
  groupId?: string
}

export function useEditBet(matchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ betId, homeScore, awayScore }: EditBetVariables) =>
      editBet(betId, homeScore, awayScore),
    onMutate: async vars => {
      if (!vars.groupId || !vars.matchId) return { previous: undefined, key: undefined }
      const key = groupKeys.matches(vars.groupId)
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<GroupMatchesResponse>(key)
      qc.setQueryData<GroupMatchesResponse>(key, prev => {
        if (!prev) return prev
        const match = prev.matches.find(m => m.id === vars.matchId)
        const optimistic = buildOptimisticBet(
          vars.matchId!,
          vars.groupId!,
          vars.homeScore,
          vars.awayScore,
          (match as MatchWithUserBet | undefined)?.userBet ?? null,
        )
        return patchUserBet(prev, vars.matchId!, optimistic)
      })
      return { previous, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && ctx.key) {
        qc.setQueryData(ctx.key, ctx.previous)
      }
    },
    onSettled: (_data, _err, vars) => {
      if (vars.groupId) {
        void qc.invalidateQueries({ queryKey: groupKeys.matches(vars.groupId) })
      }
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
