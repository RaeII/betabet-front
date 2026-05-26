import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as groupsService from '@/services/groups.service'
import type { CreateGroupData, UpdateGroupData } from '@/types/group.types'

export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  detail: (id: string) => [...groupKeys.all, 'detail', id] as const,
  members: (id: string) => [...groupKeys.all, 'members', id] as const,
  requests: (id: string) => [...groupKeys.all, 'requests', id] as const,
  myRequests: () => [...groupKeys.all, 'my-requests'] as const,
  matches: (id: string) => [...groupKeys.all, 'matches', id] as const,
}

export function useJoinByCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const { group } = await groupsService.resolveInviteCode(code)
      const result = await groupsService.joinGroup(group.id, code)
      return { ...result, group }
    },
    onSuccess: () => {
      void qc.refetchQueries({ queryKey: groupKeys.lists() })
      void qc.invalidateQueries({ queryKey: groupKeys.myRequests() })
    },
  })
}

export function useMyJoinRequests(enabled = true) {
  return useQuery({
    queryKey: groupKeys.myRequests(),
    queryFn: groupsService.getMyJoinRequests,
    enabled,
  })
}

export function useUserGroups() {
  return useQuery({
    queryKey: groupKeys.lists(),
    queryFn: groupsService.getUserGroups,
  })
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: () => groupsService.getGroup(groupId),
    enabled: !!groupId,
  })
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: () => groupsService.getGroupMembers(groupId),
    enabled: !!groupId,
  })
}

export function useJoinRequests(groupId: string, isAdmin: boolean) {
  return useQuery({
    queryKey: groupKeys.requests(groupId),
    queryFn: () => groupsService.getJoinRequests(groupId),
    enabled: !!groupId && isAdmin,
    refetchInterval: !!groupId && isAdmin ? 30000 : false,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroupData) => groupsService.createGroup(data),
    onSuccess: () => qc.refetchQueries({ queryKey: groupKeys.lists() }),
  })
}

export function useUpdateGroup(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateGroupData) => groupsService.updateGroup(groupId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupKeys.detail(groupId) }),
  })
}

export function useRemoveMember(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => groupsService.removeMember(groupId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupKeys.members(groupId) }),
  })
}

export function useHandleJoinRequest(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: 'approve' | 'reject' }) =>
      groupsService.handleJoinRequest(groupId, requestId, action),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: groupKeys.requests(groupId) })
      void qc.invalidateQueries({ queryKey: groupKeys.members(groupId) })
    },
  })
}
