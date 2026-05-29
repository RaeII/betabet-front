import { apiDelete, apiGet, apiPost, apiPut } from './api'
import type {
  BettingGroup,
  GroupMembership,
  InvitePreviewGroup,
  JoinRequest,
  LeaveGroupResult,
  MyJoinRequest,
  RankingEntry,
} from '@/types/group.types'
import type { CreateGroupData, UpdateGroupData } from '@/types/group.types'
import type { GroupMatchesResponse, RankingBreakdown } from '@/types/match.types'

export function getUserGroups(): Promise<{ groups: BettingGroup[] }> {
  return apiGet('/api/groups')
}

export function getGroup(groupId: string): Promise<{ group: BettingGroup; role: string }> {
  return apiGet(`/api/groups/${groupId}`)
}

export function createGroup(data: CreateGroupData): Promise<{ group: BettingGroup }> {
  return apiPost('/api/groups', data)
}

export function updateGroup(groupId: string, data: UpdateGroupData): Promise<{ group: BettingGroup }> {
  return apiPut(`/api/groups/${groupId}`, data)
}

export function getGroupMembers(groupId: string): Promise<{ members: GroupMembership[] }> {
  return apiGet(`/api/groups/${groupId}/members`)
}

export function removeMember(groupId: string, userId: string): Promise<{ ok: boolean }> {
  return apiDelete(`/api/groups/${groupId}/members/${userId}`)
}

export function getGroupRanking(groupId: string): Promise<{ ranking: RankingEntry[]; updatedAt: string }> {
  return apiGet(`/api/groups/${groupId}/ranking`)
}

export function generateInviteLink(groupId: string): Promise<{ inviteCode: string; link: string }> {
  return apiPost(`/api/groups/${groupId}/invite-link`)
}

export function resolveInviteCode(code: string): Promise<{ group: InvitePreviewGroup }> {
  return apiGet(`/api/groups/invite/${code}`)
}

export function joinGroup(groupId: string, inviteCode: string): Promise<{ joined: boolean; pending: boolean }> {
  return apiPost(`/api/groups/${groupId}/join`, { inviteCode })
}

export function getJoinRequests(groupId: string): Promise<{ requests: JoinRequest[] }> {
  return apiGet(`/api/groups/${groupId}/requests`)
}

export function getMyJoinRequests(): Promise<{ requests: MyJoinRequest[] }> {
  return apiGet('/api/groups/my-requests')
}

export function handleJoinRequest(
  groupId: string,
  requestId: string,
  action: 'approve' | 'reject',
): Promise<{ ok: boolean }> {
  return apiPut(`/api/groups/${groupId}/requests/${requestId}`, { action })
}

export function leaveGroup(groupId: string): Promise<LeaveGroupResult> {
  return apiPost(`/api/groups/${groupId}/leave`)
}

export function getGroupMatches(groupId: string): Promise<GroupMatchesResponse> {
  return apiGet(`/api/groups/${groupId}/matches`)
}

export function getGroupUserBreakdown(groupId: string, userId: string): Promise<RankingBreakdown> {
  return apiGet(`/api/groups/${groupId}/users/${userId}/breakdown`)
}
