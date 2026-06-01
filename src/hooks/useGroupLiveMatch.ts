import { useQueries } from '@tanstack/react-query'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { matchKeys } from '@/hooks/useMatches'
import { getMatchLive } from '@/services/liveMatch.service'

interface GroupLiveMatchOptions {
  enabled?: boolean
  suppressWhenViewingMatchId?: string | null
}

/**
 * `status === 'live'` no banco cobre a janela entre o apito final upstream e a
 * liquidação local. Para indicadores de UI, o estado autoritativo é o `/live`.
 */
export function useGroupHasLiveMatch(
  groupId: string,
  options: GroupLiveMatchOptions = {},
): boolean {
  const enabled = options.enabled ?? true
  const { data } = useGroupMatches(enabled ? groupId : '')
  const candidateMatches = (data?.matches ?? []).filter(match => match.status === 'live')

  const liveQueries = useQueries({
    queries: candidateMatches.map(match => ({
      queryKey: matchKeys.live(match.id),
      queryFn: () => getMatchLive(match.id),
      enabled: enabled && !!groupId && !!match.id,
      refetchInterval: 60 * 1000,
      refetchIntervalInBackground: false,
      staleTime: 30 * 1000,
    })),
  })

  const liveMatchIds = liveQueries
    .map((query, index) => (query.data?.isLive === true ? candidateMatches[index]?.id : null))
    .filter((matchId): matchId is string => Boolean(matchId))

  if (
    options.suppressWhenViewingMatchId &&
    liveMatchIds.includes(options.suppressWhenViewingMatchId)
  ) {
    return false
  }

  return liveMatchIds.length > 0
}
