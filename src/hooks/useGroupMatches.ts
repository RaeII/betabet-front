import { useQuery } from '@tanstack/react-query'
import { groupKeys } from '@/hooks/useGroups'
import { getGroupMatches } from '@/services/groups.service'

export function useGroupMatches(groupId: string) {
  return useQuery({
    queryKey: groupKeys.matches(groupId),
    queryFn: () => getGroupMatches(groupId),
    enabled: !!groupId,
    staleTime: 30_000,
  })
}
