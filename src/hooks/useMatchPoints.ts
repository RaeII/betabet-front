import { useQueries, useQuery } from '@tanstack/react-query'
import { getMatchMyPoints, type MatchMyPoints } from '@/services/matchPoints.service'
import { useGroupMatches } from '@/hooks/useGroupMatches'

export const matchPointsKeys = {
  all: ['match-points'] as const,
  detail: (matchId: string, groupId: string) =>
    [...matchPointsKeys.all, matchId, groupId] as const,
}

/**
 * Enquanto a partida está ao vivo (ou terminou mas ainda não foi liquidada no
 * banco), os pontos são provisórios e mudam com o placar — pollamos a cada 60s
 * junto com `/live` (o backend cacheia 2 min, então hits frequentes só leem
 * cache). Uma vez `confirmed=true` o valor é definitivo: paramos de pollar.
 * Doc `011-match-my-points.md` → "Recomendação de polling no front".
 */
function pointsRefetchInterval(data: MatchMyPoints | undefined): number | false {
  if (!data) return false
  if (data.state === 'live') return 60_000
  if (data.state === 'finished' && !data.matchPoints.confirmed) return 60_000
  return false
}

export function useMatchMyPoints(matchId: string, groupId: string, enabled = true) {
  return useQuery({
    queryKey: matchPointsKeys.detail(matchId, groupId),
    queryFn: () => getMatchMyPoints(matchId, groupId),
    enabled: enabled && !!matchId && !!groupId,
    refetchInterval: query => pointsRefetchInterval(query.state.data),
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  })
}

export interface GroupLivePoints {
  /** Pontos provisórios (não confirmados) que o usuário está fazendo agora,
   *  somados entre todas as partidas ao vivo do grupo. */
  liveDelta: number
  /** Quantas partidas ao vivo estão contribuindo com pontos provisórios. */
  liveMatchCount: number
  /** Há ao menos uma partida ao vivo no grupo (mesmo que rendendo 0 pontos). */
  hasLiveMatch: boolean
}

/**
 * Soma os pontos provisórios do usuário autenticado entre as partidas que estão
 * **realmente em andamento** no grupo. Alimenta o overlay "ao vivo" do ranking.
 *
 * Cuidado central: `status === 'live'` no banco NÃO significa "jogo rolando" —
 * a partida fica nesse status entre o apito (upstream FT/AET/PEN) e a liquidação
 * do admin. Por isso filtramos apenas as **candidatas** pelo status do banco e
 * deixamos o `state` autoritativo do `/my-points` (que consulta o upstream)
 * decidir o que é ao vivo de verdade. Uma partida encerrada-mas-não-liquidada
 * volta com `state: 'finished'` e fica de fora do overlay — seus pontos entram
 * no ranking quando a liquidação confirmar (o que ocorre logo em seguida).
 *
 * Pontos já `confirmed` também ficam de fora: já entram no total do `/ranking`,
 * então somá-los aqui contaria em dobro (e `state === 'live'` sempre vem com
 * `confirmed: false`, então não há risco no somatório abaixo).
 */
export function useGroupLiveMyPoints(groupId: string): GroupLivePoints {
  const { data } = useGroupMatches(groupId)
  const candidateMatches = (data?.matches ?? []).filter(m => m.status === 'live')

  const results = useQueries({
    queries: candidateMatches.map(m => ({
      queryKey: matchPointsKeys.detail(m.id, groupId),
      queryFn: () => getMatchMyPoints(m.id, groupId),
      enabled: !!groupId,
      refetchInterval: (query: { state: { data?: MatchMyPoints } }) =>
        pointsRefetchInterval(query.state.data),
      refetchIntervalInBackground: false,
      staleTime: 30_000,
    })),
  })

  const liveResults = results.filter(r => r.data?.state === 'live')
  const liveDelta = liveResults.reduce((sum, r) => sum + (r.data?.matchPoints.total ?? 0), 0)

  return {
    liveDelta,
    liveMatchCount: liveResults.length,
    hasLiveMatch: liveResults.length > 0,
  }
}
