import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGroup, useUserGroups } from '@/hooks/useGroups'
import { getLastAccessedGroup, setLastAccessedGroup } from '@/services/last-group.service'
import type { BettingGroup, GroupRole } from '@/types/group.types'

export interface ActiveGroup {
  groupId: string | null
  group: BettingGroup | null
  role: GroupRole | null
  isAdmin: boolean
}

export function useActiveGroup(): ActiveGroup {
  const { groupId } = useParams<{ groupId: string }>()
  const { user } = useAuth()
  const userGroupsQuery = useUserGroups()
  const userGroups = userGroupsQuery.data?.groups ?? []
  const storedGroupId = user ? getLastAccessedGroup(user.id) : null
  const fallbackGroupId =
    storedGroupId && userGroups.some(group => group.id === storedGroupId)
      ? storedGroupId
      : userGroups[0]?.id ?? null
  const activeGroupId = groupId ?? fallbackGroupId
  const groupQuery = useGroup(activeGroupId ?? '')

  useEffect(() => {
    if (user && groupId) {
      setLastAccessedGroup(user.id, groupId)
    }
  }, [user, groupId])

  if (!activeGroupId) {
    return { groupId: null, group: null, role: null, isAdmin: false }
  }

  const group =
    groupQuery.data?.group ??
    userGroups.find(g => g.id === activeGroupId) ??
    null
  const apiRole = groupQuery.data?.role as GroupRole | undefined
  const derivedRole = group && user?.id === group.adminId ? 'admin' : null
  const role = apiRole ?? derivedRole

  return {
    groupId: activeGroupId,
    group,
    role,
    isAdmin: role === 'admin',
  }
}
