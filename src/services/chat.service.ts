import { apiGet, apiPost, apiPut } from './api'
import type {
  GroupChatMessage,
  GroupChatMessagesResponse,
  GroupChatState,
} from '@/types/group-chat.types'

export interface GroupChatMessagesParams {
  limit?: number
  beforeId?: string
  afterId?: string
}

function chatBase(groupId: string) {
  return `/api/groups/${encodeURIComponent(groupId)}/chat`
}

export function getGroupChatState(groupId: string): Promise<GroupChatState> {
  return apiGet(`${chatBase(groupId)}/state`)
}

export function getGroupChatMessages(
  groupId: string,
  params: GroupChatMessagesParams = {},
): Promise<GroupChatMessagesResponse> {
  const search = new URLSearchParams()
  if (params.limit) search.set('limit', String(params.limit))
  if (params.beforeId) search.set('beforeId', params.beforeId)
  if (params.afterId) search.set('afterId', params.afterId)
  const suffix = search.toString() ? `?${search.toString()}` : ''
  return apiGet(`${chatBase(groupId)}/messages${suffix}`)
}

export function sendGroupChatMessage(
  groupId: string,
  body: string,
): Promise<{ message: GroupChatMessage }> {
  return apiPost(`${chatBase(groupId)}/messages`, { body })
}

export function updateGroupChatReadState(
  groupId: string,
  lastSeenMessageId: string,
): Promise<GroupChatState> {
  return apiPut(`${chatBase(groupId)}/read-state`, { lastSeenMessageId })
}

export function createGroupChatEventSource(groupId: string): EventSource {
  return new EventSource(`${chatBase(groupId)}/events`, { withCredentials: true })
}
