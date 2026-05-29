import { useQuery } from '@tanstack/react-query'
import { getGroupRanking, getGroupUserBreakdown } from '@/services/groups.service'

export const rankingKeys = {
  group: (groupId: string) => ['ranking', groupId] as const,
  breakdown: (groupId: string, userId: string) =>
    ['ranking', groupId, 'breakdown', userId] as const,
}

export function useGroupRanking(groupId: string) {
  return useQuery({
    queryKey: rankingKeys.group(groupId),
    queryFn: () => getGroupRanking(groupId),
    enabled: !!groupId,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
}

/**
 * Detalhamento das partidas/palpites de um membro para validar seus pontos no
 * ranking. `enabled` é controlado pelo modal (só busca quando aberto). Os
 * pontos exibidos são os definitivos do palpite — sem polling.
 */
export function useGroupUserBreakdown(groupId: string, userId: string, enabled = true) {
  return useQuery({
    queryKey: rankingKeys.breakdown(groupId, userId),
    queryFn: () => getGroupUserBreakdown(groupId, userId),
    enabled: enabled && !!groupId && !!userId,
    staleTime: 30_000,
  })
}
