import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { groupKeys } from '@/hooks/useGroups'
import { useAuth } from '@/hooks/useAuth'
import { leaveGroup } from '@/services/groups.service'
import { clearLastAccessedGroup } from '@/services/last-group.service'
import type { LeaveGroupResult } from '@/types/group.types'

export function useLeaveGroup(groupId: string) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()

  return useMutation<LeaveGroupResult, Error, void>({
    mutationFn: () => leaveGroup(groupId),
    onSuccess: () => {
      if (user) clearLastAccessedGroup(user.id)
      void qc.invalidateQueries({ queryKey: groupKeys.lists() })
      void qc.invalidateQueries({ queryKey: groupKeys.detail(groupId) })
      navigate('/', { replace: true })
    },
  })
}
