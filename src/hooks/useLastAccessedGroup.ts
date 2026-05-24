import { useAuth } from '@/hooks/useAuth'
import { useUserGroups } from '@/hooks/useGroups'
import { getLastAccessedGroup } from '@/services/last-group.service'
import type { LastAccessedGroupResolution } from '@/types/last-group.types'

export function useLastAccessedGroup(): LastAccessedGroupResolution {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { data, isLoading } = useUserGroups()

  if (isAuthLoading || isLoading) {
    return { groupId: null, isReady: false, reason: 'none' }
  }

  const groups = data?.groups ?? []

  if (groups.length === 0 || !user) {
    return { groupId: null, isReady: true, reason: 'none' }
  }

  if (groups.length === 1) {
    return { groupId: groups[0].id, isReady: true, reason: 'single' }
  }

  const storedId = getLastAccessedGroup(user.id)
  const stored = storedId && groups.find(g => g.id === storedId)

  if (stored) {
    return { groupId: stored.id, isReady: true, reason: 'stored' }
  }

  return { groupId: groups[0].id, isReady: true, reason: 'fallback' }
}
