import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as championBetService from '@/services/champion-bet.service'
import type { ChampionBetInput } from '@/types/champion-bet.types'

export const championBetKeys = {
  all: ['champion-bet'] as const,
  forGroup: (groupId: string) => [...championBetKeys.all, groupId] as const,
}

export function useChampionBet(groupId: string) {
  return useQuery({
    queryKey: championBetKeys.forGroup(groupId),
    queryFn: () => championBetService.getChampionBet(groupId),
    enabled: !!groupId,
    staleTime: 30_000,
  })
}

export function useUpsertChampionBet(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ChampionBetInput) =>
      championBetService.upsertChampionBet(groupId, data),
    onSuccess: state => {
      qc.setQueryData(championBetKeys.forGroup(groupId), state)
    },
  })
}
