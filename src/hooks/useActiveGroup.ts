import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGroup, useUserGroups } from '@/hooks/useGroups'
import { setLastAccessedGroup } from '@/services/last-group.service'
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
  const groupQuery = useGroup(groupId ?? '')
  const userGroupsQuery = useUserGroups()

  useEffect(() => {
    if (user && groupId) {
      setLastAccessedGroup(user.id, groupId)
    }
  }, [user, groupId])

  if (!groupId) {
    return { groupId: null, group: null, role: null, isAdmin: false }
  }

  const group =
    groupQuery.data?.group ??
    userGroupsQuery.data?.groups?.find(g => g.id === groupId) ??
    null
  const apiRole = groupQuery.data?.role as GroupRole | undefined
  const derivedRole = group && user?.id === group.adminId ? 'admin' : null
  const role = apiRole ?? derivedRole

  return {
    groupId,
    group,
    role,
    isAdmin: role === 'admin',
  }
}
