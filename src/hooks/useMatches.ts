import { useQuery } from '@tanstack/react-query'
import { getAllMatches, getMatch, getMatchDistribution, getMatches } from '@/services/matches.service'

export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
  distribution: (id: string) => [...matchKeys.all, 'distribution', id] as const,
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

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: matchKeys.detail(matchId),
    queryFn: () => getMatch(matchId),
    enabled: !!matchId,
  })
}

export function useMatchDistribution(matchId: string, enabled: boolean) {
  return useQuery({
    queryKey: matchKeys.distribution(matchId),
    queryFn: () => getMatchDistribution(matchId),
    enabled: enabled && !!matchId,
  })
}
