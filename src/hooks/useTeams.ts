import { useQuery } from '@tanstack/react-query'
import { getTeams } from '@/services/teams.service'

export const teamKeys = {
  all: ['teams'] as const,
  list: () => [...teamKeys.all, 'list'] as const,
}

export function useTeams(enabled = true) {
  return useQuery({
    queryKey: teamKeys.list(),
    queryFn: getTeams,
    enabled,
    staleTime: 5 * 60_000,
  })
}
