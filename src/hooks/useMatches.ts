import { useQuery } from '@tanstack/react-query'
import { getAllMatches, getMatch, getMatchDistribution, getMatches } from '@/services/matches.service'
import { getMatchPreview } from '@/services/matchPreview.service'
import { getMatchLive } from '@/services/liveMatch.service'
import { getMatchPostMatch } from '@/services/postMatch.service'

export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
  distribution: (id: string) => [...matchKeys.all, 'distribution', id] as const,
  preview: (id: string) => [...matchKeys.all, 'preview', id] as const,
  live: (id: string) => [...matchKeys.all, 'live', id] as const,
  postMatch: (id: string) => [...matchKeys.all, 'post-match', id] as const,
}

export function useMatchesByPhase() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: getMatches,
  })
}

export function useAllMatches() {
  return useQuery({
    queryKey: [...matchKeys.lists(), 'flat'] as const,
    queryFn: getAllMatches,
  })
}

export function useMatch(matchId: string, enabled = true) {
  return useQuery({
    queryKey: matchKeys.detail(matchId),
    queryFn: () => getMatch(matchId),
    enabled: enabled && !!matchId,
  })
}

export function useMatchDistribution(matchId: string, enabled: boolean) {
  return useQuery({
    queryKey: matchKeys.distribution(matchId),
    queryFn: () => getMatchDistribution(matchId),
    enabled: enabled && !!matchId,
  })
}

export function useMatchPreview(matchId: string, enabled = true) {
  return useQuery({
    queryKey: matchKeys.preview(matchId),
    queryFn: () => getMatchPreview(matchId),
    enabled: enabled && !!matchId,
    staleTime: 60 * 60 * 1000, // 1h — bate com o TTL upstream de predictions/injuries
  })
}

/**
 * Live match data. Polling a cada 60s — o cache do backend é 2 min para
 * status live, então hits mais rápidos só devolvem cache. Atende à
 * recomendação do doc 006 (`polling não precisa ser mais rápido do que 2 min`).
 */
export function useMatchLive(matchId: string, enabled = true) {
  return useQuery({
    queryKey: matchKeys.live(matchId),
    queryFn: () => getMatchLive(matchId),
    enabled: enabled && !!matchId,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 30 * 1000,
  })
}

/**
 * Post-match snapshot — lido do banco no backend (sem cota da API-Football).
 * Imutável após salvo pelo cron, então usamos staleTime longo e desligamos
 * o polling. Retorna `hasPostMatchData=false` enquanto o cron não capturou.
 */
export function useMatchPostMatch(matchId: string, enabled = true) {
  return useQuery({
    queryKey: matchKeys.postMatch(matchId),
    queryFn: () => getMatchPostMatch(matchId),
    enabled: enabled && !!matchId,
    staleTime: 30 * 60 * 1000,
  })
}
