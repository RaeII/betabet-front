import { useQuery } from '@tanstack/react-query'
import { getWorldCupStandings } from '@/services/worldCup.service'

export const worldCupKeys = {
  all: ['world-cup'] as const,
  standings: () => [...worldCupKeys.all, 'standings'] as const,
}

export function useWorldCupStandings() {
  return useQuery({
    queryKey: worldCupKeys.standings(),
    queryFn: getWorldCupStandings,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 30 * 1000,
  })
}
