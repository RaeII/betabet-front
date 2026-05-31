import { useQueries } from '@tanstack/react-query'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { matchKeys } from '@/hooks/useMatches'
import { getMatchLive } from '@/services/liveMatch.service'

/**
 * `status === 'live'` no banco cobre a janela entre o apito final upstream e a
 * liquidação local. Para indicadores de UI, o estado autoritativo é o `/live`.
 */
export function useGroupHasLiveMatch(groupId: string): boolean {
  const { data } = useGroupMatches(groupId)
  const candidateMatches = (data?.matches ?? []).filter(match => match.status === 'live')

  const liveQueries = useQueries({
    queries: candidateMatches.map(match => ({
      queryKey: matchKeys.live(match.id),
      queryFn: () => getMatchLive(match.id),
      enabled: !!groupId && !!match.id,
      refetchInterval: 60 * 1000,
      refetchIntervalInBackground: false,
      staleTime: 30 * 1000,
    })),
  })

  return liveQueries.some(query => query.data?.isLive === true)
}
