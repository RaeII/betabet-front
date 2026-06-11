import { useQuery } from '@tanstack/react-query'
import { getGroupRanking, getGroupLiveRanking, getGroupUserBreakdown } from '@/services/groups.service'

export const rankingKeys = {
  group: (groupId: string) => ['ranking', groupId] as const,
  live: (groupId: string) => ['ranking', groupId, 'live'] as const,
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
 * Pontos provisórios ao vivo de TODOS os membros, para o overlay em tempo real
 * do ranking. Polla a cada 60s **enquanto montado** — alinhado ao cache TTL do
 * `/live` (2 min) e ao `useGroupRanking`; pausa com a aba em segundo plano. Como
 * o hook vive dentro do `GroupRanking`, o polling só ocorre enquanto a tela do
 * ranking está aberta — e detecta sozinho uma partida que comece a rolar com a
 * página já aberta (não depende do `useGroupMatches` revalidar).
 *
 * É barato no ocioso: quando nada está ao vivo, o backend só roda uma query
 * indexada por `status='live'` (retorna vazio, sem chamar a API-Football) e o
 * front não aplica overlay nenhum (`hasLiveMatch=false`).
 */
export function useGroupLiveRanking(groupId: string) {
  return useQuery({
    queryKey: rankingKeys.live(groupId),
    queryFn: () => getGroupLiveRanking(groupId),
    enabled: !!groupId,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
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
