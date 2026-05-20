import { useQuery } from '@tanstack/react-query'
import { getGroupRanking } from '@/services/groups.service'

export const rankingKeys = {
  group: (groupId: string) => ['ranking', groupId] as const,
}

export function useGroupRanking(groupId: string) {
  return useQuery({
    queryKey: rankingKeys.group(groupId),
    queryFn: () => getGroupRanking(groupId),
    enabled: !!groupId,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
}
